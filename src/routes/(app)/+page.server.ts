import { getDb } from '$lib/server';
import { getChannels } from '$lib/server/services/channels';
import { Effect } from 'effect';

export const load = async () => {
    const db = await getDb();
    return {
        channels: await Effect.runPromise(getChannels(db)),
    };
};
