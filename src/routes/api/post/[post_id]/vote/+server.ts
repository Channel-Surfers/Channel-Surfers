import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server';
import { addPostVote, deletePostVote, getPost } from '$lib/server/services/content';
import { is } from '$lib/util';

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user) return error(401);
    // TODO: Check if user can see post (not in private channel or user has access to channel)

    const voteStr = await event.request.text();
    if (!is(['UP', 'DOWN', 'null'], voteStr)) {
        return error(400);
    }

    const vote = voteStr === 'null' ? null : voteStr;

    let ret_vote: 'UP' | 'DOWN' | null;
    const db = await getDb();
    if (vote) {
        const ret = await addPostVote(db, event.params.post_id, event.locals.user.id, vote);
        ret_vote = ret.vote;
    } else {
        await deletePostVote(db, event.params.post_id, event.locals.user.id);
        ret_vote = null;
    }

    const {
        post: { upvotes, downvotes },
    } = (await getPost(db, event.params.post_id))!;

    return json({
        upvotes,
        downvotes,
        vote: ret_vote,
    });
};
