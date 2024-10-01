import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './users.sql';
import { roleTable } from './roles.sql';

/**
 * @document public.user_role.md
 */
export const userRoleTable = pgTable(
    'user_role',
    {
        userId: uuid('user_id')
            .notNull()
            .references(() => userTable.id),
        roleId: uuid('role_id')
            .notNull()
            .references(() => roleTable.id),
        updatedOn: timestamp('updated_on').notNull().defaultNow(),
    },
    (table) => ({ pk: { columns: [table.userId, table.roleId] } })
);

/**
 * Represents a *has* relationship between user and role
 */
export type UserRole = typeof userRoleTable.$inferSelect;
/**
 * Represents a new *has* relationship between user and role yet to be persisted
 */
export type NewUserRole = typeof userRoleTable.$inferInsert;
