import { boolean, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { channel } from './channels.sql';
import { user } from './users.sql';

export const channelBannedUser = pgTable(
    'channel_user_ban',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        channelId: uuid('channel_id')
            .notNull()
            .references(() => channel.id),
        userId: uuid('user_id')
            .notNull()
            .references(() => user.id),
        createdOn: timestamp('created_on').notNull().defaultNow(),
        pardoned: boolean('pardoned').notNull().default(false),
    },
    (table) => ({ unq: unique().on(table.channelId, table.userId) })
);

/**
 * Represents a *ban* relation between a channel and a user
 */
export type ChannelBannedUser = typeof channelBannedUser.$inferSelect;
/**
 * Represents a new *ban* relation between a channel and a user yet to be persisted
 */
export type NewChannelBannedUser = typeof channelBannedUser.$inferInsert;
