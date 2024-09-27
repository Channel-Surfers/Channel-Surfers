import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { user } from "./users.sql";

export const userReport = pgTable('user_report', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => user.id),
    description: text('description').notNull(),
});

/**
 * Represents a report that a channel violates the site's rules
 */
export type UserReport = typeof userReport.$inferSelect;
/**
 * Represents a new report that a channel violates the site's rules yet to be persisted
 */
export type NewUserReport = typeof userReport.$inferInsert;
