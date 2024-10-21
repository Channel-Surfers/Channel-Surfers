import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { followUser, unfollowUser } from '$lib/server/services/interactions';
import { getDb } from '$lib/server';
import { getUserByUsername } from '$lib/server/services/users';

export const POST: RequestHandler = async ({ locals, params }) => {
    if (!locals.user) return error(401);
    const db = await getDb();

    // get user by username
    let user = await getUserByUsername(db, params.username);
    if (!user) {
        throw error(404, `User of username ${params.username} could not be found`);
    }
    let follow = await followUser(db, locals.user.id, user.id);
    return json(follow, { status: 201 });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
    if (!locals.user) return error(401);
    const db = await getDb();

    let user = await getUserByUsername(db, params.username);
    if (!user) {
        throw error(404, `User of username ${params.username} could not be found`);
    }
    await unfollowUser(db, locals.user.id, user.id);
    return new Response(null, { status: 204 });
};
