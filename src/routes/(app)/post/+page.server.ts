import { getDb } from '$lib/server';
import type { Channel } from '$lib/server/db/channels.sql';
import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
    const _db = await getDb();

    const videoId = url.searchParams.get('videoId');

    return {
        channels: [] as Channel[],
        formState: videoId ? 'UPLOAD' : 'METADATA',
    };
}) satisfies PageServerLoad;

export const actions = {
  create: async ({locals}) {
      
  }
}
