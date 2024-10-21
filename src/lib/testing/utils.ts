import { createDb, type DB } from '$lib/server';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Mutex } from 'async-mutex';
import { sql } from 'drizzle-orm';
import { test, type ExtendedContext, type RunnerTestCase, type TestContext } from 'vitest';
import * as schema from '$lib/server/db/schema';

type DbStateGenerator<T> = (db: DB) => Promise<T>;
type TestArgs = { db: DB } & ExtendedContext<RunnerTestCase> & TestContext;

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

export function testWithDb(name: string, testFunc: (args: TestArgs) => Promise<void>): void;
export function testWithDb<T>(
    name: string,
    testFunc: (args: TestArgs, generated: Awaited<T>) => Promise<void>,
    generator: DbStateGenerator<T>
): void;
export function testWithDb<T>(
    name: string,
    testFunc:
        | ((args: TestArgs) => Promise<void>)
        | ((args: TestArgs, generated: Awaited<T>) => Promise<void>),
    generator?: DbStateGenerator<T>
) {
    test(name, async (testArgs) => {
        await lock.runExclusive(async () => {
            const query = `TRUNCATE TABLE ${tableNames
                .map((tn) => tn.split('.'))
                .map(([schema, tn]) => `"${schema}"."${tn}"`)
                .join(', ')} RESTART IDENTITY CASCADE;`;
            await db.execute(sql.raw(query));

            const newArgs = testArgs as TestArgs;
            newArgs.db = db;

            if (generator) {
                await testFunc(newArgs, mustGenerate(await generator(db)));
            } else {
                await (testFunc as (args: TestArgs) => Promise<void>)(newArgs);
            }
        });
    });
}

// mimics an iterator, but not an actual iterator so we don't need to do `.next().value`
export const sequentialDates = (
    start: Date | number = new Date(2020, 0),
    seconds_diff: number = 60 * 60 * 24
) => {
    let curr = +start;
    const r = {
        next: () => {
            const ret = curr;
            curr += seconds_diff * 1000;
            return new Date(ret);
        },
        take: (n: number) => {
            return Array(n).fill(undefined).map(r.next);
        },
    };
    return r;
};

export const createUsers = async (
    db: DB,
    count: number,
    prefix: string = ''
): Promise<schema.User[]> => {
    return await db
        .insert(schema.userTable)
        .values(Array.from({ length: count }, (_, i) => ({ username: `${prefix}user${i + 1}` })))
        .returning();
};
