import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { signOut } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) redirect(302, '/signin');

    return {
        username: event.locals.user.username,
    };
};

export const actions: Actions = {
    default: async (event) => {
        if (await signOut(event.locals.session, event.cookies)) {
            redirect(302, '/');
        }
        return fail(401);
    },
};