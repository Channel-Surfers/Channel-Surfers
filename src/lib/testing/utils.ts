import { createDb, type DB } from '$lib/server';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Mutex } from 'async-mutex';
import { sql } from 'drizzle-orm';
import { test, type ExtendedContext, type RunnerTestCase, type TestContext } from 'vitest';

type DbStateGenerator<T> = (db: DB) => Promise<T>;
type TestArgs<T> = { db: DB; generated?: Awaited<T> } & ExtendedContext<RunnerTestCase> &
    TestContext;
type TestFunc<T> = (args: TestArgs<T>) => Promise<void>;

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
    test(name, async (testArgs) => {
        await lock.runExclusive(async () => {
            const query = `TRUNCATE TABLE ${tableNames
                .map((tn) => tn.split('.'))
                .map(([schema, tn]) => `"${schema}"."${tn}"`)
                .join(', ')} RESTART IDENTITY CASCADE;`;
            await db.execute(sql.raw(query));

            const generated = generator ? await generator(db) : undefined;

            const newArgs = testArgs as TestArgs<T>;
            newArgs.db = db;
            newArgs.generated = generated;

            await testFunc(newArgs);
        });
    });
};
