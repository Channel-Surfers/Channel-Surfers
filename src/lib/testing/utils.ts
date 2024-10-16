import { createDb, type DB } from '$lib/server';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Mutex } from 'async-mutex';
import { sql } from 'drizzle-orm';
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

const tableNames: string[] = [];
for (const tableName in db._.tableNamesMap) {
    if (tableName != '') tableNames.push(tableName);
}

export const mustGenerate = <T>(generated: T | null) => {
    if (!generated) throw new Error('Data was not generated');
    return generated;
};

export const testWithDb = <T>(
    name: string,
    testFunc: TestFunc<T>,
    generator?: DbStateGenerator<T>
) => {
    test(name, async ({ expect }) => {
        await lock.runExclusive(async () => {
            const query = `TRUNCATE TABLE ${tableNames
                .map((tn) => tn.split('.'))
                .map(([schema, tn]) => `"${schema}"."${tn}"`)
                .join(', ')} RESTART IDENTITY CASCADE;`;
            await db.execute(sql.raw(query));

            const generated = generator ? await generator(db) : undefined;

            await testFunc({ db, generated, expect });
        });
    });
};
