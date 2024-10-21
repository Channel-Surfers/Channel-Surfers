import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './users.sql';

/**
 * @document public.follow.md
 */
export const followTable = pgTable(
    'follow',
    {
        followerId: uuid('follower_id')
            .notNull()
            .references(() => userTable.id),
        userId: uuid('user_id')
            .notNull()
            .references(() => userTable.id),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.userId, table.followerId] }),
    })
);

/**
 * Represents a user following another user *relates users to other users*
 */
export type Follow = typeof followTable.$inferSelect;
/**
 * Represents a new *following* relation
 */
export type NewFollow = typeof followTable.$inferInsert;
