import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { channelTable } from './channels.sql';
import { userTable } from './users.sql';

export const subscriptionTable = pgTable('subscription', {
    id: uuid('id').notNull().defaultRandom(),
    channelId: uuid('channel_id')
        .notNull()
        .references(() => channelTable.id),
    userId: uuid('user_id')
        .notNull()
        .references(() => userTable.id),
});

export type Subscription = typeof subscriptionTable.$inferSelect;
export type NewSubscription = typeof subscriptionTable.$inferInsert;
