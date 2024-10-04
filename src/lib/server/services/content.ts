import { and, count, countDistinct, eq, gte, sql } from 'drizzle-orm';
import type { DB } from '..';
import { postTable } from '../db/posts.sql';
import { channelTable } from '../db/channels.sql';
import { postVoteTable } from '../db/votes.posts.sql';

export const getPostStatistics = async (db: DB) => {
    const numberOfChannelsWithPostsQuery = db
        .selectDistinctOn([channelTable.id], {
            numberOfChannelsWithPosts: countDistinct(channelTable.id),
        })
        .from(channelTable)
        .innerJoin(postTable, eq(channelTable.id, postTable.channelId))
        .groupBy(channelTable.id)
        .where(gte(postTable.createdOn, sql`now()::date`));

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
