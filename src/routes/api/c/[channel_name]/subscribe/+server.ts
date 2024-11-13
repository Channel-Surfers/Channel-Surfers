import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { subscribe, unsubscribe } from '$lib/server/services/interactions';
import { getDb } from '$lib/server';
import { getChannelById } from '$lib/server/services/channels';

export const POST: RequestHandler = async ({ locals, params }) => {
    if (!locals.user) return error(401);
    const db = await getDb();

    const channel = await getChannelById(db, params.channel_name);
    if (!channel) error(404);

    await subscribe(db, locals.user.id, channel.id);
    return new Response(null, { status: 201 });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
    if (!locals.user) return error(401);
    const db = await getDb();

    const channel = await getChannelById(db, params.channel_name);
    if (!channel) error(404);

    await unsubscribe(db, locals.user.id, channel.id);
    return new Response(null, { status: 204 });
};
