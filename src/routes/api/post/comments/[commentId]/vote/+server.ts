import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server';
import { deleteCommentVote, getComment } from '$lib/server/services/content';
import { is } from '$lib/util';

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user) return error(401);

    const db = await getDb();

    const voteStr = await event.request.text();
    if (!is(['UP', 'DOWN', 'null'], voteStr)) {
        return error(400);
    }

    const vote = voteStr === 'null' ? null : voteStr;

    if (!vote) {
        await deleteCommentVote(db, event.params.commentId, event.locals.user.id);
    }

    const comment = await getComment(db, event.params.commentId);
    console.log('VOTE CAST');
    return json(comment);
};
