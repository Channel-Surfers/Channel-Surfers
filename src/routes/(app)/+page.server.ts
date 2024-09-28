import { db } from '$lib/server';
import { getChannels } from '$lib/server/services/channels';
import { Effect } from 'effect';

export const load = async () => {
    return {
        channels: await Effect.runPromise(getChannels(db)),
    };
};
