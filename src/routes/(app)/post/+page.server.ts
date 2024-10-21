import { getDb } from '$lib/server';
import type { Channel } from '$lib/server/db/channels.sql';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    const _db = await getDb();

    return {
        channels: [] as Channel[],
    };
}) satisfies PageServerLoad;
