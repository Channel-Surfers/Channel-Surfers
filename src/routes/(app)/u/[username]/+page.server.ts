import type { PageServerLoad } from './$types';

export const load = (async ({ params: { username } }) => {
    return {
        username,
    };
}) satisfies PageServerLoad;
