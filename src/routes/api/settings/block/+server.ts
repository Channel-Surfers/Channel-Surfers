import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server';
import { unblockMultipleUsers } from '$lib/server/services/interactions';

export const DELETE: RequestHandler = async (event) => {
    if (!event.locals.user) return error(401);
    const db = await getDb();
    const data = await event.request.json();

    await unblockMultipleUsers(db, event.locals.user.id, data);
    return new Response(null, { status: 204 });
};
