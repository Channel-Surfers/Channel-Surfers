// src/routes/api/post/comments/[commentId]/user-vote/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server';
import { getUserVote } from '$lib/server/services/content';

export const GET: RequestHandler = async (event) => {
    const { user } = event.locals;
    if (!user) return error(401, 'Unauthorized');

    const db = await getDb();
    const { commentId } = event.params;

    try {
        const vote = await getUserVote(db, commentId, user.id);
        return json({ vote });
    } catch (err) {
        console.error('Error fetching user vote:', err);
        return error(500, 'Could not fetch vote');
    }
};
