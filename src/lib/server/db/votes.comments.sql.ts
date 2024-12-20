import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { userTable } from './users.sql';
import { commentTable } from './comments.sql';
import { voteEnum } from './types.sql';

/**
 * @document public.comment_vote.md
 */
export const commentVoteTable = pgTable(
    'comment_vote',
    {
        commentId: uuid('comment_id').references(() => commentTable.id, { onDelete: 'cascade' }),
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
