import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './users.sql';
import { channelTable } from './channels.sql';
import { reportStatusEnum } from './types.sql';

/**
 * @document public.channel_user_reports.md
 */
export const channelUserReportTable = pgTable('channel_user_reports', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => userTable.id),
    channelId: uuid('channel_id')
        .notNull()
        .references(() => channelTable.id),
    reporterId: uuid('reporter_id').references(() => userTable.id),
    description: text('description').notNull(),
    resolution: text('resolution'),
    status: reportStatusEnum('status').notNull().default('INVESTIGATING'),
});

/**
 * Represents a report that a user violates the rules of a channel
 */
export type ChannelUserReport = typeof channelUserReportTable.$inferSelect;
/**
 * Represents a new report that a user violates the rules of a channel yet to be persisted
 */
export type NewChannelUserReport = typeof channelUserReportTable.$inferInsert;
