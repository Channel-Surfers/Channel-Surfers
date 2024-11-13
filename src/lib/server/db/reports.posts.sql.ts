import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { postTable } from './posts.sql';
import { reportStatusEnum } from './types.sql';

/**
 * @document public.post_report.md
 */
export const postReportTable = pgTable('post_report', {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id').references(() => postTable.id, { onDelete: 'set null' }),
    description: text('description').notNull(),
    resolution: text('resolution'),
    status: reportStatusEnum('status').notNull().default('INVESTIGATING'),
});

/**
 * Represents a report that a post violates the site's rules
 * A `null` `postId` value indicatest that the reported post has been deleted
 */
export type PostReport = typeof postReportTable.$inferSelect;
/**
 * Represents a new report that a post violates the site's rules yet to be persisted
 */
export type NewPostReport = typeof postReportTable.$inferInsert;
