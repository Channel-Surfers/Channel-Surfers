import { describe, test } from 'vitest';
import { createTestingDb, mustGenerate } from '$lib/testing/utils';
import type { DB } from '..';
import { userTable } from '../db/users.sql';
import { channelTable } from '../db/channels.sql';
import { postTable } from '../db/posts.sql';
import { getCommentTree, getPosts, getPostStatistics } from './content';
import { postVoteTable } from '../db/votes.posts.sql';
import { commentTable } from '../db/comments.sql';
//import { comment } from 'postcss';

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

describe.concurrent('posts suite', () => {
    test('post list contains correct data', async ({ expect }) => {
        const { db, generated } = await createTestingDb(generateStatContext);

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
    });
});

describe.concurrent('channels suite', () => {
    test('site statistics is calculated correctly', async ({ expect }) => {
        const { db, generated } = await createTestingDb(generateStatContext);

        const { votes } = mustGenerate(generated);

        const { numberOfChannelsWithPosts, numberOfPosts, numberOfUpvotes, numberOfDownvotes } =
            await getPostStatistics(db);

        expect(numberOfChannelsWithPosts).toStrictEqual(1);
        expect(numberOfPosts).toStrictEqual(2);
        expect(numberOfUpvotes).toStrictEqual(votes.upvotes1.length + votes.upvotes2.length);
        expect(numberOfDownvotes).toStrictEqual(votes.downvotes1.length + votes.downvotes2.length);
    });
});

describe.concurrent('content suite', () => {
    test('Comment Tree Working Successfully', async ({ expect }) => {
        const { db, generated } = await createTestingDb(generateComments);

        const { post1, creator3 } = mustGenerate(generated);
        const { comment1, comment2, comment3 } = mustGenerate(generated);

        const commentTree = await getCommentTree(db, post1.id);

        expect(commentTree.length).toStrictEqual(2);
        expect(commentTree[0].content).toStrictEqual(comment1.content);
        expect(commentTree[1].content).toStrictEqual(comment2.content);
        expect(commentTree[0].children?.length).toStrictEqual(0);
        expect(commentTree[1].children?.length).toStrictEqual(2);
        expect(commentTree[1].children![0].content).toStrictEqual(comment3.content);
        expect(commentTree[1].children![0].user).toStrictEqual(creator3);
    });
});
