import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server';
import { deleteCommentVote, getComment, addCommentVote } from '$lib/server/services/content';

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user) return error(401);

    const db = await getDb();
    const body = await event.request.json();
    const voteStr: string | null = body.vote;

    // Ensure voteStr is either 'UP', 'DOWN', or null
    if (voteStr !== 'UP' && voteStr !== 'DOWN' && voteStr !== null) {
        console.log(`Invalid vote string: ${voteStr}`);
        return error(400);
    }

    // Type-cast voteStr to "UP" | "DOWN" | null
    const vote: 'UP' | 'DOWN' | null = voteStr;

    if (vote) {
        await addCommentVote(db, event.params.commentId, event.locals.user.id, vote);
    } else {
        await deleteCommentVote(db, event.params.commentId, event.locals.user.id);
    }

    const comment = await getComment(db, event.params.commentId);

    return json(comment);
};
