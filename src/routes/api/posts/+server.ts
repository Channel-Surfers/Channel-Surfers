import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPosts } from '$lib/server/services/content';
import { getDb } from '$lib/server';

export const GET: RequestHandler = async (event) => {
    const page = +(event.url.searchParams.get('page') ?? 0);
    const db = await getDb();

    const filter = event.url.searchParams.get('filter') || 'all';
    const validFilters = new Set(['all', 'subscribed']);
    if (!validFilters.has(filter)) {
        return error(400);
    }

    const sort = event.url.searchParams.get('sort') || 'views';
    const validSorts = new Set(['views', 'votes', 'date']);
    if (!validSorts.has(sort)) {
        return error(400);
    }

    const posts = await getPosts(db, page, {
        requesterId: event.locals.user?.id,
        type: 'home',
        sort: sort as 'views' | 'votes' | 'date',
        filter: filter as 'all' | 'subscribed',
    });
    return json(posts);
};
