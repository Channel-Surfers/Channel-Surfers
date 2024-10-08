import { POSTGRES_CONNECTION_STRING } from '$env/static/private';
import type { MigrationConfig } from 'drizzle-orm/migrator';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import db_init from './db_init';
import { dev } from '$app/environment';

import * as schema from './db/schema';

export type DB = PostgresJsDatabase<typeof schema>;

let db: DB | null = null;
export async function getDb(): Promise<DB> {
    if (!db) {
        db = await createDb(POSTGRES_CONNECTION_STRING);
        if (dev) {
            db_init(db);
        }
    }
    return db;
}

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
