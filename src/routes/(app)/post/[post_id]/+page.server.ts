import { getDb } from '$lib/server';
import { getPost, getUserPostVote } from '$lib/server/services/content';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { canViewChannel } from '$lib/server/services/channels';

export const load: PageServerLoad = async (event) => {
    const db = await getDb();

    const { post_id } = event.params;

    const data = await getPost(db, post_id);
    if (!data) return error(404);

    if (data.private_channel) {
        if (!event.locals.user) {
            redirect(302, '/signin');
        } else if (!canViewChannel(db, event.locals.user.id, data.channel.id)) {
            return error(401);
        }
    }

    const user_vote = event.locals.user
        ? await getUserPostVote(db, event.locals.user.id, post_id)
        : null;

    return {
        user_vote,
        ...data,
    };
};