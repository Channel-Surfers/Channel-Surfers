import { getDb } from '$lib/server';
import { getPublicChannelByName } from '$lib/server/services/channels';
import { getPosts } from '$lib/server/services/content';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params: { channelName }, locals }) => {
    const db = await getDb();
    const channel = await getPublicChannelByName(db, channelName);

    if (!channel) {
        error(404, `Channel of name ${channelName} not found`);
    }

    const postQuery = getPosts(db, 0, {
        type: 'channel',
        channelId: channel.id,
        sort: 'date',
        filter: 'all',
        requesterId: locals.user ? locals.user.id : undefined,
    });
    return {
        channelName,
        posts: await postQuery,
    };
};
