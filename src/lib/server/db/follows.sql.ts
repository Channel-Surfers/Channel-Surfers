import { pgTable, uuid } from 'drizzle-orm/pg-core';

export const follow = pgTable(
    'follow',
    {
        followerId: uuid('follower_id').notNull(),
        userId: uuid('user_id').notNull(),
    },
    (table) => ({ pk: { columns: [table.userId, table.followerId] } })
);

/**
 * Represents a user following another user *relates users to other users*
 */
export type Follow = typeof follow.$inferSelect;
/**
 * Represents a new *following* relation
 */
export type NewFollow = typeof follow.$inferInsert;
