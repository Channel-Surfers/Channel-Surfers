import type { DB } from '..';
import { ResourceNotFoundError } from './utils/errors';
import { and, count, countDistinct, eq } from 'drizzle-orm';
import { userTable, type NewUser, type User } from '../db/users.sql';
import { postTable } from '../db/posts.sql';
import { postVoteTable } from '../db/votes.posts.sql';

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

    const [[{ numberOfUpvotes }], [{ numberOfDownvotes }]] = await Promise.all([
        numberOfUpvotesQuery,
        numberOfDownvotesQuery,
    ]);
    return { numberOfUpvotes, numberOfDownvotes };
};
