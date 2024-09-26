import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { channel } from './channels.sql';
import { user } from './users.sql';
import { role } from './roles.sql';

export const invite = pgTable(
    'invite',
    {
        channelId: uuid('channel_id')
            .notNull()
            .references(() => channel.id),
        userId: uuid('user_id')
            .notNull()
            .references(() => user.id),
        // TODO: When building migration, ensure these expire when the invite table is updated (trigger)
        createdOn: timestamp('created_on').notNull().defaultNow(),
        // TODO: If the corresponding role is deleted, what happens?
        roleId: uuid('role_id')
            .notNull()
            .references(() => role.id),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.channelId, table.userId] }),
    })
);

/**
 * Represents an invitation to a user to join a channel
 */
export type Invite = typeof invite.$inferSelect;
export type NewInvite = typeof invite.$inferInsert;
