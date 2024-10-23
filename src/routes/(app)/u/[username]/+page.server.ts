import { getDb } from '$lib/server';
import { getPosts } from '$lib/server/services/content';
import { getUserByUsername } from '$lib/server/services/users';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params: { username }, locals }) => {
    const db = await getDb();
    const user = await getUserByUsername(db, username);
    if (!user) {
        throw error(404, `User by username ${username} not found`);
    }
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
};
