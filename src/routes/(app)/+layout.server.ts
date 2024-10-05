import { getDb } from '$lib/server';
import { getChannels } from '$lib/server/services/channels';
import { getPostStatistics } from '$lib/server/services/content';
import { Effect } from 'effect';
import type { LayoutServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ route, locals }: ServerLoadEvent) => {
    console.log('RUNNIN', route.id);
    const db = await getDb();
    const getIslandData = async () => {
        switch (route.id) {
            case '/(app)': {
                // home page data
                return { type: 'home', data: await getPostStatistics(db) } as const;
            }
            //case '/(app)/c': {
            //    // return channel data
            //    break;
            //}
            //case '/(app)/c/private': {
            //    // return private channel data
            //    break;
            //}
            //case '/(app)/u': {
            //    // return user data
            //    break;
            //}
            //case '/(app)/p': {
            //    // return playlist data
            //    break;
            //}
        }
    };

    return {
        island: await getIslandData(),
        myChannels: await Effect.runPromise(getChannels(db)),
        user: locals.user,
    };
