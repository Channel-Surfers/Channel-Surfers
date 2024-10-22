import { testWithDb } from '$lib/testing/utils';
import { describe } from 'vitest';
import type { DB } from '..';
import { userTable } from '../db/users.sql';
import { blockUser, followUser, unblockUser, unfollowUser } from './interactions';

const generateUser = (count: number, nameGenerator?: (n: number) => string) => async (db: DB) => {
    const users = await db
        .insert(userTable)
        .values(
            Array(count)
                .fill(0)
                .map((_: number, idx) => ({
                    username: nameGenerator ? nameGenerator(idx) : `user-${idx}`,
                    discordId: BigInt(idx),
                }))
        )
        .returning();
    return { users };
};

/**
 * Create `count + 1` users where the first user is followed by the rest
 * `followings.length = 1`
 */
const generateUserAndFollowers =
    (count: number, nameGenerator?: (n: number) => string) => async (db: DB) => {
        if (count < 0) throw new Error('negative amount of followers provided');

        const {
            users: [user, ...followers],
        } = await generateUser(count + 1, nameGenerator)(db);

        if (followers.length != count)
            throw new Error(
                `Something went wrong generating followers. Have ${followers.length}, need ${count}`
            );

        const followings = await Promise.all(
            followers.map((follower) => followUser(db, follower.id, user.id))
        );
        return { user, followers, followings };
    };

describe.concurrent('interactions suite', () => {
    testWithDb(
        'users can be followed',
        async ({ expect, db }, { users: [user1, user2] }) => {
            const following = await followUser(db, user1.id, user2.id);
            expect(following.followerId).toStrictEqual(user1.id);
            expect(following.userId).toStrictEqual(user2.id);
        },
        generateUser(2)
    );

    testWithDb(
        'users can be unfollowed',
        async ({ db, expect }, { user, followers: [follower] }) => {
            const unfollowed = await unfollowUser(db, follower.id, user.id);
            expect(unfollowed).toBeTruthy();
        },
        generateUserAndFollowers(1)
    );

    testWithDb(
        'users cannot duplicate follow',
        async ({ expect, db }, { users: [user1, user2] }) => {
            const _following = await followUser(db, user1.id, user2.id);
            await expect(() => followUser(db, user1.id, user2.id)).rejects.toThrowError(
                'already following'
            );
        },
        generateUser(2)
    );

    testWithDb(
        'user not following',
        async ({ expect, db }, { users: [user1, user2] }) => {
            await expect(() => unfollowUser(db, user1.id, user2.id)).rejects.toThrowError(
                'not following'
            );
        },
        generateUser(2)
    );

    testWithDb(
        'users cannot duplicate block',
        async ({ expect, db }, { users: [user1, user2] }) => {
            await blockUser(db, user1.id, user2.id);
            await expect(() => blockUser(db, user1.id, user2.id)).rejects.toThrowError(
                'already blocking'
            );
        },
        generateUser(2)
    );

    testWithDb(
        'user not blocking',
        async ({ expect, db }, { users: [user1, user2] }) => {
            await expect(() => unblockUser(db, user1.id, user2.id)).rejects.toThrowError(
                'not blocking'
            );
        },
        generateUser(2)
    );
});
