import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { post } from './posts.sql';
import { reportStatusEnum } from './types.sql';

export const postReport = pgTable('post_report', {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id').references(() => post.id),
    description: text('description').notNull(),
    resolution: text('resolution'),
    status: reportStatusEnum('status').notNull().default('INVESTIGATING'),
});

/**
 * Represents a report that a post violates the site's rules
 * A `null` `postId` value indicatest that the reported post has been deleted
 */
export type PostReport = typeof postReport.$inferSelect;
/**
 * Represents a new report that a post violates the site's rules yet to be persisted
 */
export type NewPostReport = typeof postReport.$inferInsert;
