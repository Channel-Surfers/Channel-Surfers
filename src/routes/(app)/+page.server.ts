import { getDb } from '$lib/server';
import { getChannels } from '$lib/server/services/channels';
import { getPosts } from '$lib/server/services/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    const db = await getDb();

    return {
        initial_posts: await getPosts(db, 0, {
            type: 'home',
            sort: 'date',
            filter: 'all',
            requesterId: event.locals.user?.id,
        }),
        channels: await getChannels(db),
    };
};
