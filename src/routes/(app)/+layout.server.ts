import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }: ServerLoadEvent) => {
    return {
        user: locals.user,
    };
};
