import { getDb } from '$lib/server';
import { getPost, getUserPostVote, getCommentTree } from '$lib/server/services/content';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { canViewChannel } from '$lib/server/services/channels';
import { assertAuth } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
    const db = await getDb();

    const { post_id: postId } = event.params;

    const data = await getPost(db, postId);
    if (!data) return error(404);

    if (data.privateChannel) {
        assertAuth(event);
        if (!canViewChannel(db, event.locals.user.id, data.channel.id)) {
            return error(401);
        }
    }

    const userVote = event.locals.user
        ? await getUserPostVote(db, event.locals.user.id, postId)
        : null;

    const commentTreeForThisPost = await getCommentTree(db, postId);

    return {
        userVote,
        signedIn: !!event.locals.user,
        commentTreeForThisPost,
        ...data,
    };
};
