import { eq, and, count } from 'drizzle-orm';
import type { uuid } from "$lib/types";
import type { DB } from "..";
import { postTable } from "../db/posts.sql";
import { channelTable } from '../db/channels.sql';
import { postVoteTable } from '../db/votes.posts.sql';
import { postTagTable } from '../db/tags.posts.sql';
import { channelTagsTable } from '../db/tags.channels.sql';

export const getPost = async (db: DB, post_id: uuid) => {
    const [a] = await db.select()
        .from(postTable)
        .innerJoin(channelTable, eq(channelTable.id, postTable.channelId))
        .where(eq(postTable.id, post_id));

    if (!a) return null;

    const { post, channel } = a;
    console.log({ post, channel });

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
        .innerJoin(channelTagsTable, eq(channelTagsTable.id, postTagTable.tagId));

    return {
        post,
        channel,
        upvotes,
        downvotes,
        tags,
        private_channel: false,
    };
};

export const getUserPostVote = async (db: DB, userId: uuid, postId: uuid): Promise<'UP' | 'DOWN' | null> => {
    const [vote] = await db.select({vote: postVoteTable.vote}).from(postVoteTable).where(and(
        eq(postVoteTable.postId, postId),
        eq(postVoteTable.userId, userId),
    ));

    return vote?.vote || null;
};
