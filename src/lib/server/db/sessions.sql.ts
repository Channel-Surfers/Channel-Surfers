import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './users.sql';

/**
 * @document public.session.md
 */
export const sessionTable = pgTable('session', {
    id: text('id').primaryKey(),
    userId: uuid('user_id')
        .notNull()
        .references(() => userTable.id),
    expiresAt: timestamp('expires_at', {
        withTimezone: true,
        mode: 'date',
    }).notNull(),
});

export type Session = typeof sessionTable.$inferSelect;
