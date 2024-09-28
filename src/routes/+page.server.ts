import { db } from '$lib/server';
import { getChannels } from '$lib/server/services/channels';

export const load = async () => {
    return {
        channels: await getChannels(db),
    };
};
