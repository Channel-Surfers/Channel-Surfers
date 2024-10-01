import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { userTable } from './users.sql';

/**
 * @document public.channel.md
 */
export const channelTable = pgTable('channel', {
    // Be on lookout for ways of using uuidv7, ulid, or cuid2 instead of uuid
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    guidelines: text('guidelines'),
    createdBy: uuid('created_by')
        .notNull()
        .references(() => userTable.id),
    createdOn: timestamp('created_on').notNull().defaultNow(),
    updatedOn: timestamp('updated_on').notNull().defaultNow(),
});

/**
 * Represents a channel where posts can be shared
 */
export type Channel = typeof channelTable.$inferSelect;
/**
 * Represents a new channel yet to be persisted
 */
export type NewChannel = typeof channelTable.$inferInsert;
