import { boolean, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { channelTable } from './channels.sql';
import { userTable } from './users.sql';

/**
 * @document public.channel_user_ban.md
 */
export const channelBannedUserTable = pgTable('channel_user_ban', {
    id: uuid('id').primaryKey().defaultRandom(),
    channelId: uuid('channel_id')
        .notNull()
        .references(() => channelTable.id),
    userId: uuid('user_id')
        .notNull()
        .references(() => userTable.id),
    createdOn: timestamp('created_on').notNull().defaultNow(),
    pardoned: boolean('pardoned').notNull().default(false),
});

/**
 * Represents a *ban* relation between a channel and a user
 */
export type ChannelBannedUser = typeof channelBannedUserTable.$inferSelect;
/**
 * Represents a new *ban* relation between a channel and a user yet to be persisted
 */
export type NewChannelBannedUser = typeof channelBannedUserTable.$inferInsert;
