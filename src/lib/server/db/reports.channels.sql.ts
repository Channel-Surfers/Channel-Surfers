import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { channel } from './channels.sql';
import { reportStatusEnum } from './types.sql';

export const channelReport = pgTable('channel_report', {
    id: uuid('id').primaryKey().defaultRandom(),
    channelId: uuid('channel_id').references(() => channel.id),
    description: text('description').notNull(),
    resolution: text('resolution'),
    status: reportStatusEnum('status').notNull().default('INVESTIGATING'),
});

/**
 * Represents a report that a channel violates the site's rules
 * Null channelId indicates that the channel has been deleted
 */
export type ChannelReport = typeof channelReport.$inferSelect;
/**
 * Represents a new report that a channel violates the site's rules yet to be persisted
 */
export type NewChannelReport = typeof channelReport.$inferInsert;
