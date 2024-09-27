import { pgTable, smallint, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { channel } from './channels.sql';

export const channelTags = pgTable("channel_tags", {
    id: uuid('id').primaryKey().defaultRandom(),
    channelId: uuid('channel_id').notNull().references(() => channel.id),
    name: varchar('name', { length: 16 }).notNull(),
    color: smallint("color").array(4).notNull(),
}, (table) => ({ unq: unique().on(table.name, table.channelId) }));

/**
 * Represents an available tag for a channel's posts
 */
export type ChannelTag = typeof channelTags.$inferSelect;
/**
 * Represents an new available tag for a channel's posts yet to be persisted
 */
export type NewChannelTag = typeof channelTags.$inferInsert;
