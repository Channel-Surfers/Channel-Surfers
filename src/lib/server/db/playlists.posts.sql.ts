import { pgTable, smallint, uuid } from 'drizzle-orm/pg-core';
import { playlistTable } from './playlists.sql';
import { postTable } from './posts.sql';

export const playlistPostTable = pgTable('playlist_post', {
    id: uuid('id').primaryKey().defaultRandom(),
    playlistId: uuid('playlist_id')
        .notNull()
        .references(() => playlistTable.id),
    postId: uuid('post_id')
        .notNull()
        .references(() => postTable.id),
    sortIndex: smallint('sort_index').notNull(),
});

export type PlaylistPost = typeof playlistPostTable.$inferSelect;
export type NewPlaylistPost = typeof playlistPostTable.$inferInsert;
