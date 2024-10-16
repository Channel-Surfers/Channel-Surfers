import { createDb, type DB } from '$lib/server';
import { tables } from '$lib/server/db/schema';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Mutex } from 'async-mutex';
import { test, type ExpectStatic } from 'vitest';

type DbStateGenerator<T> = (db: DB) => Promise<T>;
type TestFunc<T> = (args: {
    db: DB;
    generated?: Awaited<T>;
    expect: ExpectStatic;
}) => Promise<void>;

const container = new PostgreSqlContainer();
const startedContainer = await container.start();
const db = await createDb(startedContainer.getConnectionUri());
const lock = new Mutex();

export const mustGenerate = <T>(generated: T | null) => {
    if (!generated) process.exit(1);
    return generated;
};

export const testWithDb = <T>(
    name: string,
    testFunc: TestFunc<T>,
    generator?: DbStateGenerator<T>
) => {
    test(name, async ({ expect }) => {
        await lock.runExclusive(async () => {
            await db.transaction(async (tx) => {
                for (const table of tables) {
                    await tx.delete(table);
                }
            });

            const generated = generator ? await generator(db) : undefined;

            await testFunc({ db, generated, expect });
        });
    });
};
