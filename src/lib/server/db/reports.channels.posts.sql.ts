import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { postTable } from './posts.sql';
import { reportStatusEnum } from './types.sql';
import { userTable } from './users.sql';

/**
 * @document public.channel_post_report.md
 */
export const channelPostReportTable = pgTable('channel_post_report', {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id').references(() => postTable.id),
    reporterId: uuid('reporter_id').references(() => userTable.id),
    description: text('description').notNull(),
    resolution: text('resolution'),
    status: reportStatusEnum('status').notNull().default('INVESTIGATING'),
});

/**
 * Represents a report that a post violates the rules of a channel
 * A `null` `postId` indicates that the offending post has been deleted.
 */
export type ChannelPostReport = typeof channelPostReportTable.$inferSelect;
/**
 * Represents a new report that a post violates the rules of a channel yet to be persisted
 */
export type NewChannelPostReport = typeof channelPostReportTable.$inferInsert;
