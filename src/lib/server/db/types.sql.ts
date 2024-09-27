import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * The type of vote
 */
export const voteEnum = pgEnum('vote', ['UP', 'DOWN']);

/**
 * User's role in the site
 */
export const siteRoleEnum = pgEnum('site_role', ['USER', 'MODERATOR', 'ADMIN', 'SUPER']);
