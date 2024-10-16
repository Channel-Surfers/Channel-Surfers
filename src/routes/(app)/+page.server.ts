import { getDb } from '$lib/server';
import { getChannels } from '$lib/server/services/channels';
import { getCommentTree, getPosts } from '$lib/server/services/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const db = await getDb();

    await getCommentTree(db, '03e55964-a94d-4a30-b64d-453026048a0d');

    return {
        initial_posts: await getPosts(db, 0, {
            type: 'home',
            sort: 'date',
            filter: 'all',
        }),
        channels: await getChannels(db),
    };
};
