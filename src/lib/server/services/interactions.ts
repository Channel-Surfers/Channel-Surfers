import { and, eq } from 'drizzle-orm';
import type { DB } from '..';
import { followTable } from '../db/follows.sql';
import { userBlockTable } from '../db/blocks.users.sql';
import type { uuid } from '$lib/types';
import { subscriptionTable } from '../db/subscriptions.sql';

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

export const blockUser = async (db: DB, userId: uuid, blockedUserId: uuid) => {
    const [blocking] = await db
        .insert(userBlockTable)
        .values({ userId, blockedUserId })
        .onConflictDoNothing()
        .returning();
    if (!blocking) throw new Error('already blocking');
    return blocking;
};

export const unblockUser = async (db: DB, userId: uuid, blockedUserId: uuid) => {
    const [deleted] = await db
        .delete(userBlockTable)
        .where(
            and(eq(userBlockTable.userId, userId), eq(userBlockTable.blockedUserId, blockedUserId))
        )
        .returning();
    if (!deleted) throw new Error('not blocking');
    return true;
};

export const subscribe = async (db: DB, userId: uuid, channelId: uuid) => {
    const [subscription] = await db
        .insert(subscriptionTable)
        .values({ userId, channelId })
        .onConflictDoNothing()
        .returning();
    if (!subscription) throw new Error('already subscribed');
    return subscription;
};

export const unsubscribe = async (db: DB, userId: uuid, channelId: uuid) => {
    const [subscription] = await db
        .delete(subscriptionTable)
        .where(
            and(eq(subscriptionTable.userId, userId), eq(subscriptionTable.channelId, channelId))
        )
        .returning();
    if (!subscription) throw new Error('not subscribed');
    return true;
};
