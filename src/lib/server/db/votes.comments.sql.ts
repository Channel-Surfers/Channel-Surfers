import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { userTable } from './users.sql';
import { commentTable } from './comments.sql';
import { voteEnum } from './types.sql';

export const commentVoteTable = pgTable(
    'comment_vote',
    {
        commentId: uuid('comment_id').references(() => commentTable.id),
        userId: uuid('user_id').references(() => userTable.id),
        vote: voteEnum('vote'),
    },
    (table) => ({ pk: primaryKey({ columns: [table.commentId, table.userId] }) })
);

/**
 * Represents a user's feelings toward a comment
 */
export type CommentVote = typeof commentTable.$inferSelect;
export type NewCommentVote = typeof commentTable.$inferInsert;
