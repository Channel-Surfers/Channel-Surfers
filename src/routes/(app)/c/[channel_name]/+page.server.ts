import { getDb } from "$lib/server";
import { getPublicChannelByName } from "$lib/server/services/channels";
import { getPosts } from "$lib/server/services/content";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params: { channel_name }, locals}) => {
    const db = await getDb();
    const channel = await getPublicChannelByName(db, channel_name);
    
    if (!channel) {
        error(404)
    }

    const postQuery = getPosts(db, 0, {
        type: 'channel',
        channelId: channel.id,
        sort: 'date',
        filter: 'all',
        requesterId: locals.user ? locals.user.id : undefined
    });
    return {
        channel_name,
        posts: await postQuery
    };
}) satisfies PageServerLoad;

 