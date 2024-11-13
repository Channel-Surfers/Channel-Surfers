import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server';
import { deleteCommentVote, getComment } from '$lib/server/services/content';

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user) return error(401);

    const db = await getDb();

    const voteStr = await event.request.text();

    if (!['UP', 'DOWN', null].includes(voteStr)) {
        return error(400);
    }

    const vote = voteStr === 'null' ? null : voteStr;

    if (!vote) {
        await deleteCommentVote(db, event.params.commentId, event.locals.user.id);
    }

    const {
        comment: { upvotes, downvotes },
    } = await getComment(db, event.params.commentId);
    return json({
        upvotes,
        downvotes,
        vote: voteStr,
    });
};
