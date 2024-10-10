import type { DB } from '..';
import { ResourceNotFoundError } from './utils/errors';
import { and, count, countDistinct, eq } from 'drizzle-orm';
import { userTable, type NewUser, type User } from '../db/users.sql';
import { postTable } from '../db/posts.sql';
import { postVoteTable } from '../db/votes.posts.sql';
import { followTable } from '../db/follows.sql';

export const getUserById = async (db: DB, id: string): Promise<User> => {
    const [ret] = await db.select().from(userTable).where(eq(userTable.id, id));

    if (!ret) {
        throw new ResourceNotFoundError({ message: 'Could not find user by provided id' });
    }

    return ret;
};

/**
 * Get user by an authentication method or methods
 */
export const getUserByAuth = async (
    db: DB,
    auth: { discordId?: bigint; githubId?: number }
): Promise<User | undefined> => {
    if (!auth.discordId && !auth.githubId) return undefined;

    const [ret] = await db
        .select()
        .from(userTable)
        .where(
            and(
                auth.discordId ? eq(userTable.discordId, auth.discordId) : undefined,
                auth.githubId ? eq(userTable.githubId, auth.githubId) : undefined
            )
        );

    return ret;
};

export const createUser = async (db: DB, newUser: NewUser): Promise<User> => {
    const [ret] = await db.insert(userTable).values(newUser).returning();

    if (!ret) {
        throw new ResourceNotFoundError({ message: 'Could not create new user' });
    }

    return ret;
};

/**
 * Get a user by their authentication method if they exist, otherwise create
 * the new user
 */
export const getOrCreateUser = async (
    db: DB,
    auth: { discordId?: bigint; githubId?: number },
    newUser: NewUser
): Promise<User> => (await getUserByAuth(db, auth)) ?? (await createUser(db, newUser));

/**
 * Get statistics about how many upvotes a user's posts have received
 */
export const getUserStats = async (db: DB, userId: string) => {
    const numberOfUpvotesQuery = db
        .select({ numberOfUpvotes: count(postTable.id) })
        .from(postTable)
        .leftJoin(postVoteTable, eq(postTable.id, postVoteTable.postId))
        .where(and(eq(postTable.createdBy, userId), eq(postVoteTable.vote, 'UP')));
    const numberOfDownvotesQuery = db
        .select({ numberOfDownvotes: count(postTable.id) })
        .from(postTable)
        .leftJoin(postVoteTable, eq(postTable.id, postVoteTable.postId))
        .where(and(eq(postTable.createdBy, userId), eq(postVoteTable.vote, 'DOWN')));
    const numberOfFollowersQuery = db
        .select({ numberOfFollowers: countDistinct(followTable.followerId) })
        .from(userTable)
        .leftJoin(followTable, eq(userTable.id, followTable.userId))
        .where(eq(userTable.id, userId));

    const [[{ numberOfUpvotes }], [{ numberOfDownvotes }], [{ numberOfFollowers }]] =
        await Promise.all([numberOfUpvotesQuery, numberOfDownvotesQuery, numberOfFollowersQuery]);
    return { numberOfUpvotes, numberOfDownvotes, numberOfFollowers };
};
export type UserStats = Awaited<ReturnType<typeof getUserStats>>;

/**
 * Given a username, find a user with the matching username
 */
export const getUserInfoByUsername = async (db: DB, username: string) => {
    const [user] = await db.select().from(userTable).where(eq(userTable.username, username));
    return { ...user, ...(await getUserStats(db, user.id)) };
};
export type UserInfoByName = Awaited<ReturnType<typeof getUserInfoByUsername>>;

export const userIsFollowing = async (db: DB, userId: string, followerId: string) => {
    const follows = await db
        .select()
        .from(followTable)
        .where(and(eq(followTable.userId, userId), eq(followTable.followerId, followerId)));
    return follows.length == 1;
};
