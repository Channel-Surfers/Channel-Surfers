import { getDb } from '$lib/server';
import { getUsers } from '$lib/server/services/users';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const db = await getDb();

    return {
        users: await getUsers(db, 'all'),
    };
};
