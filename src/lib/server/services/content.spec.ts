import { describe, it } from 'vitest';
import { createTestingDb, mustGenerate } from '$lib/testing/utils';
import type { DB } from '..';
import { userTable, type NewUser } from '../db/users.sql';
import { channelTable } from '../db/channels.sql';
import { postTable } from '../db/posts.sql';
import { getPostStatistics } from './content';
import { postVoteTable } from '../db/votes.posts.sql';

const generateStatContext = async (db: DB) => {
    const [creator] = await db.insert(userTable).values({ username: 'AwesomeGuy' }).returning();
    const [channel] = await db
        .insert(channelTable)
        .values({ name: 'Channel-Surfers', createdBy: creator.id })
        .returning();
    const [post1, post2] = await db
        .insert(postTable)
        .values([
            { channelId: channel.id, createdBy: creator.id, title: 'Awesome post 1', videoId: '' },
            { channelId: channel.id, createdBy: creator.id, title: 'Awesome post 2', videoId: '' },
        ])
        .returning();

    const post1Upvoters = await db
        .insert(userTable)
        .values(Array.from({ length: 300 }, (_, n) => ({ username: `p1-up-${n}` })))
        .returning();
    const post1Downvoters = await db
        .insert(userTable)
        .values(Array.from({ length: 250 }, (_, n) => ({ username: `p1-down-${n}` })))
        .returning();
    const post2Upvoters = await db
        .insert(userTable)
        .values(Array.from({ length: 315 }, (_, n) => ({ username: `p2-up-${n}` })))
        .returning();
    const post2Downvoters = await db
        .insert(userTable)
        .values(Array.from({ length: 220 }, (_, n) => ({ username: `p2-down-${n}` })))
        .returning();

    const upvotes1 = await db
        .insert(postVoteTable)
        .values(
            post1Upvoters.map((upvoter) => ({
                postId: post1.id,
                userId: upvoter.id,
                vote: 'UP' as 'UP',
            }))
        )
        .returning();

    const downvotes1 = await db
        .insert(postVoteTable)
        .values(
            post1Downvoters.map((downvoter) => ({
                postId: post1.id,
                userId: downvoter.id,
                vote: 'DOWN' as 'DOWN',
            }))
        )
        .returning();

    const upvotes2 = await db
        .insert(postVoteTable)
        .values(
            post2Upvoters.map((upvoter) => ({
                postId: post2.id,
                userId: upvoter.id,
                vote: 'UP' as 'UP',
            }))
        )
        .returning();

    const downvotes2 = await db
        .insert(postVoteTable)
        .values(
            post2Downvoters.map((downvoter) => ({
                postId: post2.id,
                userId: downvoter.id,
                vote: 'DOWN' as 'DOWN',
            }))
        )
        .returning();

    return {
        creator,
        channel,
        post1,
        post2,
        votes: { upvotes1, downvotes1, upvotes2, downvotes2 },
    };
};

describe('channels suite', () => {
    it.concurrent('site statistics is calculated correctly', async ({ expect }) => {
        const { db, generated } = await createTestingDb(generateStatContext);

        const { votes } = mustGenerate(generated);

        const { numberOfChannelsWithPosts, numberOfPosts, numberOfUpvotes, numberOfDownvotes } =
            await getPostStatistics(db);

        expect(numberOfUpvotes).toStrictEqual(votes.upvotes1.length + votes.upvotes2.length);
        expect(numberOfDownvotes).toStrictEqual(votes.downvotes1.length + votes.downvotes2.length);
    });
});
