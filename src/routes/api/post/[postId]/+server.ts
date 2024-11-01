import { getDb } from '$lib/server';
import { getPost, updatePost } from '$lib/server/services/content';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import type { Post } from '$lib/server/db/posts.sql';
import * as v from 'valibot';

const postUpdateValidator = v.object({
    id: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    altText: v.optional(v.string()),
    channelId: v.optional(v.string()),
    videoId: v.optional(v.string()),

    // Status of post
    status: v.optional(v.union([v.literal('OK'), v.literal('UPLOADING'), v.literal('HIDDEN')])),
});

export const PUT: RequestHandler = async ({ params: { postId }, request, locals }) => {
    if (!locals.user) throw error(401, 'Must be logged in to update post');
    const db = await getDb();
    const body = await request.json();

    const parsedBody = v.safeParse(postUpdateValidator, { id: postId, ...body });
    if (!parsedBody.success) {
        throw error(400, parsedBody.issues.map((i) => i.message).join(', '));
    }

    const currentPost = await getPost(db, postId);
    if (!currentPost) throw error(404, 'Post does not exist');
    if (currentPost.user.id !== locals.user.id)
        throw error(403, 'Unauthorized to modify this post');

    let updatedPost: Post;
    try {
        [updatedPost] = await updatePost(db, parsedBody.output);
    } catch (e) {
        console.error(e);
        throw error(500, 'unknown error occurred');
    }

    return json(updatedPost);
};
