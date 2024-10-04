import { aliasedTable, and, count, countDistinct, eq, gte, sql } from 'drizzle-orm';
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
    sort?: 'views' | 'votes' | 'date';
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

export const getPosts = async (db: DB, filter: PostFilter): Promise<PostData[]> => {
    switch (filter.type) {
        case 'home': {
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

            const data = await db
                .select({
                    id: postTable.id,
                    title: postTable.title,
                    videoId: postTable.videoId,
                    user: {
                        username: userTable.username,
                        avatar: userTable.profileImage,
                        channel: channelTable.name,
                    },
                    tags: array_agg(channelTagsTable.name),
                    upvotes: count(upvotes.userId),
                    downvotes: count(downvotes.userId),
                    comments: count(commentTable.id),
                })
                .from(postTable)
                .leftJoin(userTable, eq(userTable.id, postTable.createdBy))
                .leftJoin(channelTable, eq(channelTable.id, postTable.channelId))
                .leftJoin(postTagTable, eq(postTagTable.postId, postTable.id))
                .leftJoin(channelTagsTable, eq(channelTagsTable.id, postTagTable.tagId))
                .leftJoin(upvotes, eq(upvotes.postId, postTable.id))
                .leftJoin(downvotes, eq(downvotes.postId, postTable.id))
                .leftJoin(commentTable, eq(commentTable.postId, postTable.id))
                .groupBy(
                    postTable.id,
                    userTable.username,
                    userTable.profileImage,
                    channelTable.name
                );
            return data.map((p) => ({
                ...p,
                user: {
                    username: p.user.username!,
                    avatar: p.user.avatar!,
                    channel: p.user.channel!,
                },
                // tags: p.tags,
                // upvotes: 0,
                // downvotes: 0,
                // comments: 0
            }));
        }
        default: {
            throw new Error('nyi');
        }
    }
};
