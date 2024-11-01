import { getDb } from '$lib/server';
import { getChannels } from '$lib/server/services/channels';
import { getPosts } from '$lib/server/services/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const db = await getDb();
    return {
        initialPosts: await getPosts(db, 0, {
            type: 'home',
            sort: 'date',
            filter: 'all',
            requesterId: locals.user?.id,
        }),
        channels: await getChannels(db),
    };
};
