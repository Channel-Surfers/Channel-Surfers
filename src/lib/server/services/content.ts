import { count, countDistinct, eq, sql, desc, asc, isNull } from 'drizzle-orm';
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

interface GenericPostFilter {
    requesterId?: uuid;
    sort: 'votes' | 'date';
    filter: 'subscribed' | 'all';
    reverseSort?: boolean;
    tags?: string[];
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
            tags: sql<
                string[]
            >`array(select distinct * from unnest(array_remove(array_agg(${channelTagsTable.name}), NULL)))`,
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
    switch (filter.sort) {
        case 'date':
            {
                q = q.orderBy(dirFn(postTable.createdOn));
            }
            break;
        case 'votes':
            {
                q = q.orderBy(
                    dirFn(
                        sql<number>`cast(count(distinct ${upvotes.userId}) - count(distinct ${downvotes.userId}) as int)`
                    )
                );
            }
            break;
        default: {
            throw new Error(`invalid filter sort: ${filter.sort}`);
        }
    }

    switch (filter.type) {
        case 'home':
            {
            }
            break;
        case 'channel':
            {
                q = q.where(eq(channelTable.id, filter.channelId));
            }
            break;
        case 'user':
            {
                q = q.where(eq(userTable.username, filter.username));
            }
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
