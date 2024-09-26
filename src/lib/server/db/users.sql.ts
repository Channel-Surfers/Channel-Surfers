import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
    id: uuid('id').primaryKey().defaultRandom(),
    /**
     * Username valid chars are of regex: [a-zA-Z\-\_]{1, 25}
     */
    username: varchar('username', { length: 25 }).notNull(),
    createdOn: timestamp('created_on').notNull().defaultNow(),
    updatedOn: timestamp('updated_on').notNull().defaultNow(),
});