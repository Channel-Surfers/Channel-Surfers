import { eq, and, count } from 'drizzle-orm';
import type { uuid } from "$lib/types";
import type { DB } from "..";
import { postTable } from "../db/posts.sql";
import { channelTable } from '../db/channels.sql';
import { postVoteTable } from '../db/votes.posts.sql';
import { postTagTable } from '../db/tags.posts.sql';
import { channelTagsTable } from '../db/tags.channels.sql';
import { userTable } from '../db/users.sql';

export const getPost = async (db: DB, post_id: uuid) => {
    const [a] = await db.select()
        .from(postTable)
        .innerJoin(channelTable, eq(channelTable.id, postTable.channelId))
        .innerJoin(userTable, eq(userTable.id, postTable.createdBy))
        .where(eq(postTable.id, post_id));

    if (!a) return null;

    const { user, post, channel } = a;

    const [{ upvotes }] = await db
        .select({ upvotes: count() })
        .from(postVoteTable)
        .where(and(eq(postVoteTable.postId, post.id), eq(postVoteTable.vote, 'UP')))

    const [{ downvotes }] = await db
        .select({ downvotes: count() })
        .from(postVoteTable)
        .where(and(eq(postVoteTable.postId, post.id), eq(postVoteTable.vote, 'DOWN')))

    const tags = await db
        .select({ name: channelTagsTable.name, color: channelTagsTable.color })
        .from(postTagTable)
        .innerJoin(channelTagsTable, eq(channelTagsTable.id, postTagTable.tagId))
        .where(eq(postTagTable.postId, post_id));

    return {
        post,
        user,
        channel,
        upvotes,
        downvotes,
        tags,
        private_channel: false,
    };
};

export const getUserPostVote = async (db: DB, userId: uuid, postId: uuid): Promise<'UP' | 'DOWN' | null> => {
    const [vote] = await db.select({ vote: postVoteTable.vote }).from(postVoteTable).where(and(
        eq(postVoteTable.postId, postId),
        eq(postVoteTable.userId, userId),
    ));

    return vote?.vote || null;
};
