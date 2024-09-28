import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './users.sql';

export const channel = pgTable('channel', {
    // Be on lookout for ways of using uuidv7, ulid, or cuid2 instead of uuid
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    guidelines: text('guidelines'),
    createdBy: uuid('created_by')
        .notNull()
        .references(() => user.id),
    createdOn: timestamp('created_on').notNull().defaultNow(),
    updatedOn: timestamp('updated_on').notNull().defaultNow(),
});

/**
 * Represents a channel where posts can be shared
 */
export type Channel = typeof channel.$inferSelect;
/**
 * Represents a new channel yet to be persisted
 */
export type NewChannel = typeof channel.$inferInsert;
