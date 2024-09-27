import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { post } from './posts.sql';
import { channel } from "./channels.sql";

export const channelPostReport = pgTable('channel_post_report', {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id').notNull().references(() => post.id),
    channelId: uuid('channel_id').notNull().references(() => channel.id),
    description: text('description').notNull(),
});

/**
 * Represents a report that a post violates the rules of a channel
 */
export type ChannelPostReport = typeof channelPostReport.$inferSelect;
/**
 * Represents a new report that a post violates the rules of a channel yet to be persisted
 */
export type NewChannelPostReport = typeof channelPostReport.$inferInsert;
