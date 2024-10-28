import { getDb } from '$lib/server';
import { getChannelById } from '$lib/server/services/channels';
import { getPosts } from '$lib/server/services/content';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { canViewChannel } from '$lib/server/services/channels';
import { assertAuth } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
    assertAuth(event);

    const db = await getDb();
    const { channelId } = event.params;
    const data = await getChannelById(db, channelId);
    const channelName = data.name;

    if (!(await canViewChannel(db, event.locals.user.id, data.id))) {
        return error(401, `You do not have access to channel with id ${data.id}`);
    }

    const postQuery = getPosts(db, 0, {
        type: 'channel',
        channelId: data.id,
        sort: 'date',
        filter: 'all',
        requesterId: event.locals.user ? event.locals.user.id : undefined,
    });
    return {
        channelId,
        channelName,
        posts: await postQuery,
    };
};
