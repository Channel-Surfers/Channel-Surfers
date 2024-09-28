import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { channel } from './channels.sql';
import { user } from './users.sql';

export const subscription = pgTable('subscription', {
    id: uuid('id').notNull().defaultRandom(),
    channelId: uuid('channel_id')
        .notNull()
        .references(() => channel.id),
    userId: uuid('user_id')
        .notNull()
        .references(() => user.id),
});

export type Subscription = typeof subscription.$inferSelect;
export type NewSubscription = typeof subscription.$inferInsert;
