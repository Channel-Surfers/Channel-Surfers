import { describe } from 'vitest';
import { mustGenerate, testWithDb } from '$lib/testing/utils';
import type { DB } from '..';
import { userTable } from '../db/users.sql';
import { channelTable } from '../db/channels.sql';
import { postTable } from '../db/posts.sql';
import { getPosts, getPostStatistics } from './content';
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
                vote: 'UP' as const,
            }))
        )
        .returning();

    const downvotes1 = await db
        .insert(postVoteTable)
        .values(
            post1Downvoters.map((downvoter) => ({
                postId: post1.id,
                userId: downvoter.id,
                vote: 'DOWN' as const,
            }))
        )
        .returning();

    const upvotes2 = await db
        .insert(postVoteTable)
        .values(
            post2Upvoters.map((upvoter) => ({
                postId: post2.id,
                userId: upvoter.id,
                vote: 'UP' as const,
            }))
        )
        .returning();

    const downvotes2 = await db
        .insert(postVoteTable)
        .values(
            post2Downvoters.map((downvoter) => ({
                postId: post2.id,
                userId: downvoter.id,
                vote: 'DOWN' as const,
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

describe.concurrent('content suite', () => {
    testWithDb(
        'post list contains correct data',
        async ({ expect, db, generated }) => {
            const gen = mustGenerate(generated);

            const [a, b, ...rest] = await getPosts(db, 0, {
                type: 'home',
                sort: 'votes',
                filter: 'all',
            });

            let p1, p2;
            if (
                gen.votes.upvotes1.length - gen.votes.downvotes1.length >
                gen.votes.upvotes2.length - gen.votes.downvotes2.length
            ) {
                [p1, p2] = [a, b];
            } else {
                [p1, p2] = [b, a];
            }

            expect(rest.length).toStrictEqual(0);

            expect(p1.id).toStrictEqual(gen.post1.id);
            expect(p1.title).toStrictEqual(gen.post1.title);
            expect(p1.poster.user.id).toStrictEqual(gen.creator.id);
            expect(p1.poster.user.name).toStrictEqual(gen.creator.username);
            expect(p1.poster.channel.id).toStrictEqual(gen.channel.id);
            expect(p1.poster.channel.name).toStrictEqual(gen.channel.name);

            expect(p2.id).toStrictEqual(gen.post2.id);
            expect(p2.title).toStrictEqual(gen.post2.title);
            expect(p2.poster.user.id).toStrictEqual(gen.creator.id);
            expect(p2.poster.user.name).toStrictEqual(gen.creator.username);
            expect(p2.poster.channel.id).toStrictEqual(gen.channel.id);
            expect(p2.poster.channel.name).toStrictEqual(gen.channel.name);
        },
        generateStatContext
    );

    testWithDb(
        'site statistics is calculated correctly',
        async ({ expect, db, generated }) => {
            const { votes } = mustGenerate(generated);

            const { numberOfChannelsWithPosts, numberOfPosts, numberOfUpvotes, numberOfDownvotes } =
                await getPostStatistics(db);

            expect(numberOfChannelsWithPosts).toStrictEqual(1);
            expect(numberOfPosts).toStrictEqual(2);
            expect(numberOfUpvotes).toStrictEqual(votes.upvotes1.length + votes.upvotes2.length);
            expect(numberOfDownvotes).toStrictEqual(
                votes.downvotes1.length + votes.downvotes2.length
            );
        },
        generateStatContext
    );
});
