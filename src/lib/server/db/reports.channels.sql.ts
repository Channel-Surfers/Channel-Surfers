import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { channel } from "./channels.sql";

export const channelReport = pgTable('channel_report', {
    id: uuid('id').primaryKey().defaultRandom(),
    channelId: uuid('channel_id').notNull().references(() => channel.id),
    description: text('description').notNull(),
});

/**
 * Represents a report that a channel violates the site's rules
 */
export type ChannelReport = typeof channelReport.$inferSelect;
/**
 * Represents a new report that a channel violates the site's rules yet to be persisted
 */
export type NewChannelReport = typeof channelReport.$inferInsert;
