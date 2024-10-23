import { getDb } from '$lib/server';
import { getPublicChannelByName, getChannelsByOwner, getUserSubscriptions } from '$lib/server/services/channels';
import { getPostStatistics } from '$lib/server/services/content';
import { getUserStats } from '$lib/server/services/users';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ route, locals, params }) => {
    console.log('RUNNIN', route.id);
    const db = await getDb();
    const getIslandData = async () => {
        switch (route.id) {
            case '/(app)': {
                // home page data
                return { type: 'home', data: await getPostStatistics(db) } as const;
            }
            case '/(app)/(auth)/signin': {
                return { type: 'hide' } as const;
            }
            case '/(app)/c/[channel_name]': {
                const channelData = await getPublicChannelByName(db, params.channel_name!);
                return {
                    type: 'channel',
                    data: {
                        channelData,
                        channel: channelData?.id
                    },
                } as const;
            }
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
        return { type: 'err' };
    };

    return {
        island: await getIslandData(),
        user: locals.user,
        mySubscriptions: locals.user ? await getUserSubscriptions(db, locals.user.id) : null,
        myChannels: locals.user ? await getChannelsByOwner(db, locals.user.id) : null,
        userStats: locals.user ? await getUserStats(db, locals.user.id) : null,
    };
};
