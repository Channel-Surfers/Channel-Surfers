import { POSTGRES_CONNECTION_STRING } from '$env/static/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const queryClient = postgres(POSTGRES_CONNECTION_STRING);
export const db = drizzle(queryClient);
export type DB = typeof db;
