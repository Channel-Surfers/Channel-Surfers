import { pgEnum } from 'drizzle-orm/pg-core';

export const voteEnum = pgEnum('vote', ['UP', 'DOWN']);
export const siteRoleEnum = pgEnum('site_role', ['USER', '', 'ADMIN']);
