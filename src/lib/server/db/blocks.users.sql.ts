import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './users.sql';

/**
 * @document public.user_block.md
 */
export const userBlockTable = pgTable(
    'user_block',
    {
        userId: uuid('user_id')
            .notNull()
            .references(() => userTable.id),
        blockedUserId: uuid('blocked_user_id')
            .notNull()
            .references(() => userTable.id),
    },
    (table) => ({ pk: primaryKey({ columns: [table.userId, table.blockedUserId] }) })
);
/**
 * Represents a *blocks* relationship between users
 */
export type UserBlock = typeof userBlockTable.$inferSelect;
/**
 * Represents a new *blocks* relationship between users yet to be persisted
 */
export type NewUserBlock = typeof userBlockTable.$inferInsert;
