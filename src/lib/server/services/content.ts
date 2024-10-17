import {
    count,
    countDistinct,
    eq,
    sql,
    desc,
    asc,
    isNull,
    not,
    inArray,
    and,
    gte,
    lte,
} from 'drizzle-orm';
import { array_agg, dedupe_nonull_array } from './utils';
import { PAGE_SIZE } from '$lib';
import type { DB } from '..';
import type { PostData, uuid } from '$lib/types';

import { channelTable } from '../db/channels.sql';
import { channelTagsTable } from '../db/tags.channels.sql';
import { commentTable } from '../db/comments.sql';
import { postTable } from '../db/posts.sql';
import { postTagTable } from '../db/tags.posts.sql';
import { postVoteTable } from '../db/votes.posts.sql';
import { publicChannelTable } from '../db/public.channels.sql';
import { subscriptionTable } from '../db/subscriptions.sql';
import { userBlockTable } from '../db/blocks.users.sql';
import { userTable } from '../db/users.sql';
import {
    channelPostReportTable,
    type NewChannelPostReport,
} from '../db/reports.channels.posts.sql';
import { postReportTable, type NewPostReport, type PostReport } from '../db/reports.posts.sql';

export const getPost = async (db: DB, post_id: uuid) => {
    const [a] = await db
        .select()
        .from(postTable)
        .innerJoin(channelTable, eq(channelTable.id, postTable.channelId))
        .innerJoin(userTable, eq(userTable.id, postTable.createdBy))
        .where(eq(postTable.id, post_id));

    if (!a) return null;

    const { user, post, channel } = a;

    const tags = await db
        .select({ name: channelTagsTable.name, color: channelTagsTable.color })
        .from(postTagTable)
        .innerJoin(channelTagsTable, eq(channelTagsTable.id, postTagTable.tagId))
        .where(eq(postTagTable.postId, post_id));

    return {
        post,
        user,
        channel,
        tags,
        private_channel: false,
    };
};

export const getUserPostVote = async (
    db: DB,
    userId: uuid,
    postId: uuid
): Promise<'UP' | 'DOWN' | null> => {
    const [vote] = await db
        .select({ vote: postVoteTable.vote })
        .from(postVoteTable)
        .where(and(eq(postVoteTable.postId, postId), eq(postVoteTable.userId, userId)));

    return vote?.vote || null;
};

interface GenericPostFilter {
    requesterId?: uuid;
    sort: 'votes' | 'date';
    filter: 'subscribed' | 'all';
    reverseSort?: boolean;
    before?: Date;
    after?: Date;
}

export interface ChannelPostFilter extends GenericPostFilter {
    type: 'channel';
    channelId: uuid;
}

export interface UserPostFilter extends GenericPostFilter {
    type: 'user';
    username: string;
}

export interface HomePostFilter extends GenericPostFilter {
    type: 'home';
}

export type PostFilter = ChannelPostFilter | UserPostFilter | HomePostFilter;

export const getPosts = async (db: DB, page: number, filter: PostFilter): Promise<PostData[]> => {
    let q = db
        .select({
            id: postTable.id,
            title: postTable.title,
            videoId: postTable.videoId,
            createdOn: postTable.createdOn,
            user: {
                id: userTable.id,
                name: userTable.username,
                avatar: userTable.profileImage,
            },
            channel: {
                id: channelTable.id,
                name: channelTable.name,
                private: isNull(publicChannelTable.channelId),
            },
            tags: dedupe_nonull_array(array_agg(channelTagsTable.name)),
            upvotes: postTable.upvotes,
            downvotes: postTable.downvotes,
            comments: count(commentTable.id),
        })
        .from(postTable)
        .innerJoin(userTable, eq(userTable.id, postTable.createdBy))
        .innerJoin(channelTable, eq(channelTable.id, postTable.channelId))
        .leftJoin(publicChannelTable, eq(publicChannelTable.channelId, channelTable.id))
        .leftJoin(postTagTable, eq(postTagTable.postId, postTable.id))
        .leftJoin(channelTagsTable, eq(channelTagsTable.id, postTagTable.tagId))
        .leftJoin(commentTable, eq(commentTable.postId, postTable.id))
        .groupBy(
            postTable.id,
            postTable.createdOn,
            publicChannelTable.channelId,
            userTable.id,
            userTable.username,
            userTable.profileImage,
            channelTable.id,
            channelTable.name
        )
        .$dynamic();

    // List of conditions, eventually joined by `and`.
    const conditions = [];

    const dirFn = filter.reverseSort ? asc : desc;
    switch (filter.filter) {
        case 'all':
            break;
        case 'subscribed':
            if (!filter.requesterId) break;
            break;
        default:
            throw new Error(`invalid filter: ${filter.sort}`);
    }

    switch (filter.sort) {
        case 'date':
            q = q.orderBy(dirFn(postTable.createdOn));
            break;
        case 'votes':
            q = q.orderBy(dirFn(sql<number>`${postTable.upvotes} - ${postTable.downvotes}`));
            break;
        default:
            throw new Error(`invalid filter sort: ${filter.sort}`);
    }

    if (filter.after) {
        conditions.push(lte(postTable.createdOn, filter.after));
    }

    if (filter.before) {
        conditions.push(gte(postTable.createdOn, filter.before));
    }

    if (filter.requesterId) {
        conditions.push(
            not(
                inArray(
                    userTable.id,
                    db
                        .select({ id: userBlockTable.blockedUserId })
                        .from(userBlockTable)
                        .where(eq(userBlockTable.userId, filter.requesterId))
                )
            )
        );

        if (filter.filter === 'subscribed') {
            const subscribed = db
                .select({ channelId: subscriptionTable.channelId })
                .from(subscriptionTable)
                .where(eq(subscriptionTable.userId, filter.requesterId));
            conditions.push(inArray(postTable.channelId, subscribed));
        }
    }

    switch (filter.type) {
        case 'home':
            break;
        case 'channel':
            conditions.push(eq(channelTable.id, filter.channelId));
            break;
        case 'user':
            conditions.push(eq(userTable.username, filter.username));
            break;
    }

    q = q
        .where(and(...conditions))
        .limit(PAGE_SIZE)
        .offset(page * PAGE_SIZE);

    return (await q).map((p) => ({
        id: p.id,
        title: p.title,
        videoId: p.videoId,
        createdOn: p.createdOn,
        tags: p.tags,
        upvotes: p.upvotes,
        downvotes: p.downvotes,
        comments: p.comments,
        poster: {
            user: {
                ...p.user,
                avatar: p.user.avatar || undefined,
            },
            channel: {
                ...p.channel,
                private: !!p.channel.private,
            },
        },
    }));
};

export const getPostStatistics = async (db: DB) => {
    const numberOfChannelsWithPosts =
        (
            await db
                .selectDistinctOn([channelTable.id], {
                    numberOfChannelsWithPosts: countDistinct(channelTable.id),
                })
                .from(channelTable)
                .innerJoin(postTable, eq(channelTable.id, postTable.channelId))
                .groupBy(channelTable.id)
                .where(gte(postTable.createdOn, sql`now()::date`))
        )[0]?.numberOfChannelsWithPosts ?? 0;

    const numberOfPostsQuery = db
        .select({ numberOfPosts: count(postTable.id) })
        .from(postTable)
        .where(gte(postTable.createdOn, sql`now()::date`));
    const numberOfUpvotesQuery = db
        .select({ numberOfUpvotes: count(postTable.id) })
        .from(postTable)
        .leftJoin(postVoteTable, eq(postTable.id, postVoteTable.postId))
        .where(and(gte(postTable.createdOn, sql`now()::date`), eq(postVoteTable.vote, 'UP')));
    const numberOfDownvotesQuery = db
        .select({ numberOfDownvotes: count(postTable.id) })
        .from(postTable)
        .leftJoin(postVoteTable, eq(postTable.id, postVoteTable.postId))
        .where(and(gte(postTable.createdOn, sql`now()::date`), eq(postVoteTable.vote, 'DOWN')));
    const [[{ numberOfPosts }], [{ numberOfUpvotes }], [{ numberOfDownvotes }]] = await Promise.all(
        [numberOfPostsQuery, numberOfUpvotesQuery, numberOfDownvotesQuery]
    );
    return {
        numberOfChannelsWithPosts,
        numberOfPosts,
        numberOfUpvotes,
        numberOfDownvotes,
    };
};
export type PostStatistics = Awaited<ReturnType<typeof getPostStatistics>>;

export const createChannelReport = async (
    db: DB,
    newChannelPostReport: NewChannelPostReport
): Promise<PostReport> => {
    const [ret] = await db.insert(channelPostReportTable).values(newChannelPostReport).returning();

    return ret;
};

export const createPostReport = async (
    db: DB,
    newPostReport: NewPostReport
): Promise<PostReport> => {
    const [ret] = await db.insert(postReportTable).values(newPostReport).returning();

    return ret;
};

export const deletePostVote = async (db: DB, postId: uuid, userId: uuid) => {
    const [ret] = await db
        .delete(postVoteTable)
        .where(and(eq(postVoteTable.postId, postId), eq(postVoteTable.userId, userId)))
        .returning();

    return ret !== undefined;
};

export const addPostVote = async (db: DB, postId: uuid, userId: uuid, vote: 'UP' | 'DOWN') => {
    const [ret] = await db
        .insert(postVoteTable)
        .values({ postId, userId, vote })
        .onConflictDoUpdate({
            target: [postVoteTable.postId, postVoteTable.userId],
            set: { vote: vote },
        })
        .returning();
    return ret;
};
