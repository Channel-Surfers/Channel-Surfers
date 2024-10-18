import { error, json } from '@sveltejs/kit';
import { Type, type Static } from '@sinclair/typebox';
import type { RequestHandler } from './$types';
import { Value } from '@sinclair/typebox/value';
import { followUser } from '$lib/server/services/interactions';
import { getDb } from '$lib/server';
import { getUserByUsername } from '$lib/server/services/users';

export const POST: RequestHandler = async ({ request, locals, params }) => {
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
    if (!followUser) {
        throw error(404, `User of username ${params.username} could not be found`);
    }
    let follow;
    try {
        follow = await followUser(db, locals.user.id, user.id);
        console.log(follow);
    } catch (e: unknown) {
        if (e instanceof Error) {
            throw error(500, 'An unknown error occurred');
        } else throw e;
    }
    return json(follow, { status: 201 });
};
