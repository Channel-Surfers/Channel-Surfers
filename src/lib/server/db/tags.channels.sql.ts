import { pgTable, unique, uuid, varchar } from 'drizzle-orm/pg-core';
import { channelTable } from './channels.sql';

export const channelTagsTable = pgTable(
    'channel_tags',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        channelId: uuid('channel_id')
            .notNull()
            .references(() => channelTable.id),
        name: varchar('name', { length: 16 }).notNull(),
        color: varchar('color', { length: 16 }).notNull(),
    },
    (table) => ({ unq: unique().on(table.name, table.channelId) })
);

/**
 * Represents an available tag for a channel's posts
 */
export type ChannelTag = typeof channelTagsTable.$inferSelect;
/**
 * Represents an new available tag for a channel's posts yet to be persisted
 */
export type NewChannelTag = typeof channelTagsTable.$inferInsert;
