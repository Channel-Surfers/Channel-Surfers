import { createDb, type DB } from '$lib/server';
import { publicChannelTable } from '$lib/server/db/public.channels.sql';
import { tables } from '$lib/server/db/schema';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Mutex } from 'async-mutex';
import { sql } from 'drizzle-orm';

type DbStateGenerator<T> = (db: DB) => Promise<T>;
type TestFunc<T> = (args: { db: DB; generated?: Awaited<T> }) => Promise<void>;

const container = new PostgreSqlContainer();
const startedContainer = await container.start();
const lock = new Mutex();

export const mustGenerate = <T>(generated: T | null) => {
    if (!generated) process.exit(1);
    return generated;
};

export const withDb = async <T>(testFunc: TestFunc<T>, generator?: DbStateGenerator<T>) => {
    await lock.runExclusive(async () => {
        const db = await createDb(startedContainer.getConnectionUri());

        await db.transaction(async (tx) => {
            for (const table of tables) {
                await tx.delete(table);
            }
        });

        const generated = generator ? await generator(db) : undefined;

        await testFunc({ db, generated });
    });
};
