import { getDb } from '$lib/server';
import { getChannelById } from '$lib/server/services/channels';
import { getPosts } from '$lib/server/services/content';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { canViewChannel } from '$lib/server/services/channels';
import { assertAuth } from '$lib/server/auth';

export const load: PageServerLoad = (async (event) => {
    const db = await getDb();
    const { channel_id } = event.params;
    const data = await getChannelById(db, channel_id);
    const channel_name = data.name;

    assertAuth(event);
    if (!(await canViewChannel(db, event.locals.user.id, data.id))) {
        return error(401);
    }

    const postQuery = getPosts(db, 0, {
        type: 'channel',
        channelId: data.id,
        sort: 'date',
        filter: 'all',
        requesterId: event.locals.user ? event.locals.user.id : undefined,
    });
    return {
        channel_id,
        channel_name,
        posts: await postQuery,
    };
}) satisfies PageServerLoad;
