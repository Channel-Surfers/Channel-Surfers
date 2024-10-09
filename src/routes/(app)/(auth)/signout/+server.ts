import { signOut, updateLocals } from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
    if (await signOut(event.locals.session, event.cookies)) {
        await updateLocals(event);
        return new Response(redirect(302, '/'));
    }
    return new Response(error(401));
};
