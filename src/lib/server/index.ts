import { POSTGRES_CONNECTION_STRING } from '$env/static/private';
import type { MigrationConfig } from 'drizzle-orm/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const migrationClient = postgres('postgres://postgres:adminadmin@0.0.0.0:5432/db', { max: 1 });
const migrationConfig: MigrationConfig = {
    migrationsFolder: '',
};
migrate(drizzle(migrationClient), migrationConfig);

const queryClient = postgres(POSTGRES_CONNECTION_STRING);
export const db = drizzle(queryClient);
export type DB = typeof db;
