import { pgTable, uuid, varchar, text, boolean } from 'drizzle-orm/pg-core';
import { userTable } from './users.sql';

/**
 * @document public.playlist.md
 */
export const playlistTable = pgTable('playlist', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => userTable.id),
    name: varchar('name', { length: 32 }),
    description: text('description'),
    public: boolean('public').default(false),
});

/**
 * Represents a playlist of posts
 */
export type Playlist = typeof playlistTable.$inferSelect;
/**
 * Represents a new playlist yet to be persisted
 */
export type NewPlaylist = typeof playlistTable.$inferInsert;
