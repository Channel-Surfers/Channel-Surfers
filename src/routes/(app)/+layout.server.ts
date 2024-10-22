import { getDb } from '$lib/server';
import type { User } from '$lib/server/db/users.sql';
import { getChannelsByOwner, getUserSubscriptions } from '$lib/server/services/channels';
import { getPostStatistics } from '$lib/server/services/content';
import { getUserByUsername, getUserStats, userIsBlocking, userIsFollowing } from '$lib/server/services/users';
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
            case '/(app)/u/[username]': {
                const user = await getUserByUsername(db, params.username!);
                if (!user) {
                    return {
                        type: 'user',
                        exists: false,
                    } as const;
                }
                const userData = await getUserStats(db, user.id);
                return {
                    type: 'user',
                    exists: true,
                    data: {
                        userData: { ...user, ...userData },
                        user: locals.user as User,
                        isBlocking: locals.user && await userIsBlocking(db, locals.user.id, user.id),
                        isFollowing: locals.user && await userIsFollowing(db, user.id, locals.user.id),
                    },
                } as const;
            }
            //case '/(app)/c': {
            // Use the getChannelInfo function to get required info
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
