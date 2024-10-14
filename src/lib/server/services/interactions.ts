import { and, eq } from 'drizzle-orm';
import type { DB } from '..';
import { followTable } from '../db/follows.sql';

export const followUser = async (db: DB, followerId: string, userId: string) => {
    const [following] = await db.insert(followTable).values({ followerId, userId }).returning();
    return following;
};

export const unfollowUser = async (db: DB, followerId: string, userId: string) => {
    await db
        .delete(followTable)
        .where(and(eq(followTable.followerId, followerId), eq(followTable.userId, userId)));
    return true;
};
