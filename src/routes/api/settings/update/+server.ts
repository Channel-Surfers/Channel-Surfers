import { getDb } from '$lib/server';
import type { User } from '$lib/server/db/users.sql';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { updateUser } from '$lib/server/services/users';
import * as v from 'valibot';

const userUpdateValidator = v.object({
    id: v.string(),
    username: v.string(),
    profileImage: v.optional(v.string()),
});

export const PUT: RequestHandler = async (event) => {
    if (!event.locals.user) return error(401);
    const db = await getDb();
    const body = await event.request.json();

    const parsedBody = v.safeParse(userUpdateValidator, { id: event.locals.user.id, ...body });
    if (!parsedBody.success) {
        throw error(400, parsedBody.issues.map((i) => i.message).join(', '));
    }
    let updatedUser: User;
    try {
        [updatedUser] = await updateUser(db, parsedBody.output);
    } catch (e) {
        console.error(e);
        throw error(500, 'unknown error occurred');
    }
    return json(updatedUser);
};
