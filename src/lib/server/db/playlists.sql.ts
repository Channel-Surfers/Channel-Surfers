import { pgTable, uuid, varchar, text, boolean } from 'drizzle-orm/pg-core';
import { user } from './users.sql';

export const playlist = pgTable('playlist', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => user.id),
    name: varchar('name', { length: 32 }),
    description: text('description'),
    public: boolean('public').default(false),
});

/**
 * Represents a playlist of posts
 */
export type Playlist = typeof playlist.$inferSelect;
/**
 * Represents a new playlist yet to be persisted
 */
export type NewPlaylist = typeof playlist.$inferInsert;
