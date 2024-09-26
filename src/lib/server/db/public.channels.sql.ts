import { pgTable, uuid, timestamp, varchar } from 'drizzle-orm/pg-core';
import { post } from './posts.sql';

export const publicChannel = pgTable('public_channel', {
    channelId: uuid('post_id')
        .notNull()
        .references(() => post.id),
    name: varchar('name', { length: 25 }).notNull().unique(),
    datePublished: timestamp('date_published').notNull().defaultNow(),
});

/**
 * This implies that a channel has been made public
 */
export type PublicChannel = typeof publicChannel.$inferSelect;
export type NewPublicChannel = typeof publicChannel.$inferInsert;
