import { describe, it } from 'vitest';
import { createTestingDb, mustGenerate } from '$lib/testing/utils';
import { userTable } from '../db/users.sql';
import type { DB } from '..';
import { getOrCreateUser, getUserById } from './users';

const generateUser = async (db: DB) => {
    const [newUser] = await db
        .insert(userTable)
        .values({
            username: 'AwesomeGuy',
            discordId: 1n,
        })
        .returning();
    return { newUser };
};

describe('users suite', () => {
    it.concurrent('getting user by id returns successfully', async ({ expect }) => {
        const { db, generated } = await createTestingDb(generateUser);

        const { newUser } = mustGenerate(generated);

        const user = await getUserById(db, newUser.id);
        expect(user?.username).toStrictEqual(newUser.username);
    });

    it.concurrent('getOrCreateUser with no user in db', async ({ expect }) => {
        const { db } = await createTestingDb();

        const newUser = {
            username: 'new_username',
        };

        const user = await getOrCreateUser(db, { discordId: 1n }, newUser);
        expect(user.username).toStrictEqual(newUser.username);
    });

    it.concurrent('getOrCreateUser with user in db', async ({ expect }) => {
        const { db, generated } = await createTestingDb(generateUser);

        const { newUser } = mustGenerate(generated);

        const user = await getOrCreateUser(
            db,
            { discordId: 1n },
            {
                username: 'new_username',
            }
        );
        expect(user.username).toStrictEqual(newUser.username);
    });

    it.concurrent('getOrCreateUser with different user in db', async ({ expect }) => {
        const { db, generated } = await createTestingDb(generateUser);

        mustGenerate(generated);

        const newUser = {
            username: 'new_username',
        };

        const user = await getOrCreateUser(db, { discordId: 2n }, newUser);
        expect(user.username).toStrictEqual(newUser.username);
    });
});
