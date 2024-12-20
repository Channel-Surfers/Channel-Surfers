import { pgTable, uuid, text, timestamp, foreignKey, integer } from 'drizzle-orm/pg-core';
import { userTable } from './users.sql';
import { postTable } from './posts.sql';
//import { relations } from 'drizzle-orm';

/**
 * @document public.comment.md
 */
export const commentTable = pgTable(
    'comment',
    {
        // Be on lookout for ways of using uuidv7, ulid, or cuid2 instead of uuid
        id: uuid('id').primaryKey().defaultRandom(),
        content: text('content').notNull(),
        creatorId: uuid('creator_id')
            .notNull()
            .references(() => userTable.id),
        postId: uuid('post_id')
            .notNull()
            .references(() => postTable.id, { onDelete: 'cascade' }),
        replyTo: uuid('reply_to'),
        createdOn: timestamp('created_on').notNull().defaultNow(),
        updatedOn: timestamp('updated_on').notNull().defaultNow(),

        // Denormalise vote counts
        upvotes: integer('upvotes').notNull().default(0),
        downvotes: integer('downvotes').notNull().default(0),
    },
    (table) => ({
        parentReference: foreignKey({
            columns: [table.replyTo],
            foreignColumns: [table.id],
            name: 'comments_parent_id_fkey',
        }).onDelete('cascade'),
    })
);

/**
 * Represents a comment in reply to a post or in reply to another comment
 */
export type Comment = typeof commentTable.$inferSelect;
/**
 * Represents a comment which has yet to be persisted in the database
 */
export type NewComment = typeof commentTable.$inferInsert;
