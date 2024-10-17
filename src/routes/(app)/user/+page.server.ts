import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { assert_auth } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
    assert_auth(event);

    return {
        username: event.locals.user.username,
    };
};
