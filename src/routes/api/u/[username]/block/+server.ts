import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { blockUser, unblockUser } from '$lib/server/services/interactions';
import { getDb } from '$lib/server';
import { getUserByUsername } from '$lib/server/services/users';

export const POST: RequestHandler = async ({ locals, params }) => {
    if (!locals.user) return error(401);
    const db = await getDb();

    const user = await getUserByUsername(db, params.username);
    if (!user) error(404);

    await blockUser(db, locals.user.id, user.id);
    return new Response(null, { status: 201 });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
    if (!locals.user) return error(401);
    const db = await getDb();

    const user = await getUserByUsername(db, params.username);
    if (!user) error(404);

    await unblockUser(db, locals.user.id, user.id);
    return new Response(null, { status: 204 });
};
