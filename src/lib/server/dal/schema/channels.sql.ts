import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './users.sql';

export const channel = pgTable('channel', {
    // Be on lookout for ways of using uuidv7, ulid, or cuid2 instead of uuid
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    createdBy: uuid('created_by')
        .notNull()
        .references(() => user.id),
    createdOn: timestamp('created_on').notNull().defaultNow(),
    updatedOn: timestamp('updated_on').notNull().defaultNow(),
});
