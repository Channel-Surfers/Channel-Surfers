import type { DB } from '..';
import { ResourceNotFoundError } from './utils/errors';
import { and, eq } from 'drizzle-orm';
import { userTable, type NewUser, type User } from '../db/users.sql';

export const getUserById = async (db: DB, id: string): Promise<User> => {
    const [ret] = await db.select().from(userTable).where(eq(userTable.id, id));

    if (!ret) {
        throw new ResourceNotFoundError({ message: 'Could not find user by provided id' });
    }

    return ret;
};

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
