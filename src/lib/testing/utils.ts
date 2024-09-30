import { createDb, type DB } from '$lib/server';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

export const createTestingDb = async <T>(generator?: (db: DB) => Promise<T>) => {
    const container = new PostgreSqlContainer();
    const startedContainer = await container.start();
    const db = await createDb(startedContainer.getConnectionUri());

    const generated = generator ? await generator(db) : null;

    return { container: startedContainer, db, generated };
};

export const mustGenerate = <T>(generated: T | null) => {
    if (!generated) process.exit(1);
    return generated;
};
