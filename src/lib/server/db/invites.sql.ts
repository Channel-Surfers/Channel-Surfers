import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { channelTable } from './channels.sql';
import { userTable } from './users.sql';
import { roleTable } from './roles.sql';

/**
 * @document public.invite.md
 */
export const inviteTable = pgTable(
    'invite',
    {
        channelId: uuid('channel_id')
            .notNull()
            .references(() => channelTable.id),
        userId: uuid('user_id')
            .notNull()
            .references(() => userTable.id),
        // TODO: When building migration, ensure these expire when the invite table is updated (trigger)
        createdOn: timestamp('created_on').notNull().defaultNow(),
        // TODO: If the corresponding role is deleted, what happens?
        roleId: uuid('role_id')
            .notNull()
            .references(() => roleTable.id),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.channelId, table.userId] }),
    })
);

/**
 * Represents an invitation to a user to join a channel
 */
export type Invite = typeof inviteTable.$inferSelect;
export type NewInvite = typeof inviteTable.$inferInsert;
