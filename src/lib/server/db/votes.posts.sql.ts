import { pgTable, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { user } from './users.sql';
import { voteEnum } from './types.sql';
import { post } from './posts.sql';

export const postVote = pgTable(
    'post_vote',
    {
        postId: uuid('post_id')
            .notNull()
            .references(() => post.id),
        userId: uuid('user_id')
            .notNull()
            .references(() => user.id),
        vote: voteEnum('vote').notNull(),
        createdOn: timestamp('created_on').notNull().defaultNow(),
        updatedOn: timestamp('updated_on').notNull().defaultNow(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.postId, table.userId] }),
    })
);

/**
 * Represents a User's feelings toward a particular post
 */
export type PostVote = typeof postVote.$inferSelect;
export type NewPostVote = typeof postVote.$inferInsert;
