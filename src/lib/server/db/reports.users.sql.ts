import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './users.sql';
import { reportStatusEnum } from './types.sql';

/**
 * @document public.user_report.md
 */
export const userReportTable = pgTable('user_report', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => userTable.id),
    reporterId: uuid('reporter_id').references(() => userTable.id),
    description: text('description').notNull(),
    resolution: text('resolution'),
    status: reportStatusEnum('status').notNull().default('INVESTIGATING'),
});

/**
 * Represents a report that a user violates the site's rules
 * A `null` `userId` value indicates that the user has been deleted
 */
export type UserReport = typeof userReportTable.$inferSelect;
/**
 * Represents a new report that a user violates the site's rules yet to be persisted
 */
export type NewUserReport = typeof userReportTable.$inferInsert;
