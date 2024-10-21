import type { PageServerLoad } from './$types';
import { assertAuth } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
    assertAuth(event);

    return {
        username: event.locals.user.username,
    };
};
