import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { user } from './users.sql';
import { comment } from './comments.sql';
import { voteEnum } from './types.sql';

export const commentVote = pgTable(
    'comment_vote',
    {
        commentId: uuid('comment_id').references(() => comment.id),
        userId: uuid('user_id').references(() => user.id),
        vote: voteEnum('vote'),
    },
    (table) => ({ pk: primaryKey({ columns: [table.commentId, table.userId] }) })
);

/**
 * Represents a user's feelings toward a comment
 */
export type CommentVote = typeof comment.$inferSelect;
export type NewCommentVote = typeof comment.$inferInsert;
