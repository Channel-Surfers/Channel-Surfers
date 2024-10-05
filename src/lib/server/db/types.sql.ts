import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * The type of vote
 */
export const voteEnum = pgEnum('vote', ['UP', 'DOWN']);

/**
 * User's role in the site
 */
export const siteRoleEnum = pgEnum('site_role', ['USER', 'MODERATOR', 'ADMIN', 'SUPER']);
export type SiteRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER';

/**
 * The status of a report
 */
export const reportStatusEnum = pgEnum('report_status', ['INVESTIGATING', 'RESOLVED', 'DELETED']);
