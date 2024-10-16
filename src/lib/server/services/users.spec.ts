import { describe, test } from 'vitest';
import { mustGenerate, withDb } from '$lib/testing/utils';
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

describe.concurrent('users suite', () => {
    test('getting user by id returns successfully', async ({ expect }) => {
        await withDb(async ({ db, generated }) => {
            const { newUser } = mustGenerate(generated);

            const user = await getUserById(db, newUser.id);
            expect(user?.username).toStrictEqual(newUser.username);
        }, generateUser);
    });

    test('getOrCreateUser with no user in db', async ({ expect }) => {
        await withDb(async ({ db }) => {
            const newUser = {
                username: 'new_username',
            };

            const user = await getOrCreateUser(db, { discordId: 1n }, newUser);
            expect(user.username).toStrictEqual(newUser.username);
        });
    });

    test('getOrCreateUser with user in db', async ({ expect }) => {
        await withDb(async ({ db, generated }) => {
            const { newUser } = mustGenerate(generated);

            const user = await getOrCreateUser(
                db,
                { discordId: 1n },
                {
                    username: 'new_username',
                }
            );
            expect(user.username).toStrictEqual(newUser.username);
        }, generateUser);
    });

    test('getOrCreateUser with different user in db', async ({ expect }) => {
        await withDb(async ({ db, generated }) => {
            mustGenerate(generated);

            const newUser = {
                username: 'new_username',
            };

            const user = await getOrCreateUser(db, { discordId: 2n }, newUser);
            expect(user.username).toStrictEqual(newUser.username);
        }, generateUser);
    });
});
