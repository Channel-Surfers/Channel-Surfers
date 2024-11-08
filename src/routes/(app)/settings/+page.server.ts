import type { PageServerLoad } from './$types';
import { assertAuth } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server';
import { getUserByUsername } from '$lib/server/services/users';

export const load: PageServerLoad = async (event) => {
    assertAuth(event); 
    const db = await getDb();
    const username = event.locals.user.username
    const user = await getUserByUsername(db, username)
    if (!user) {
        throw error(404, `User by username ${username} not found`);
    }
    return {
        user,
    };
};