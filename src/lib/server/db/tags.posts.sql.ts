import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { post } from './posts.sql';
import { channelTags } from './tags.channels.sql';

export const postTag = pgTable('post_tag', {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
        .notNull()
        .references(() => post.id),
    tagId: uuid('tag_id')
        .notNull()
        .references(() => channelTags.id),
});

/**
 * Represents a *tagged with* relation between posts and tags
 */
export type PostTag = typeof postTag.$inferSelect;
/**
 * Represents a new *tagged with* relation between posts and tags yet to be persisted
 */
export type NewPostTag = typeof postTag.$inferInsert;
