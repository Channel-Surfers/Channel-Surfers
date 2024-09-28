import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './users.sql';
import { role } from './roles.sql';

export const userRole = pgTable(
    'user_role',
    {
        userId: uuid('user_id')
            .notNull()
            .references(() => user.id),
        roleId: uuid('role_id')
            .notNull()
            .references(() => role.id),
        updatedOn: timestamp('updated_on').notNull().defaultNow(),
    },
    (table) => ({ pk: { columns: [table.userId, table.roleId] } })
);

/**
 * Represents a *has* relationship between user and role
 */
export type UserRole = typeof userRole.$inferSelect;
/**
 * Represents a new *has* relationship between user and role yet to be persisted
 */
export type NewUserRole = typeof userRole.$inferInsert;
