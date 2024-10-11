import { getDb } from '$lib/server';
import { getChannels } from '$lib/server/services/channels';
import { getCommentTree, getPosts } from '$lib/server/services/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const db = await getDb();

    //await getCommentTree(db, "048754ed-d41e-4dfe-9db1-09ad55f2eeee");
    await getCommentTree(db, '08171b82-f8bc-4d67-a007-a41440196c76');

    return {
        initial_posts: await getPosts(db, 0, {
            type: 'home',
            sort: 'date',
            filter: 'all',
        }),
        channels: await getChannels(db),
    };
};
