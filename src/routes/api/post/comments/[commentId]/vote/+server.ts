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
        const ret = await addCommentVote(db, event.params.commentId, event.locals.user.id, vote);
        console.log(`Vote added:`, ret); // Log details of the added vote
    } else {
        await deleteCommentVote(db, event.params.commentId, event.locals.user.id);
        console.log(
            `Vote deleted for user ${event.locals.user.id} on comment ${event.params.commentId}`
        );
    }

    const comment = await getComment(db, event.params.commentId);
    console.log(`Updated comment data:`, comment); // Log the updated comment data

    return json(comment);
};
