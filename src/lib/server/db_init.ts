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
    roleTable,
    subscriptionTable,
    userBlockTable,
    userRoleTable,
    userTable,
    type Channel,
    type ChannelTag,
    type Comment,
    type NewComment,
    type Post,
    type Role,
    type User,
} from './db/schema';
import { faker } from '@faker-js/faker';

let db: DB;

const rand = (n: number, o = 0): number => o + Math.floor(Math.random() * (n - o));

const pickN = <T>(arr: T[], n: number): T[] => {
    if (arr.length < n) throw new Error(`(n = ${n}) < (arr.length = ${arr.length})`);
    const a = [...arr];
    if (a.length === n) return a;
    return Array(n)
        .fill(0)
        .map(() => a.splice(rand(a.length), 1)[0]);
};

const makeUsers = async (count: number) => {
    const userData = faker.helpers.uniqueArray(faker.word.sample, count).map((username) => ({
        username,
        profileImage: faker.image.avatar(),
    }));

    const users: User[] = [];
    while (userData.length) {
        users.push(...(await db.insert(userTable).values(userData.splice(0, 10_000)).returning()));
    }
    return users;
};

const makeFollows = async (users: User[]) => {
    return await db
        .insert(followTable)
        .values(
            pickN(users, Math.floor(users.length * 0.8)).flatMap((u) =>
                pickN(
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

const makeUserBlocks = async (users: User[]) => {
    return await db
        .insert(userBlockTable)
        .values(
            pickN(users, Math.floor(users.length * 0.5)).flatMap((u) =>
                pickN(
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

const makeChannels = async (users: User[], count: number) => {
    const channels = await db
        .insert(channelTable)
        .values(
            pickN(users, count).map((u) => ({
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

    const channelTags: { [id: uuid]: ChannelTag[] } = {};
    for (const channel of channels) {
        channelTags[channel.id] = await db
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

    return { channels, channelTags };
};

const makeRoles = async (channels: Channel[]) => {
    const perms = [
        'canCreateRoles',
        'canViewRoles',
        'canEditRoles',
        'canDeleteRoles',
        'canAssignRoles',
        'canSetMessageOfTheDay',
        'canEditName',
        'canSetImage',
        'canViewUserTable',
        'canEditTags',
        'canSetGuidelines',
        'canTimeoutUsers',
        'canBanUsers',
        'canViewBannedUsers',
        'canUnbanUsers',
        'canDeletePosts',
        'canDeleteComments',
        'canEditPostTags',
        'canViewReports',
        'canUpdateReports',
        'canResolveReports',
        'canRegisterEvents',
        'canViewEvents',
        'canEditEvents',
        'canUnregisterEvents',
    ] as const;

    const permFromNum = (n: number): { [key in (typeof perms)[number]]: boolean } =>
        perms.reduce((a, b, i) => ({ ...a, [b]: ((n >> i) & 1) === 1 }), {}) as {
            [key in (typeof perms)[number]]: boolean;
        };

    const roles = channels.flatMap((channel) =>
        Array(rand(15, 5))
            .fill(0)
            .map((_, i) => ({
                channelId: channel.id,
                title: faker.person.jobDescriptor(),
                isOwner: false,
                ranking: i,
                ...permFromNum(rand(2 ** perms.length)),
            }))
    );

    const d = await db.insert(roleTable).values(roles).returning();

    return d.reduce(
        (a, b) => ({ ...a, [b.channelId]: a[b.channelId] ? a[b.channelId].concat([b]) : [b] }),
        {} as { [role: uuid]: Role[] }
    );
};

const makeUserRoles = async (users: User[], roles: { [role: uuid]: Role[] }) => {
    return await db
        .insert(userRoleTable)
        .values(
            Object.keys(roles).flatMap((cid) =>
                pickN(users, rand(15, 5)).map((u) => ({
                    userId: u.id,
                    roleId: faker.helpers.arrayElement(roles[cid]).id,
                }))
            )
        )
        .returning();
};

const makeSubscriptions = async (users: User[], channels: Channel[]) => {
    return await db
        .insert(subscriptionTable)
        .values(
            pickN(users, Math.floor(users.length * 0.5)).flatMap((u) =>
                pickN(channels, rand(Math.floor(channels.length * 0.75), 1)).map((c) => ({
                    channelId: c.id,
                    userId: u.id,
                }))
            )
        )
        .returning();
};

const makePosts = async (
    users: User[],
    channels: Channel[],
    channelTags: { [id: uuid]: ChannelTag[] },
    count: number
) => {
    const videoIds = [
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
                    createdOn: faker.date.past({ years: 3 }),
                    createdBy: users[rand(users.length)].id,
                    videoId: videoIds[rand(videoIds.length)],
                    altText: faker.lorem.sentence(),
                }))
        )
        .returning();

    for (const post of posts) {
        const fill = pickN(
            channelTags[post.channelId],
            rand(channelTags[post.channelId].length, 1)
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

const makePostVotes = async () => {
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
                                OCTET_LENGTH("user".username) + OCTET_LENGTH(post.name)
                            )) * 0
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

// Note: `count` is the number of top-level comments.  More than `count`
// comments will actually be generated
//
// The actual lenth can be calculated as
// sum _{i=0} ^5 floor(count / 2^i)
const makeComments = async (posts: Post[], users: User[], count: number) => {
    const now = Date.now();
    const newComment = (replyTo: Comment | null): NewComment => {
        const post = faker.helpers.arrayElement(posts);
        return {
            postId: post.id,
            creatorId: faker.helpers.arrayElement(users).id,
            createdOn: faker.date.between({
                from: replyTo ? replyTo.createdOn : post.createdOn,
                to: now,
            }),
            content: faker.lorem.paragraphs({ min: 1, max: 10 }, '\n\n'),
            replyTo: replyTo?.id || null,
        };
    };

    const comments = await db
        .insert(commentTable)
        .values(Array(count).fill(null).map(newComment))
        .returning();

    let lastWave = comments;
    for (let i = 0; i < 5; ++i) {
        lastWave = await db
            .insert(commentTable)
            .values(pickN(lastWave, Math.floor((count /= 2))).map((c) => newComment(c)))
            .returning();
        comments.push(...lastWave);
    }

    return comments;
};

const makeCommentVotes = async () => {
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
                        SELECT (ARRAY[CAST('UP' AS vote), CAST('DOWN' AS vote)])[
                            (SELECT ( -- Need this so that the query runs for every row
                                OCTET_LENGTH("user".username) + OCTET_LENGTH(comment.content)
                            )) * 0
                            + (RANDOM() > (7/8.0))::int + 1
                        ] vote
                    ) x ON TRUE
                RETURNING 1
            )
            SELECT COUNT(*) FROM rows;
        SET session_replication_role = DEFAULT;

        UPDATE comment
            SET upvotes = (
                SELECT count(*) FROM comment_vote
                    WHERE comment_id = comment.id AND vote = 'UP'
            );
        UPDATE comment
            SET downvotes = (
                SELECT count(*) FROM comment_vote
                    WHERE comment_id = comment.id AND vote = 'DOWN'
            );
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

    const mapLen = <V>(map: { [key: uuid]: V[] }): number =>
        Object.values(map).reduce((a, b) => a + b.length, 0);

    let last = Date.now();
    const users = await makeUsers(2000);
    console.log(`Inserted ${users.length.toLocaleString()} users in ${Date.now() - last}ms`);

    last = Date.now();
    const follows = await makeFollows(users);
    console.log(`Inserted ${follows.length.toLocaleString()} follows in ${Date.now() - last}ms`);

    last = Date.now();
    const userBlocks = await makeUserBlocks(users);
    console.log(
        `Inserted ${userBlocks.length.toLocaleString()} user blocks in ${Date.now() - last}ms`
    );

    last = Date.now();
    const { channels, channelTags } = await makeChannels(users, 40);
    console.log(
        `Inserted ${channels.length.toLocaleString()} channels with ${mapLen(channelTags).toLocaleString()} tags in ${Date.now() - last}ms`
    );

    last = Date.now();
    const posts = await makePosts(users, channels, channelTags, 200);
    console.log(`Inserted ${posts.length.toLocaleString()} posts in ${Date.now() - last}ms`);

    last = Date.now();
    const subscriptions = await makeSubscriptions(users, channels);
    console.log(
        `Inserted ${subscriptions.length.toLocaleString()} subscriptions (avg of ${subscriptions.length / users.length} subs/user) in ${Date.now() - last}ms`
    );

    last = Date.now();
    const roles = await makeRoles(channels);
    console.log(
        `Inserted ${mapLen(roles).toLocaleString()} roles (avg of ${mapLen(roles) / channels.length} roles/channel) in ${Date.now() - last}ms`
    );

    last = Date.now();
    const userRoles = await makeUserRoles(users, roles);
    console.log(
        `Inserted ${userRoles.length.toLocaleString()} user roles in ${Date.now() - last}ms`
    );

    last = Date.now();
    const postVoteCount = await makePostVotes();
    console.log(`Inserted ${postVoteCount.toLocaleString()} post votes in ${Date.now() - last}ms`);

    last = Date.now();
    const comments = await makeComments(posts, users, 500);
    console.log(`Inserted ${comments.length.toLocaleString()} comments in ${Date.now() - last}ms`);

    last = Date.now();
    const commentVoteCount = await makeCommentVotes();
    console.log(
        `Inserted ${commentVoteCount.toLocaleString()} comment votes in ${Date.now() - last}ms`
    );

    console.log(`Init complete in ${Date.now() - start}ms`);
};
