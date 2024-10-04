import { getDb } from '$lib/server';
import { getPostStatistics } from '$lib/server/services/content';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ route }) => {
    const db = await getDb();
    const getIslandData = async () => {
        switch (route.id) {
            case '/(app)': {
                // home page data
                return { type: 'home', ...(await getPostStatistics(db)) } as const;
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
        islandData: await getIslandData(),
    };
};
