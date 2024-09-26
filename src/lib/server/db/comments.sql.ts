import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './users.sql';
import { post } from './posts.sql';
//import { relations } from 'drizzle-orm';

export const comment = pgTable('comment', {
    // Be on lookout for ways of using uuidv7, ulid, or cuid2 instead of uuid
    id: uuid('id').primaryKey().defaultRandom(),
    content: text('content').notNull(),
    creatorId: uuid('creator_id')
        .notNull()
        .references(() => user.id),
    postId: uuid('post_id')
        .notNull()
        .references(() => post.id),
    replyTo: uuid('reply_to'),
    createdOn: timestamp('created_on').notNull().defaultNow(),
    updatedOn: timestamp('updated_on').notNull().defaultNow(),
});

//export const commentRelations = relations(comment, ({ one }) => ({
//    parent: one(comment, {
//        fields: [comment.replyTo],
//        references: [comment.id],
//    }),
//}));

/**
 * Represents a comment in reply to a post or in reply to another comment
 */
export type Comment = typeof comment.$inferSelect;
/**
 * Represents a comment which has yet to be persisted in the database
 */
export type NewComment = typeof comment.$inferInsert;
