import { pgTable, uuid, timestamp, varchar } from 'drizzle-orm/pg-core';
import { channelTable } from './channels.sql';

export const publicChannelTable = pgTable('public_channel', {
    channelId: uuid('post_id')
        .notNull()
        .references(() => channelTable.id),
    name: varchar('name', { length: 25 }).notNull().unique(),
    datePublished: timestamp('date_published').notNull().defaultNow(),
});

/**
 * This implies that a channel has been made public
 */
export type PublicChannel = typeof publicChannelTable.$inferSelect;
export type NewPublicChannel = typeof publicChannelTable.$inferInsert;
