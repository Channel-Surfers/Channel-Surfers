import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { postTable } from './posts.sql';
import { channelTagsTable } from './tags.channels.sql';

/**
 * @document public.post_tag.md
 */
export const postTagTable = pgTable('post_tag', {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
        .notNull()
        .references(() => postTable.id),
    tagId: uuid('tag_id')
        .notNull()
        .references(() => channelTagsTable.id),
});

/**
 * Represents a *tagged with* relation between posts and tags
 */
export type PostTag = typeof postTagTable.$inferSelect;
/**
 * Represents a new *tagged with* relation between posts and tags yet to be persisted
 */
export type NewPostTag = typeof postTagTable.$inferInsert;
