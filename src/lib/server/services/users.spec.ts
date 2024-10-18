import { describe } from 'vitest';
import { mustGenerate, testWithDb } from '$lib/testing/utils';
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
    testWithDb(
        'getting user by id returns successfully',
        async ({ expect, db }, { newUser }) => {
            const user = await getUserById(db, newUser.id);
            expect(user?.username).toStrictEqual(newUser.username);
        },
        generateUser
    );

    testWithDb('getOrCreateUser with no user in db', async ({ expect, db }) => {
        const newUser = {
            username: 'new_username',
        };

        const user = await getOrCreateUser(db, { discordId: 1n }, newUser);
        expect(user.username).toStrictEqual(newUser.username);
    });

    testWithDb(
        'getOrCreateUser with user in db',
        async ({ expect, db }, { newUser }) => {
            const user = await getOrCreateUser(
                db,
                { discordId: 1n },
                {
                    username: 'new_username',
                }
            );
            expect(user.username).toStrictEqual(newUser.username);
        },
        generateUser
    );

    testWithDb(
        'getOrCreateUser with different user in db',
        async ({ expect, db }) => {
            const newUser = {
                username: 'new_username',
            };

            const user = await getOrCreateUser(db, { discordId: 2n }, newUser);
            expect(user.username).toStrictEqual(newUser.username);
        },
        generateUser
    );
});
