import type { DB } from '.';
import * as schema from './db/schema';
import { faker } from '@faker-js/faker';

const rand = (n: number, o = 0): number => o + Math.floor(Math.random() * (n - o));

const pick_n = <T>(arr: T[], n: number): T[] => {
    const a = [...arr];
    return Array(n)
        .fill(0)
        .map(() => a.splice(rand(a.length), 1)[0]);
};

const buffer = <T>(fn: (buf: T[]) => Promise<any[]>, max_len: number = 10_000) => {
    let buf: T[] = [];
    let count = 0;
    const o = {
        push: async (...args: T[]) => {
            if (args.length > max_len) {
                while (args.length) {
                    await o.push(...args.splice(0, max_len));
                }
            } else {
                buf.push(...args);
            }
            if (buf.length >= max_len) {
                count += (await fn(buf)).length;
                buf = [];
            }
        },
        finish: async () => {
            if (buf.length) {
                count += (await fn(buf)).length;
                buf = [];
            }
            return count;
        },
    };
    return o;
};

export default async (db: DB) => {
    console.log('running init');
    if ((await db.select().from(schema.userTable).limit(1)).length) {
        console.log('db is populated... skipping init');
        return;
    }

    const userData = faker.helpers.uniqueArray(faker.word.sample, 2000)
    .map(username => ({
        username,
        profileImage: faker.image.avatar(),
    }))

    const users: schema.User[] = [];
    while (userData.length) {
        users.push(
            ...await db
                .insert(schema.userTable)
                .values(userData.splice(0, 10_000))
                .returning()
        );
    }
    console.log('user count:', users.length);

    const channels = await db
        .insert(schema.channelTable)
        .values(
            users.slice(0, 20).map((u) => ({
                name: faker.internet.domainWord().substring(0, 25),
                createdBy: u.id,
            }))
        )
        .returning();

    await db.insert(schema.publicChannelTable).values(
        channels.map((c) => ({
            name: c.name,
            channelId: c.id,
        }))
    );

    const tags: { [id: string]: schema.ChannelTag[] } = {};
    for (const channel of channels) {
        tags[channel.id] = await db
            .insert(schema.channelTagsTable)
            .values(
                faker.helpers.uniqueArray(faker.hacker.noun, 5)
                    .map(word => ({
                        channelId: channel.id,
                        name: word.substring(0, 16),
                        color: faker.internet.color(),
                    }))
            )
            .returning();
    }
    console.log('channel count:', channels.length);

    const video_ids = [
        'e0245338-7c04-4a6c-b44f-0e279a849cf5',
        'ee59e892-7838-46d1-876d-49efb4feb7ba',
        '6df184ad-6175-4dbb-88b0-7bb83c88e74c',
        '9dae1ca5-48e8-4fed-81e7-90dff6ca6d51',
        'ba0aa315-365c-4f90-b72a-3ddacee81381',
        '0164c7a6-2b48-4c96-8e02-34907666ec77',
    ];
    const posts = await db
        .insert(schema.postTable)
        .values(
            Array(100)
                .fill(0)
                .map(() => ({
                    title: faker.word.words({ count: { min: 8, max: 15 } }),
                    description: faker.lorem.paragraphs({ min: 5, max: 20 }, '\n\n'),
                    channelId: channels[rand(channels.length)].id,
                    createdAt: faker.date.recent({ days: 20 }),
                    createdBy: users[rand(users.length)].id,
                    videoId: video_ids[rand(video_ids.length)],
                }))
        )
        .returning();
    console.log('posts count:', posts.length);

    for (const post of posts) {
        const fill = pick_n(tags[post.channelId], rand(5, 1))
            .map(tag => {
                return {
                    postId: post.id,
                    tagId: tag.id,
                };
            });
        if (fill.length) {
            await db.insert(schema.postTagTable).values(fill).returning();
        }
    }
    console.log('posts count:', posts.length);

    const buf = buffer<schema.NewPostVote>(a => db.insert(schema.postVoteTable).values(a).returning());
    for (const i in users) {
        const user = users[i];
        for (const post of posts) {
            await buf.push({
                postId: post.id,
                userId: user.id,
                vote: Math.random() > .25 ? ('UP' as const) : ('DOWN' as const),
            });
        }
    }
    const votes = await buf.finish();

    console.log('votes count:', votes);
    console.log('generated data');
};
