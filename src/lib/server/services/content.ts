import { aliasedTable, and, count, countDistinct, eq, gte, sql, desc } from 'drizzle-orm';
import type { DB } from '..';
import { postTable } from '../db/posts.sql';
import { channelTable } from '../db/channels.sql';
import { postVoteTable } from '../db/votes.posts.sql';
import type { PostData, uuid } from '$lib/types';
import { userTable } from '../db/users.sql';
import { postTagTable } from '../db/tags.posts.sql';
import { channelTagsTable } from '../db/tags.channels.sql';
import { array_agg } from './utils';
import { commentTable } from '../db/comments.sql';

interface GenericPostFilter {
    requesterId?: uuid;
    sort: 'views' | 'votes' | 'date';
    filter: 'subscribed' | 'all';
    reverseSort?: boolean;
    tags?: string[];
}

export interface ChannelPostFilter extends GenericPostFilter {
    type: 'channel';
    channelId: uuid;
}

export interface PrivateChannelPostFilter extends GenericPostFilter {
    type: 'private_channel';
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

const PAGE_SIZE = 10;

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

    switch (filter.type) {
        case 'home': {
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
                        id: userTable.id,
                        name: channelTable.name,
                    },
                    tags: array_agg(channelTagsTable.name),
                    upvotes: count(upvotes.userId),
                    downvotes: count(downvotes.userId),
                    comments: count(commentTable.id),
                })
                .from(postTable)
                .innerJoin(userTable, eq(userTable.id, postTable.createdBy))
                .innerJoin(channelTable, eq(channelTable.id, postTable.channelId))
                .leftJoin(postTagTable, eq(postTagTable.postId, postTable.id))
                .leftJoin(channelTagsTable, eq(channelTagsTable.id, postTagTable.tagId))
                .leftJoin(upvotes, eq(upvotes.postId, postTable.id))
                .leftJoin(downvotes, eq(downvotes.postId, postTable.id))
                .leftJoin(commentTable, eq(commentTable.postId, postTable.id))
                .limit(PAGE_SIZE)
                .offset(page * PAGE_SIZE)
                .groupBy(
                    postTable.id,
                    postTable.createdOn,
                    userTable.id,
                    userTable.username,
                    userTable.profileImage,
                    channelTable.id,
                    channelTable.name,
                )
                .$dynamic();
            switch (filter.sort) {
                case 'date': {
                    q = q.orderBy(desc(postTable.createdOn));
                }; break;
                case 'votes': {
                    q = q.orderBy(desc(sql<number>`cast(count(${upvotes.userId}) - count(${downvotes.userId}) as int)`));
                }; break;
            }
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
                        private: false,
                    },
                },
            }));
        }
        default: {
            throw new Error('nyi');
        }
    }
};
