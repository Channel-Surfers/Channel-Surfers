import { describe } from 'vitest';
import { generateUsers, testWithDb } from '$lib/testing/utils';
import { userTable } from '../db/users.sql';
import type { DB } from '..';
import { getOrCreateUser, getUserById, getUserPermissionInfo } from './users';
import { channelTable } from '../db/channels.sql';
import { roleTable } from '../db/roles.sql';

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

    testWithDb(
        'user permissions can be summed',
        async ({ expect, db }, { user, channel }) => {
            const { permissions, topRole } = await getUserPermissionInfo(user.id, channel.id);
        },
        async (db: DB) => {
            const {
                users: [user],
            } = await generateUsers(1)(db);
            const [channel] = await db
                .insert(channelTable)
                .values({ name: `${user.username}s-c`, createdBy: user.id })
                .returning();
            // create permissions
            const permission = await db
                .insert(roleTable)
                .values([
                    { title: 'Owner', channelId: channel.id, ranking: 0, isOwner: true },
                    { title: 'Admin', channelId: channel.id, ranking: 1 },
                    { title: 'Moderator', channelId: channel.id, ranking: 2 },
                ])
                .returning();
            return { user, channel };
        }
    );
});
