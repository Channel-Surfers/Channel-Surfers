import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server';
import { addPostVote, deletePostVote, getPost } from '$lib/server/services/content';
import { is } from '$lib/util';
import { canViewChannel } from '$lib/server/services/channels';

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user) return error(401);

    const db = await getDb();

    const post = await getPost(db, event.params.postId);
    if (!post) return error(404);

    if (!(await canViewChannel(db, event.locals.user.id, post.channel.id))) return error(401);

    const voteStr = await event.request.text();
    if (!is(['UP', 'DOWN', 'null'], voteStr)) {
        return error(400);
    }

    const vote = voteStr === 'null' ? null : voteStr;

    let ret_vote: 'UP' | 'DOWN' | null;
    if (vote) {
        const ret = await addPostVote(db, event.params.postId, event.locals.user.id, vote);
        ret_vote = ret.vote;
    } else {
        await deletePostVote(db, event.params.postId, event.locals.user.id);
        ret_vote = null;
    }

    const {
        post: { upvotes, downvotes },
    } = (await getPost(db, event.params.postId))!;

    return json({
        upvotes,
        downvotes,
        vote: ret_vote,
    });
};
