import { count, eq, gte, sql } from 'drizzle-orm';
import type { DB } from '..';
import { postTable } from '../db/posts.sql';
import { channelTable } from '../db/channels.sql';
import { postVoteTable } from '../db/votes.posts.sql';

export const getPostStatistics = async (db: DB) => {
    const numberOfChannelsWithPostsQuery = db
        .select({ numberOfChannelsWithPosts: count(channelTable.id) })
        .from(channelTable)
        .innerJoin(postTable, eq(channelTable.id, postTable.channelId))
        .where(gte(postTable.createdOn, sql`now()::date`));
    const numberOfPostsQuery = db
        .select({ numberOfPosts: count(postTable.id) })
        .from(postTable)
        .where(gte(postTable.createdOn, sql`now()::date`));
    const numberOfUpvotesQuery = db
        .select({ numberOfUpvotes: count(postTable.id) })
        .from(postTable)
        .leftJoin(postVoteTable, eq(postTable.id, postVoteTable.postId))
        .where(gte(postTable.createdOn, sql`now()::date`));
    const numberOfDownvotesQuery = db
        .select({ numberOfDownvotes: count(postTable.id) })
        .from(postTable)
        .leftJoin(postVoteTable, eq(postTable.id, postVoteTable.postId))
        .where(gte(postTable.createdOn, sql`now()::date`));
    const [
        [{ numberOfChannelsWithPosts }],
        [{ numberOfPosts }],
        [{ numberOfUpvotes }],
        [{ numberOfDownvotes }],
    ] = await Promise.all([
        numberOfChannelsWithPostsQuery,
        numberOfPostsQuery,
        numberOfUpvotesQuery,
        numberOfDownvotesQuery,
    ]);
    return {
        numberOfChannelsWithPosts,
        numberOfPosts,
        numberOfUpvotes,
        numberOfDownvotes,
    };
};
