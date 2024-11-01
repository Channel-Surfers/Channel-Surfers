import { getDb } from '$lib/server';
import { getPost, getUserPostVote } from '$lib/server/services/content';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { canDeletePostInChannel, canViewChannel } from '$lib/server/services/channels';
import { assertAuth } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
    const db = await getDb();

    const { post_id } = event.params;

    const data = await getPost(db, post_id);
    if (!data) return error(404);

    if (data.private_channel) {
        assertAuth(event);
        if (!canViewChannel(db, event.locals.user.id, data.channel.id)) {
            return error(401);
        }
    }

    const userVote = event.locals.user
        ? await getUserPostVote(db, event.locals.user.id, post_id)
        : null;

    let canDelete = false;
    if (event.locals.user) {
        canDelete = event.locals.user.id === data.post.createdBy || await canDeletePostInChannel(db, event.locals.user.id, data.post.channelId);
    }

    return {
        userVote,
        canDelete,
        signedIn: event.locals.user,
        ...data,
    };
};
