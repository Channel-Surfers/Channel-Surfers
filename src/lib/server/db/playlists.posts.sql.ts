import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { playlist } from './playlists.sql';
import { post } from './posts.sql';

export const playlistPost = pgTable('playlist_post', {
    id: uuid('id').primaryKey().defaultRandom(),
    playlistId: uuid('playlist_id')
        .notNull()
        .references(() => playlist.id),
    postId: uuid('post_id')
        .notNull()
        .references(() => post.id),
});

export type PlaylistPost = typeof playlistPost.$inferSelect;
export type NewPlaylistPost = typeof playlistPost.$inferInsert;
