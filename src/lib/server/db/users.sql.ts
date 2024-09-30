import { bigint, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { siteRoleEnum } from './types.sql';

export const userTable = pgTable('user', {
    id: uuid('id').primaryKey().defaultRandom(),
    /**
     * Username valid chars are of regex: [a-zA-Z\-\_]{1, 25}
     */
    username: varchar('username', { length: 25 }).notNull(),
    profileImage: text('profile_image'),
    role: siteRoleEnum('role').notNull().default('USER'),
    createdOn: timestamp('created_on').notNull().defaultNow(),
    updatedOn: timestamp('updated_on').notNull().defaultNow(),

    discordId: bigint('discord_id', { mode: 'bigint' }),
});

/**
 * Represents a user
 * @property `username` Username valid chars are of regex: [a-zA-Z\-\_]{1, 25}
 * @property `role` Role in site (defaults to USER)
 */
export type User = typeof userTable.$inferSelect;
/**
 * Represents a new user yet to be persisted
 */
export type NewUser = typeof userTable.$inferInsert;
