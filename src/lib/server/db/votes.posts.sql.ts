import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { userTable } from './users.sql';
import { voteEnum } from './types.sql';
import { postTable } from './posts.sql';

export const postVoteTable = pgTable(
    'post_vote',
    {
        postId: uuid('post_id')
            .notNull()
            .references(() => postTable.id),
        userId: uuid('user_id')
            .notNull()
            .references(() => userTable.id),
        vote: voteEnum('vote').notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.postId, table.userId] }),
    })
);

/**
 * Represents a User's feelings toward a particular post
 */
export type PostVote = typeof postVoteTable.$inferSelect;
export type NewPostVote = typeof postVoteTable.$inferInsert;
