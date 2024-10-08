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
} from 'drizzle-orm';
import type { DB } from '..';
import { postTable } from '../db/posts.sql';
import { channelTable } from '../db/channels.sql';
import { postVoteTable } from '../db/votes.posts.sql';
import type { PostData, uuid } from '$lib/types';
import { userTable } from '../db/users.sql';
import { postTagTable } from '../db/tags.posts.sql';
import { channelTagsTable } from '../db/tags.channels.sql';
import { commentTable } from '../db/comments.sql';
import { publicChannelTable } from '../db/public.channels.sql';
import { PAGE_SIZE } from '$lib';
import { array_agg, dedupe_nonull_array } from './utils';
import { userBlockTable } from '../db/blocks.users.sql';
import { subscriptionTable } from '../db/subscriptions.sql';

interface GenericPostFilter {
    requesterId?: uuid;
    sort: 'votes' | 'date';
    filter: 'subscribed' | 'all';
    reverseSort?: boolean;
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
    const upvotes = db
        .select()
        .from(postVoteTable)
        .where(eq(postVoteTable.vote, 'UP'))
        .as('upvotes');
    const downvotes = db
        .select()
        .from(postVoteTable)
        .where(eq(postVoteTable.vote, 'DOWN'))
        .as('downvotes');

    console.log('getPosts', filter);

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
            // The upvote/downvote counting will be better once we get lateral joins.  See: https://github.com/drizzle-team/drizzle-orm/pull/1079
            // The query will end up being something like `SELECT ... FROM post JOIN LATERAL (SELECT COUNT(*) FROM post_vote WHERE post_id = post.id AND vote = 'UP') ON TRUE`
            upvotes: countDistinct(upvotes.userId),
            downvotes: countDistinct(downvotes.userId),
            comments: count(commentTable.id),
        })
        .from(postTable)
        .innerJoin(userTable, eq(userTable.id, postTable.createdBy))
        .innerJoin(channelTable, eq(channelTable.id, postTable.channelId))
        .leftJoin(publicChannelTable, eq(publicChannelTable.channelId, channelTable.id))
        .leftJoin(postTagTable, eq(postTagTable.postId, postTable.id))
        .leftJoin(channelTagsTable, eq(channelTagsTable.id, postTagTable.tagId))
        .leftJoin(upvotes, eq(upvotes.postId, postTable.id))
        .leftJoin(downvotes, eq(downvotes.postId, postTable.id))
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
            q = q.orderBy(
                dirFn(
                    sql<number>`cast(count(distinct ${upvotes.userId}) - count(distinct ${downvotes.userId}) as int)`
                )
            );
            break;
        default:
            throw new Error(`invalid filter sort: ${filter.sort}`);
    }

    if (filter.requesterId) {
        const cond = [
            not(
                inArray(
                    userTable.id,
                    db
                        .select({ id: userBlockTable.blockedUserId })
                        .from(userBlockTable)
                        .where(eq(userBlockTable.userId, filter.requesterId))
                )
            ),
        ];

        if (filter.filter === 'subscribed') {
            const subscribed = db
                .select({ channelId: subscriptionTable.channelId })
                .from(subscriptionTable)
                .where(eq(subscriptionTable.userId, filter.requesterId));
            cond.push(inArray(postTable.channelId, subscribed));
        }
        q = q.where(and(...cond));
    }

    switch (filter.type) {
        case 'home':
            break;
        case 'channel':
            q = q.where(eq(channelTable.id, filter.channelId));
            break;
        case 'user':
            q = q.where(eq(userTable.username, filter.username));
            break;
    }

    q = q.limit(PAGE_SIZE).offset(page * PAGE_SIZE);

    console.log(q.toSQL());

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
