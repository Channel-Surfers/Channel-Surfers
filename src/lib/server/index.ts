import { POSTGRES_CONNECTION_STRING } from '$env/static/private';
import type { MigrationConfig } from 'drizzle-orm/migrator';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import * as schema from './db/schema';

export type DB = PostgresJsDatabase<typeof schema>;

let db: DB | null = null;
export async function getDb(): Promise<DB> {
    if (!db) {
        db = await createDb(POSTGRES_CONNECTION_STRING);
        init_db(db);
    }
    return db;
}

const rand = (n: number, o = 0): number => o + Math.floor(Math.random() * (n - o));

const words =
    'duis a vulputate lacus maecenas lorem massa finibus ac ultricies eu rhoncus viverra felis integer porttitor magna nunc sed pretium mauris tempus donec lectus nibh fermentum eget ex aliquet vestibulum augue faucibus tortor consectetur feugiat diam metus dignissim ipsum quis imperdiet non fusce varius elit suscipit mi consequat at nam efficitur nisi nec mattis sodales vivamus dapibus id porta ut enim convallis cras pharetra'.split(
        ' '
    );
const lip = (n: number, j: string = ' '): string => {
    return pick_n(words, n).join(j);
};

const pick_n = (arr: string[], n: number) => {
    const a = [...arr];
    return Array(n)
        .fill(0)
        .map(() => a.splice(rand(a.length), 1)[0]);
};

const rand_username = () => lip(rand(3, 2), '_');

const init_db = async (db: DB) => {
    console.log('running init');
    if ((await db.select().from(schema.userTable).limit(1)).length) {
        console.log('already run');
        return;
    }
    const v = Array(200)
        .fill(0)
        .map(() => ({
            username: rand_username(),
        }));

    let users: schema.User[] = [];
    while (v.length) {
        users = users.concat(
            await db
                .insert(schema.userTable)
                .values(v.splice(0, Math.min(100, v.length)))
                .returning()
        );
    }

    const channels = await db
        .insert(schema.channelTable)
        .values(
            users.slice(0, 20).map((u) => ({
                name: rand_username(),
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
        const t = pick_n(words, 5);
        tags[channel.id] = await db
            .insert(schema.channelTagsTable)
            .values(
                Array(5)
                    .fill(0)
                    .map((_, i) => ({
                        channelId: channel.id,
                        name: t[i],
                        color: `#${rand(255).toString(16)}${rand(255).toString(16)}${rand(255).toString(16)}`,
                    }))
            )
            .returning();
    }

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
                    title: lip(rand(10, 2)),
                    channelId: channels[rand(channels.length)].id,
                    createdBy: users[rand(users.length)].id,
                    videoId: video_ids[rand(video_ids.length)],
                }))
        )
        .returning();

    for (const post of posts) {
        const t = [...tags[post.channelId]];
        const fill = Array(rand(5, 1))
            .fill(0)
            .map(() => {
                const [tag] = t.splice(rand(t.length), 1);
                return {
                    postId: post.id,
                    tagId: tag.id,
                };
            });
        if (fill.length) {
            await db.insert(schema.postTagTable).values(fill).returning();
        }
    }

    console.log('user count:', users.length);
    console.log('channel count:', channels.length);
    console.log('posts count:', posts.length);

    for (const user of users) {
        const vote_v = [];
        for (const post of posts) {
            vote_v.push({
                postId: post.id,
                userId: user.id,
                vote: Math.random() > 0.25 ? ('UP' as const) : ('DOWN' as const),
            });
        }
        await db.insert(schema.postVoteTable).values(vote_v);
    }
    console.log('generated data');
};

export async function createDb(connectionString: string): Promise<DB> {
    console.log('creating db');

    // automatically run migrations if changes are made
    const migrationClient = postgres(connectionString);
    const migrationConfig: MigrationConfig = {
        migrationsFolder: 'drizzle',
    };
    await migrate(drizzle(migrationClient), migrationConfig);

    const queryClient = postgres(connectionString);
    return drizzle(queryClient, { schema });
}

/**
 * Represents constant access database for use in server functions.
 * Perhaps a better pattern can be found for this connection than simply exporting it as const
 */
