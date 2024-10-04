import { getDb } from '$lib/server';
import { getPostStatistics } from '$lib/server/services/content';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ route }) => {
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
    };
};
