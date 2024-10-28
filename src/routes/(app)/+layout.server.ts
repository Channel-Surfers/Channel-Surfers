import { getDb } from '$lib/server';
import {
    getPublicChannelByName,
    getChannelsByOwner,
    getUserSubscriptions,
    getChannelById,
    userIsSubscribed,
} from '$lib/server/services/channels';
import type { User } from '$lib/server/db/users.sql';
import { getPostStatistics } from '$lib/server/services/content';
import { getUserByUsername, getUserStats, userIsFollowing } from '$lib/server/services/users';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ route, locals, params }) => {
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
            case '/(app)/c/[channelName]': {
                const channel = await getPublicChannelByName(db, params.channelName!);
                if (!channel) {
                    return {
                        type: 'channel',
                        exists: false,
                    } as const;
                }
                return {
                    type: 'channel',
                    exists: true,
                    data: {
                        channelData: channel,
                        isSubscribed:
                            locals.user && (await userIsSubscribed(db, locals.user.id, channel.id)),
                    },
                };
            }
            case '/(app)/c/private/[channelId]': {
                const channelData = await getChannelById(db, params.channelId!);
                return {
                    type: 'channel',
                    data: {
                        channelData,
                        channel: channelData?.name,
                    },
                };
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
                        isFollowing: locals.user
                            ? await userIsFollowing(db, user.id, locals.user.id)
                            : false,
                    },
                } as const;
            }
            //case '/(app)/c/private/[channel_id]': {
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
