import { boolean, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { channel } from './channels.sql';

export const role = pgTable('role', {
    id: uuid('id').primaryKey().defaultRandom(),
    channelId: uuid('channel_id')
        .notNull()
        .references(() => channel.id),
    title: varchar('title', { length: 20 }).notNull(),
    isOwner: boolean('isOwner').notNull().default(false),
    // permissions pertaining to role management
    canCreateRoles: boolean('can_edit_roles').notNull().default(false),
    canViewRoles: boolean('can_edit_roles').notNull().default(false),
    canEditRoles: boolean('can_edit_roles').notNull().default(false),
    canDeleteRoles: boolean('can_edit_roles').notNull().default(false),
    canAssignRoles: boolean('can_assign_roles').notNull().default(false),
    // permissions to channel management
    canSetMessageOfTheDay: boolean('can_set_message_of_the_day').notNull().default(false),
    canEditName: boolean('can_edit_name').notNull().default(false),
    canSetImage: boolean('can_set_image').notNull().default(false),
    canViewUserTable: boolean('can_view_user_table').notNull().default(false),
    // permissions to channel moderation
    canTimeoutUsers: boolean('can_timeout_users').notNull().default(false),
    canBanUsers: boolean('can_ban_users').notNull().default(false),
    canViewBannedUsers: boolean('can_view_banned_users').notNull().default(false),
    canUnbanUsers: boolean('can_unban_users').notNull().default(false),
    // permissions to do with events
    canRegisterEvents: boolean('can_register_events').notNull().default(false),
    canViewEvents: boolean('can_view_events').notNull().default(false),
    canEditEvents: boolean('can_edit_events').notNull().default(false),
    canUnregisterEvents: boolean('can_unregister_events').notNull().default(false),
    // TODO: permissions to manage monetization settings (crowdfunding, billing)
});

export type Role = typeof role.$inferSelect;
export type NewRole = typeof role.$inferInsert;
