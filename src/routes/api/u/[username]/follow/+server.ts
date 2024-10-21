import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { followUser, unfollowUser } from '$lib/server/services/interactions';
import { getDb } from '$lib/server';
import { getUserByUsername } from '$lib/server/services/users';

export const POST: RequestHandler = async ({ locals, params }) => {
    if (!locals.user || !locals.session) throw error(403, 'Must be logged in to follow users');
    const db = await getDb();

    // get user by username
    let user;
    try {
        user = await getUserByUsername(db, params.username);
    } catch (e: unknown) {
        if (e instanceof Error) throw error(500, 'An unknown error occurred');
        else throw e;
    }
    if (!user) {
        throw error(404, `User of username ${params.username} could not be found`);
    }
    let follow;
    try {
        follow = await followUser(db, locals.user.id, user.id);
    } catch (e: unknown) {
        if (e instanceof Error) {
            throw error(500, 'An unknown error occurred');
        } else throw e;
    }
    return json(follow, { status: 201 });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
    if (!locals.user || !locals.session) throw error(403, 'Must be logged in to unfollow users');
    const db = await getDb();

    let user;
    try {
        user = await getUserByUsername(db, params.username);
    } catch (e: unknown) {
        if (e instanceof Error) throw error(500, 'An unknown error occurred');
        else throw e;
    }
    if (!user) {
        throw error(404, `User of username ${params.username} could not be found`);
    }
    try {
        await unfollowUser(db, locals.user.id, user.id);
    } catch (e: unknown) {
        if (e instanceof Error) {
            if (e.message == 'not following') {
                return new Response(null, { status: 204 });
            } else {
                throw error(500, 'An unknown error occurred');
            }
        } else throw e;
    }
    return new Response(null, { status: 204 });
};
