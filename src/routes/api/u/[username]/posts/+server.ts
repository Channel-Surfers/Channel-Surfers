import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { getPosts } from '$lib/server/services/content';
import { getDb } from '$lib/server';
import { is } from '$lib/util';

export const GET: RequestHandler = async ({ locals, params: { username }, url }) => {
    const page = +(url.searchParams.get('page') ?? 0);
    const db = await getDb();

    const filter = url.searchParams.get('filter') || 'all';
    if (!is(['all', 'subscribed'], filter))
        return error(400, 'filter must be either `all` or `subscribed`');
    if (filter === 'subscribed' && !locals.user) return error(401);

    const sort = url.searchParams.get('sort') || 'votes';
    if (!is(['votes', 'date'], sort)) return error(400, 'sort must be either `vote` or `date`');

    const reverseSort = (url.searchParams.get('reverseSort') || 'false') === 'true';

    const posts = await getPosts(db, page, {
        requesterId: locals.user?.id,
        type: 'user',
        username,
        reverseSort,
        sort,
        filter,
    });
    return json(posts);
};
