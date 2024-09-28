import { POSTGRES_CONNECTION_STRING } from '$env/static/private';
import type { MigrationConfig } from 'drizzle-orm/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// automatically run migrations if changes are made
const migrationClient = postgres(POSTGRES_CONNECTION_STRING);
const migrationConfig: MigrationConfig = {
    migrationsFolder: 'drizzle',
};
migrate(drizzle(migrationClient), migrationConfig);

const queryClient = postgres(POSTGRES_CONNECTION_STRING);
export const db = drizzle(queryClient);
export type DB = typeof db;
