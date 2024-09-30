import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { channelTable } from './channels.sql';
import { reportStatusEnum } from './types.sql';

export const channelReportTable = pgTable('channel_report', {
    id: uuid('id').primaryKey().defaultRandom(),
    channelId: uuid('channel_id').references(() => channelTable.id),
    description: text('description').notNull(),
    resolution: text('resolution'),
    status: reportStatusEnum('status').notNull().default('INVESTIGATING'),
});

/**
 * Represents a report that a channel violates the site's rules
 * Null channelId indicates that the channel has been deleted
 */
export type ChannelReport = typeof channelReportTable.$inferSelect;
/**
 * Represents a new report that a channel violates the site's rules yet to be persisted
 */
export type NewChannelReport = typeof channelReportTable.$inferInsert;
