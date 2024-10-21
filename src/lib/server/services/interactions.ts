import { and, eq } from 'drizzle-orm';
import type { DB } from '..';
import { followTable } from '../db/follows.sql';

export const followUser = async (db: DB, followerId: string, userId: string) => {
    let [following] = await db
        .select()
        .from(followTable)
        .where(and(eq(followTable.followerId, followerId), eq(followTable.userId, userId)));
    if (following) {
        throw new Error('already following');
    }

    [following] = await db.insert(followTable).values({ followerId, userId }).returning();
    return following;
};

export const unfollowUser = async (db: DB, followerId: string, userId: string) => {
    const [deleted] = await db
        .delete(followTable)
        .where(and(eq(followTable.followerId, followerId), eq(followTable.userId, userId)))
        .returning();
    if (!deleted) {
        throw new Error('not following');
    }
    return true;
};
