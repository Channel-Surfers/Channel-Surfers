import { describe } from 'vitest';
import { create_users, sequentialDates, testWithDb } from '$lib/testing/utils';
import type { DB } from '..';
import { userTable } from '../db/users.sql';
import { channelTable } from '../db/channels.sql';
import { postTable, type Post } from '../db/posts.sql';
import { getPosts, getPostStatistics } from './content';
import { postVoteTable } from '../db/votes.posts.sql';
import { subscriptionTable, userBlockTable } from '../db/schema';

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

const generatePosts = async (db: DB) => {
    const [creator] = await db.insert(userTable).values({ username: 'AwesomeGuy' }).returning();
    const [channel] = await db
        .insert(channelTable)
        .values({ name: 'Channel-Surfers', createdBy: creator.id })
        .returning();
    const d = sequentialDates();
    const [post1, post2] = await db
        .insert(postTable)
        .values([
            {
                channelId: channel.id,
                createdBy: creator.id,
                createdOn: d.next(),
                title: 'Awesome post 1',
                videoId: '',
            },
            {
                channelId: channel.id,
                createdBy: creator.id,
                createdOn: d.next(),
                title: 'Awesome post 2',
                videoId: '',
            },
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

const generateGroups = async (db: DB) => {
    const [creator1, creator2] = await create_users(db, 2);
    const [channel1, channel2] = await db
        .insert(channelTable)
        .values([
            { name: 'channel1', createdBy: creator1.id },
            { name: 'channel2', createdBy: creator2.id },
        ])
        .returning();
    const d = sequentialDates();
    const [post11, post12, post21, post22] = await db
        .insert(postTable)
        .values([
            {
                channelId: channel1.id,
                createdBy: creator1.id,
                createdOn: d.next(),
                title: 'post1-1',
                videoId: '',
            },
            {
                channelId: channel1.id,
                createdBy: creator2.id,
                createdOn: d.next(),
                title: 'post1-2',
                videoId: '',
            },
            {
                channelId: channel2.id,
                createdBy: creator1.id,
                createdOn: d.next(),
                title: 'post2-1',
                videoId: '',
            },
            {
                channelId: channel2.id,
                createdBy: creator2.id,
                createdOn: d.next(),
                title: 'post2-2',
                videoId: '',
            },
        ])
        .returning();

    const vote = async (post: Post, up_count: number, down_count: number) => {
        const up = await create_users(db, up_count, `${post.title}-up-`);
        const down = await create_users(db, down_count, `${post.title}-down-`);

        await db.insert(postVoteTable).values(
            up.map((u) => ({
                postId: post.id,
                userId: u.id,
                vote: 'UP' as const,
            }))
        );

        await db.insert(postVoteTable).values(
            down.map((u) => ({
                postId: post.id,
                userId: u.id,
                vote: 'DOWN' as const,
            }))
        );
        return { upvotes: up_count, downvotes: down_count };
    };

    const votes = {
        p11: await vote(post11, 300, 250),
        p12: await vote(post12, 315, 220),
        p21: await vote(post21, 350, 100),
        p22: await vote(post22, 200, 500),
    };

    const [user] = await create_users(db, 1);

    await db.insert(userBlockTable).values({ userId: user.id, blockedUserId: creator1.id });

    await db.insert(subscriptionTable).values({ userId: user.id, channelId: channel1.id });

    return {
        votes,
        user,
        post11,
        post12,
        post21,
        post22,
        creator1,
        creator2,
        channel1,
        channel2,
    };
};

describe.concurrent('content suite', () => {
    testWithDb(
        'site statistics is calculated correctly',
        async ({ expect, db }, { votes }) => {
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

    testWithDb(
        'get posts { type: home, sort: votes, filter: all }',
        async ({ expect, db }, { post1, post2, votes, creator, channel }) => {
            const [a, b, ...rest] = await getPosts(db, 0, {
                type: 'home',
                sort: 'votes',
                filter: 'all',
            });

            let p1, p2;
            if (
                votes.upvotes1.length - votes.downvotes1.length >
                votes.upvotes2.length - votes.downvotes2.length
            ) {
                [p1, p2] = [a, b];
            } else {
                [p1, p2] = [b, a];
            }

            expect(rest).toHaveLength(0);

            expect(p1.id).toStrictEqual(post1.id);
            expect(p1.title).toStrictEqual(post1.title);
            expect(p1.poster.user.id).toStrictEqual(creator.id);
            expect(p1.poster.user.name).toStrictEqual(creator.username);
            expect(p1.poster.channel.id).toStrictEqual(channel.id);
            expect(p1.poster.channel.name).toStrictEqual(channel.name);

            expect(p2.id).toStrictEqual(post2.id);
            expect(p2.title).toStrictEqual(post2.title);
            expect(p2.poster.user.id).toStrictEqual(creator.id);
            expect(p2.poster.user.name).toStrictEqual(creator.username);
            expect(p2.poster.channel.id).toStrictEqual(channel.id);
            expect(p2.poster.channel.name).toStrictEqual(channel.name);
        },
        generatePosts
    );

    testWithDb(
        'get posts { type: home, sort: date, filter: all }',
        async ({ expect, db }, { post1, post2 }) => {
            const [p1, p2, ...rest] = await getPosts(db, 0, {
                type: 'home',
                sort: 'date',
                filter: 'all',
            });

            expect(rest).toHaveLength(0);

            expect(p1.id).toStrictEqual(post2.id);
            expect(p2.id).toStrictEqual(post1.id);
        },
        generatePosts
    );

    testWithDb(
        'get posts { type: home, sort: date, filter: all, reverseSort: true }',
        async ({ expect, db }, { post1, post2 }) => {
            const [p1, p2, ...rest] = await getPosts(db, 0, {
                type: 'home',
                sort: 'date',
                filter: 'all',
                reverseSort: true,
            });

            expect(rest).toHaveLength(0);

            expect(p1.id).toStrictEqual(post1.id);
            expect(p2.id).toStrictEqual(post2.id);
        },
        generatePosts
    );

    testWithDb(
        'get posts { type: user, sort: date, filter: all }',
        async ({ expect, db }, { post11, post21, creator1 }) => {
            const [p1, p2, ...rest] = await getPosts(db, 0, {
                type: 'user',
                sort: 'date',
                filter: 'all',
                username: creator1.username,
            });

            expect(rest).toHaveLength(0);

            expect(p1.id).toStrictEqual(post21.id);
            expect(p2.id).toStrictEqual(post11.id);
        },
        generateGroups
    );

    testWithDb(
        'get posts { type: channel, sort: date, filter: all }',
        async ({ expect, db }, { post11, post12, channel1 }) => {
            const [p1, p2, ...rest] = await getPosts(db, 0, {
                type: 'channel',
                sort: 'date',
                filter: 'all',
                channelId: channel1.id,
            });

            expect(rest).toHaveLength(0);

            expect(p1.id).toStrictEqual(post12.id);
            expect(p2.id).toStrictEqual(post11.id);
        },
        generateGroups
    );

    testWithDb(
        'get posts { type: home, sort: date, filter: subscribed }',
        async ({ expect, db }, { post12, user }) => {
            const [p1, ...rest] = await getPosts(db, 0, {
                type: 'home',
                sort: 'date',
                filter: 'subscribed',
                requesterId: user.id,
            });

            expect(rest).toHaveLength(0);

            expect(p1.id).toStrictEqual(post12.id);
        },
        generateGroups
    );
});
