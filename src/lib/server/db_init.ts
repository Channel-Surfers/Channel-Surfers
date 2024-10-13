import type { uuid } from '$lib/types';
import { sql } from 'drizzle-orm';
import type { DB } from '.';
import {
    channelTable,
    channelTagsTable,
    commentTable,
    followTable,
    postTable,
    postTagTable,
    publicChannelTable,
    subscriptionTable,
    userBlockTable,
    userTable,
    type Channel,
    type ChannelTag,
    type NewComment,
    type Post,
    type User,
} from './db/schema';
import { faker } from '@faker-js/faker';

let db: DB;

const rand = (n: number, o = 0): number => o + Math.floor(Math.random() * (n - o));

const pick_n = <T>(arr: T[], n: number): T[] => {
    if (arr.length < n) throw new Error(`(n = ${n}) < (arr.length = ${arr.length})`);
    const a = [...arr];
    if (a.length === n) return a;
    return Array(n)
        .fill(0)
        .map(() => a.splice(rand(a.length), 1)[0]);
};

const make_users = async (count: number) => {
    const user_data = faker.helpers.uniqueArray(faker.word.sample, count).map((username) => ({
        username,
        profileImage: faker.image.avatar(),
    }));

    const users: User[] = [];
    while (user_data.length) {
        users.push(...(await db.insert(userTable).values(user_data.splice(0, 10_000)).returning()));
    }
    return users;
};

const make_follows = async (users: User[]) => {
    return await db
        .insert(followTable)
        .values(
            pick_n(users, Math.floor(users.length * 0.8)).flatMap((u) =>
                pick_n(
                    users.filter((s) => s.id !== u.id),
                    rand(20, 1)
                ).map((f) => ({
                    followerId: f.id,
                    userId: u.id,
                }))
            )
        )
        .returning();
};

const make_user_blocks = async (users: User[]) => {
    return await db
        .insert(userBlockTable)
        .values(
            pick_n(users, Math.floor(users.length * 0.5)).flatMap((u) =>
                pick_n(
                    users.filter((s) => s.id !== u.id),
                    rand(5, 1)
                ).map((b) => ({
                    blockedUserId: b.id,
                    userId: u.id,
                }))
            )
        )
        .returning();
};

const make_channels = async (users: User[], count: number) => {
    const channels = await db
        .insert(channelTable)
        .values(
            pick_n(users, count).map((u) => ({
                name: faker.internet.domainWord().substring(0, 25),
                description: faker.lorem.sentences(),
                guidelines: faker.lorem.sentences(),
                bannerImage: faker.image.url(),
                icon: faker.image.url(),
                createdBy: u.id,
            }))
        )
        .returning();

    await db.insert(publicChannelTable).values(
        channels.map((c) => ({
            name: c.name,
            channelId: c.id,
        }))
    );

    const channel_tags: { [id: uuid]: ChannelTag[] } = {};
    for (const channel of channels) {
        channel_tags[channel.id] = await db
            .insert(channelTagsTable)
            .values(
                faker.helpers.uniqueArray(faker.hacker.noun, 5).map((word) => ({
                    channelId: channel.id,
                    name: word.substring(0, 16),
                    color: faker.internet.color(),
                }))
            )
            .returning();
    }

    return { channels, channel_tags };
};

const make_post_votes = async () => {
    // Build votes through a single query rather than drizzle.  This is a
    // little more complex, but better since we are not sending as much data to
    // the database, which is especially beneficial when we're adding data to
    // the production databse
    const ret = await db.execute(sql`
        SET session_replication_role = replica;
        WITH rows AS (
            INSERT INTO post_vote (post_id, user_id, vote)
                SELECT post.id, "user".id, x.vote
                    FROM "post"
                    CROSS JOIN "user"
                    LEFT JOIN LATERAL (
                        SELECT (ARRAY[CAST('UP' AS vote), CAST('DOWN' AS vote)])[
                            (SELECT ( -- Need this so that the query runs for every row
                                UUID_EXTRACT_VERSION("user".id) - UUID_EXTRACT_VERSION(post.id)
                            ))
                            + (RANDOM() > (7/8.0))::int + 1
                        ] vote
                    ) x ON TRUE
                RETURNING 1
            )
            SELECT COUNT(*) FROM rows;
        SET session_replication_role = DEFAULT;
        UPDATE post
            SET upvotes = (
                SELECT count(*) FROM post_vote
                    WHERE post_id = post.id AND vote = 'UP'
            );
        UPDATE post
            SET downvotes = (
                SELECT count(*) FROM post_vote
                    WHERE post_id = post.id AND vote = 'DOWN'
            );
    `);

    // This type is super funky for some reason, so just cast it
    return +(ret[1][0] as { count: string }).count;
};

const make_subscriptions = async (users: User[], channels: Channel[]) => {
    return await db
        .insert(subscriptionTable)
        .values(
            pick_n(users, Math.floor(users.length * 0.5)).flatMap((u) =>
                pick_n(channels, rand(Math.floor(channels.length * 0.75), 1)).map((c) => ({
                    channelId: c.id,
                    userId: u.id,
                }))
            )
        )
        .returning();
};

const make_posts = async (
    users: User[],
    channels: Channel[],
    channel_tags: { [id: uuid]: ChannelTag[] },
    count: number
) => {
    const video_ids = [
        'e0245338-7c04-4a6c-b44f-0e279a849cf5',
        'ee59e892-7838-46d1-876d-49efb4feb7ba',
        '6df184ad-6175-4dbb-88b0-7bb83c88e74c',
        '9dae1ca5-48e8-4fed-81e7-90dff6ca6d51',
        'ba0aa315-365c-4f90-b72a-3ddacee81381',
        '0164c7a6-2b48-4c96-8e02-34907666ec77',
    ];
    const posts = await db
        .insert(postTable)
        .values(
            Array(count)
                .fill(0)
                .map(() => ({
                    title: faker.word.words({ count: { min: 8, max: 15 } }),
                    description: faker.lorem.paragraphs({ min: 5, max: 20 }, '\n\n'),
                    channelId: channels[rand(channels.length)].id,
                    createdAt: faker.date.recent({ days: 20 }),
                    createdBy: users[rand(users.length)].id,
                    videoId: video_ids[rand(video_ids.length)],
                    altText: faker.lorem.sentence(),
                }))
        )
        .returning();

    for (const post of posts) {
        const fill = pick_n(
            channel_tags[post.channelId],
            rand(channel_tags[post.channelId].length, 1)
        ).map((tag) => {
            return {
                postId: post.id,
                tagId: tag.id,
            };
        });
        if (fill.length) {
            await db.insert(postTagTable).values(fill).returning();
        }
    }

    return posts;
};

// Note: `count` is the number of top-level comments.  More than `count`
// comments will actually be generated
//
// The actual lenth can be calculated as
// sum _{i=0} ^5 floor(count / 2^i)
const make_comments = async (posts: Post[], users: User[], count: number) => {
    const new_comment = (replyTo: uuid | null = null): NewComment => {
        return {
            postId: faker.helpers.arrayElement(posts).id,
            creatorId: faker.helpers.arrayElement(users).id,
            content: faker.lorem.paragraphs({ min: 1, max: 10 }, '\n\n'),
            replyTo: replyTo || null,
        };
    };

    const comments = await db
        .insert(commentTable)
        .values(Array(count).fill(0).map(new_comment))
        .returning();

    let last_wave = comments;
    for (let i = 0; i < 5; ++i) {
        last_wave = await db
            .insert(commentTable)
            .values(pick_n(last_wave, Math.floor((count /= 2))).map((c) => new_comment(c.id)))
            .returning();
        comments.push(...last_wave);
    }

    return comments;
};

const make_comment_votes = async () => {
    // Build votes through a single query rather than drizzle.  This is a
    // little more complex, but better since we are not sending as much data to
    // the database, which is especially beneficial when we're adding data to
    // the production databse
    const ret = await db.execute(sql`
        SET session_replication_role = replica;
        WITH rows AS (
            INSERT INTO comment_vote (comment_id, user_id, vote)
                SELECT comment.id, "user".id, x.vote
                    FROM "comment"
                    CROSS JOIN "user"
                    LEFT JOIN LATERAL (
                        SELECT (ARRAY[CAST('UP' AS vote), CAST('UP' AS vote), CAST('UP' AS vote), CAST('DOWN' AS vote)])[
                            (SELECT ( -- Need this so that the query runs for every row
                                UUID_EXTRACT_VERSION("user".id) - UUID_EXTRACT_VERSION(comment.id)
                            ))
                            + (RANDOM() > (7/8.0))::int + 1
                        ] vote
                    ) x ON TRUE
                RETURNING 1
            )
            SELECT COUNT(*) FROM rows;
        SET session_replication_role = DEFAULT;

        -- Temorarily disabled until we denormalise comment votes
        -- UPDATE comment
        --     SET upvotes = (
        --         SELECT count(*) FROM comment_vote
        --             WHERE comment_id = comment.id AND vote = 'UP'
        --     );
        -- UPDATE comment
        --     SET downvotes = (
        --         SELECT count(*) FROM comment_vote
        --             WHERE comment_id = comment.id AND vote = 'DOWN'
        --     );
    `);

    // This type is super funky for some reason, so just cast it
    return +(ret[1][0] as { count: string }).count;
};

export default async (_db: DB) => {
    console.log('running init');
    db = _db;

    const start = Date.now();
    if ((await db.select().from(userTable).limit(1)).length) {
        console.log('db is populated... skipping init');
        return;
    }

    let last = Date.now();
    const users = await make_users(2000);
    console.log(`Inserted ${users.length.toLocaleString()} users in ${Date.now() - last}ms`);

    last = Date.now();
    const follows = await make_follows(users);
    console.log(`Inserted ${follows.length.toLocaleString()} follows in ${Date.now() - last}ms`);

    last = Date.now();
    const user_blocks = await make_user_blocks(users);
    console.log(
        `Inserted ${user_blocks.length.toLocaleString()} user blocks in ${Date.now() - last}ms`
    );

    last = Date.now();
    const { channels, channel_tags } = await make_channels(users, 40);
    console.log(
        `Inserted ${channels.length.toLocaleString()} channels with ${Object.values(channel_tags)
            .reduce((a, b) => a + b.length, 0)
            .toLocaleString()} tags in ${Date.now() - last}ms`
    );

    last = Date.now();
    const posts = await make_posts(users, channels, channel_tags, 200);
    console.log(`Inserted ${posts.length.toLocaleString()} posts in ${Date.now() - last}ms`);

    last = Date.now();
    const subscriptions = await make_subscriptions(users, channels);
    console.log(
        `Inserted ${subscriptions.length.toLocaleString()} subscriptions (avg of ${subscriptions.length / users.length} subs/user) in ${Date.now() - last}ms`
    );

    last = Date.now();
    const post_vote_count = await make_post_votes();
    console.log(
        `Inserted ${post_vote_count.toLocaleString()} post votes in ${Date.now() - last}ms`
    );

    last = Date.now();
    const comments = await make_comments(posts, users, 500);
    console.log(`Inserted ${comments.length.toLocaleString()} comments in ${Date.now() - last}ms`);

    last = Date.now();
    const comment_vote_count = await make_comment_votes();
    console.log(
        `Inserted ${comment_vote_count.toLocaleString()} comment votes in ${Date.now() - last}ms`
    );

    console.log(`Init complete in ${Date.now() - start}ms`);
};
