import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { post } from './posts.sql';

export const postReport = pgTable('post_report', {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
        .notNull()
        .references(() => post.id),
    description: text('description').notNull(),
});

/**
 * Represents a report that a post violates the site's rules
 */
export type PostReport = typeof postReport.$inferSelect;
/**
 * Represents a new report that a post violates the site's rules yet to be persisted
 */
export type NewPostReport = typeof postReport.$inferInsert;
