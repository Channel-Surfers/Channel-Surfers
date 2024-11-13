import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPosts } from '$lib/server/services/content';
import { getDb } from '$lib/server';
import { is } from '$lib/util';
import { getPublicChannelByName } from '$lib/server/services/channels';

export const GET: RequestHandler = async (event) => {
    const page = +(event.url.searchParams.get('page') ?? 0);
    const db = await getDb();

    const filter = event.url.searchParams.get('filter') || 'all';
    if (!is(['all', 'subscribed'], filter))
        return error(400, 'filter must be either `all` or `subscribed`');
    if (filter === 'subscribed' && !event.locals.user) return error(401);

    const sort = event.url.searchParams.get('sort') || 'votes';
    if (!is(['votes', 'date'], sort)) return error(400, 'sort must be either `vote` or `date`');

    const sortDirection = event.url.searchParams.get('sortDirection') || 'asc';
    if (!is(['asc', 'dsc'], sortDirection)) return error(400, `sort must be either 'asc' or 'dsc'`);

    const channel = await getPublicChannelByName(db, event.params.channel_name);
    if (channel === null) return error(404);

    const posts = await getPosts(db, page, {
        requesterId: event.locals.user?.id,
        type: 'channel',
        channelId: channel.id,
        sortDirection,
        sort,
        filter,
    });
    return json(posts);
};
