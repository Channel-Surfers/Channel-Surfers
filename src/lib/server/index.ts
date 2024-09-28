import { POSTGRES_CONNECTION_STRING } from '$env/static/private';
import type { MigrationConfig } from 'drizzle-orm/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { user, type User } from './db/users.sql';
import { channel } from './db/channels.sql';
import { post } from './db/posts.sql';

const migrationClient = postgres('postgres://postgres:adminadmin@0.0.0.0:5432/db', { max: 1 });
const migrationConfig: MigrationConfig = {
    migrationsFolder: '',
};
migrate(drizzle(migrationClient), migrationConfig);

const queryClient = postgres(POSTGRES_CONNECTION_STRING);
export const db = drizzle(queryClient);
export type DB = typeof db;

const jack = (await db.insert(user).values({ username: 'Jack', role: 'ADMIN' }).returning())[0];

const newChannel = (
    await db.insert(channel).values({ name: 'Test Channel', createdBy: jack.id }).returning()
)[0];

const newPost = (
    await db
        .insert(post)
        .values({
            title: 'Test post',
            createdBy: jack.id,
            channelId: newChannel.id,
            videoId: 'SOMEBUNNYID',
        })
        .returning()
)[0];
