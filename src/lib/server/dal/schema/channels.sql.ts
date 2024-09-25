import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.sql';

export const channels = pgTable('channels', {
    // Be on lookout for ways of using uuidv7, ulid, or cuid2 instead of uuid
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    createdBy: uuid('created_by')
        .notNull()
        .references(() => users.id),
    createdOn: timestamp('created_on').notNull().defaultNow(),
    updatedOn: timestamp('updated_on').notNull().defaultNow(),
});
