import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getLucia } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) redirect(302, '/signin');

    return {
        username: event.locals.user.username,
    };
};

export const actions: Actions = {
    default: async (event) => {
        if (!event.locals.session) {
            return fail(401);
        }
        const lucia = await getLucia();
        await lucia.invalidateSession(event.locals.session.id);
        const sessionCookie = lucia.createBlankSessionCookie();
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '.',
            ...sessionCookie.attributes,
        });
        redirect(302, '/');
    },
};
