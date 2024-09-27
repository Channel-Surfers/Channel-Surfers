import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { user } from "./users.sql";
import { channel } from "./channels.sql";

export const channelUserReport = pgTable('channel_user_reports', {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id').notNull().references(() => user.id),
    channelId: uuid('channel_id').notNull().references(() => channel.id),
    description: text('description').notNull(),
});

/**
 * Represents a report that a user violates the rules of a channel
 */
export type ChannelUserReport = typeof channelUserReport.$inferSelect;
/**
 * Represents a new report that a user violates the rules of a channel yet to be persisted
 */
export type NewChannelUserReport = typeof channelUserReport.$inferInsert;
