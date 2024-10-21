import { getDb } from '$lib/server';
import { getPost, getUserPostVote } from '$lib/server/services/content';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { canViewChannel } from '$lib/server/services/channels';

export const load: PageServerLoad = async (event) => {
    const db = await getDb();

    const { post_id: postId } = event.params;

    const data = await getPost(db, postId);
    if (!data) return error(404);

    if (data.privateChannel) {
        if (!event.locals.user) {
            redirect(302, '/signin');
        } else if (!canViewChannel(db, event.locals.user.id, data.channel.id)) {
            return error(401);
        }
    }

    const userVote = event.locals.user
        ? await getUserPostVote(db, event.locals.user.id, postId)
        : null;

    return {
        userVote,
        signedIn: !!event.locals.user,
        ...data,
    };
};
