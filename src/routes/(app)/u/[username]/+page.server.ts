import { getDb } from '$lib/server';
import { getPosts } from '$lib/server/services/content';
import type { PageServerLoad } from './$types';

export const load = (async ({ params: { username }, locals }) => {
    const db = await getDb();
    const postQuery = getPosts(db, 0, {
        type: 'user',
        username,
        sort: 'date',
        filter: 'all',
        requesterId: locals.user ? locals.user.id : undefined,
    });
    return {
        username,
        posts: await postQuery,
    };
}) satisfies PageServerLoad;
