import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './users.sql';
import { channel } from './channels.sql';

export const post = pgTable('post', {
    // Be on lookout for ways of using uuidv7, ulid, or cuid2 instead of uuid
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('name').notNull(),
    description: text('description'),
    altText: text('alt_text'),
    createdBy: uuid('created_by')
        .notNull()
        .references(() => user.id),
    channelId: uuid('channel_id')
        .notNull()
        .references(() => channel.id),
    videoId: text('video_id').notNull(),
    createdOn: timestamp('created_on').notNull().defaultNow(),
    updatedOn: timestamp('updated_on').notNull().defaultNow(),
});

export type Post = typeof post.$inferSelect;
export type NewPost = typeof post.$inferInsert;
