import { getDb } from '$lib/server';
import {
    getPublicChannelByName,
    getChannelsByOwner,
    getUserSubscriptions,
    getChannelById,
    userIsSubscribed,
} from '$lib/server/services/channels';
import {
    getUserByUsername,
    getUserStats,
    userIsBlocking,
    userIsFollowing,
} from '$lib/server/services/users';
import { getPostsInProgress, getPostStatistics } from '$lib/server/services/content';
import type { User } from '$lib/server/db/users.sql';
import type { LayoutServerLoad } from './$types';
import { themes, type Theme } from '$lib/types';

export const load: LayoutServerLoad = async ({ route, locals, params, cookies }) => {
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
                        isBlocking:
                            locals.user && (await userIsBlocking(db, locals.user.id, user.id)),
                        isFollowing:
                            locals.user && (await userIsFollowing(db, user.id, locals.user.id)),
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

    let themeString = cookies.get('theme');
    // Technically invalid assert, since themeString can be anything, but it's okay since we're not assuming anything from that
    if (!themes.includes(themeString as Theme)) {
        themeString = 'blue';
    }
    const theme = themeString as Theme;

    return {
        island: await getIslandData(),
        user: locals.user,
        theme,
        mySubscriptions: locals.user ? await getUserSubscriptions(db, locals.user.id) : null,
        myChannels: locals.user ? await getChannelsByOwner(db, locals.user.id) : null,
        userStats: locals.user ? await getUserStats(db, locals.user.id) : null,
        uploads: locals.user ? await getPostsInProgress(db, locals.user.id) : [],
    };
};
