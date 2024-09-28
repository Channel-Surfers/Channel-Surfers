import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { user } from './users.sql';

export const userBlock = pgTable(
    'user_block',
    {
        userId: uuid('user_id')
            .notNull()
            .references(() => user.id),
        blockedUserId: uuid('blocked_user_id')
            .notNull()
            .references(() => user.id),
    },
    (table) => ({ pk: primaryKey({ columns: [table.userId, table.blockedUserId] }) })
);
/**
 * Represents a *blocks* relationship between users
 */
export type UserBlock = typeof userBlock.$inferSelect;
/**
 * Represents a new *blocks* relationship between users yet to be persisted
 */
export type NewUserBlock = typeof userBlock.$inferInsert;
