import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { user } from './users.sql';
import { comment } from './comments.sql';
import { voteEnum } from './types.sql';

export const commentVote = pgTable('comment_vote', {
    commentId: uuid('comment_id')
        .primaryKey()
        .references(() => comment.id),
    userId: uuid('user_id')
        .primaryKey()
        .references(() => user.id),
    vote: voteEnum('vote'),
    createdOn: timestamp('created_on').notNull().defaultNow(),
    updatedOn: timestamp('updated_on').notNull().defaultNow(),
});

/**
 * Represents a user's feelings toward a comment
 */
export type CommentVote = typeof comment.$inferSelect;
export type NewCommentVote = typeof comment.$inferInsert;
