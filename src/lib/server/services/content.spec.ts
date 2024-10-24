import { describe } from 'vitest';
import { createUsers, sequentialDates, testWithDb } from '$lib/testing/utils';
import type { DB } from '..';
import { userTable } from '../db/users.sql';
import { channelTable } from '../db/channels.sql';
import { getCommentTree, getPosts, getPostStatistics } from './content';
import { postTable, type Post } from '../db/posts.sql';
import { postVoteTable } from '../db/votes.posts.sql';
import { commentTable } from '../db/comments.sql';
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
    const [creator1, creator2] = await createUsers(db, 2);
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

    const vote = async (post: Post, upCount: number, downCount: number) => {
        const up = await createUsers(db, upCount, `${post.title}-up-`);
        const down = await createUsers(db, downCount, `${post.title}-down-`);

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
        return { upvotes: upCount, downvotes: downCount };
    };

    const votes = {
        p11: await vote(post11, 300, 250),
        p12: await vote(post12, 315, 220),
        p21: await vote(post21, 350, 100),
        p22: await vote(post22, 200, 500),
    };

    const [user] = await createUsers(db, 1);

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

const generateComments = async (db: DB) => {
    const [creator1] = await db.insert(userTable).values({ username: 'AwesomeGuy' }).returning();
    const [creator2] = await db.insert(userTable).values({ username: 'AwesomeGuy1' }).returning();
    const [creator3] = await db.insert(userTable).values({ username: 'AwesomeGuy2' }).returning();
    const [creator4] = await db.insert(userTable).values({ username: 'AwesomeGuy3' }).returning();

    const [channel] = await db
        .insert(channelTable)
        .values({ name: 'Channel-Surfers', createdBy: creator1.id })
        .returning();

    const [post1] = await db
        .insert(postTable)
        .values({
            channelId: channel.id,
            createdBy: creator1.id,
            title: 'Awesome post 1',
            videoId: '',
        })
        .returning();

    const January1 = new Date('January 1, 2024 03:24:00');
    const January2 = new Date('January 2, 2024 03:24:00');
    const January3 = new Date('January 3, 2024 03:24:00');
    const January4 = new Date('January 4, 2024 03:24:00');

    const [comment1, comment2] = await db
        .insert(commentTable)
        .values([
            {
                content: 'Awesome Video!',
                creatorId: creator1.id,
                postId: post1.id,
                replyTo: null,
                createdOn: January1,
            },
            {
                content: 'I loved every second of this',
                creatorId: creator2.id,
                postId: post1.id,
                replyTo: null,
                createdOn: January2,
            },
        ])
        .returning();

    const [comment3, comment4] = await db
        .insert(commentTable)
        .values([
            {
                content: 'Me too!',
                creatorId: creator3.id,
                postId: post1.id,
                replyTo: comment2.id,
                createdOn: January3,
            },
            {
                content: 'I love your pfp!',
                creatorId: creator4.id,
                postId: post1.id,
                replyTo: comment2.id,
                createdOn: January4,
            },
        ])
        .returning();

    return {
        creator1,
        creator2,
        creator3,
        creator4,
        channel,
        post1,
        comment1,
        comment2,
        comment3,
        comment4,
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
        'Comment Tree Working Successfully',
        async ({ expect, db }, { post1, creator3, comment1, comment2, comment3 }) => {
            const commentTree = await getCommentTree(db, post1.id);

            expect(commentTree.length).toStrictEqual(2);
            expect(commentTree[0].comment).toStrictEqual(comment1);
            expect(commentTree[1].comment).toStrictEqual(comment2);
            expect(commentTree[0].children).toBeDefined();
            expect(commentTree[1].children).toBeDefined();
            expect(commentTree[0].children).toHaveLength(0);
            expect(commentTree[1].children).toHaveLength(2);
            expect(commentTree[1].children![0].comment).toStrictEqual(comment3);
            expect(commentTree[1].children![0].user).toStrictEqual(creator3);
        },
        generateComments
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

    testWithDb(
        'get posts { type: home, sort: date, filter: subscribed, after: posts/2 }',
        async ({ expect, db }) => {
            const users = await createUsers(db, 10);
            const channels = await db
                .insert(channelTable)
                .values(
                    users
                        .slice(0, 5)
                        .map((u) => ({ name: `${u.username}s-channel`, createdBy: u.id }))
                )
                .returning();
            const d = sequentialDates();
            const genPosts = await db
                .insert(postTable)
                .values(
                    Array(10)
                        .fill(0)
                        .flatMap((_, pi) =>
                            users.map((u, ui) => ({
                                channelId: channels[pi % channels.length].id,
                                createdBy: u.id,
                                createdOn: d.next(),
                                title: `post${pi * 10 + ui}`,
                                videoId: '',
                            }))
                        )
                )
                .returning();

            const after = genPosts[Math.floor(genPosts.length / 2)].createdOn;
            const posts = await getPosts(db, 0, {
                type: 'user',
                sort: 'date',
                filter: 'subscribed',
                reverseSort: true,
                after,
                username: users[0].username,
            });

            const exp = genPosts.filter((p) => p.createdBy === users[0].id && p.createdOn >= after);
            expect(posts.map((p) => p.id)).toEqual(exp.map((p) => p.id));
        }
    );

    testWithDb('get posts for user with many users/posts', async ({ expect, db }) => {
        const [requester] = await createUsers(db, 1, 'req');
        const users = await createUsers(db, 10);
        const channels = await db
            .insert(channelTable)
            .values(users.map((u) => ({ name: `${u.username}s-channel`, createdBy: u.id })))
            .returning();
        const d = sequentialDates();
        const genPosts = await db
            .insert(postTable)
            .values(
                users.flatMap((u, ui) =>
                    Array(10)
                        .fill(0)
                        .map((_, pi) => ({
                            channelId: channels[pi].id,
                            createdBy: u.id,
                            createdOn: d.next(),
                            title: `post${ui * 10 + pi}`,
                            videoId: '',
                        }))
                )
            )
            .returning();

        users.forEach(async (u) => {
            const posts = await getPosts(db, 0, {
                type: 'user',
                sort: 'date',
                filter: 'all',
                reverseSort: true,
                username: u.username,
                requesterId: requester.id,
            });

            expect(posts).toHaveLength(10);
            expect(posts.map((p) => p.id)).toEqual(
                genPosts.filter((p) => p.createdBy === u.id).map((p) => p.id)
            );
        });
    });
});
