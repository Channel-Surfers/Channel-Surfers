import { bigint, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { siteRoleEnum } from './types.sql';

/**
 * @document public.user.md
 */
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

    discordId: bigint('discord_id', { mode: 'bigint' }).unique(undefined, { nulls: 'distinct' }),
    githubId: integer('github_id').unique(undefined, { nulls: 'distinct' }),

    // Denormalise common aggregations
    followers: integer('followers').notNull().default(0),
    following: integer('following').notNull().default(0),
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
