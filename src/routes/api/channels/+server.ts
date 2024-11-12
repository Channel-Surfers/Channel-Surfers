import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getChannelsByOwner } from '$lib/server/services/channels';
import { getDb } from '$lib/server';

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) return error(401);
    const db = await getDb();
    return json(await getChannelsByOwner(db, locals.user.id));
};
