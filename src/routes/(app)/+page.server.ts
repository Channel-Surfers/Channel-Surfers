import { getDb } from '$lib/server';
import { getChannels } from '$lib/server/services/channels';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const db = await getDb();
    return {
        channels: await getChannels(db),
    };
};
