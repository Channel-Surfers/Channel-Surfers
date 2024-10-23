import { getDb } from "$lib/server";
import { getChannelById, getPublicChannelByName } from "$lib/server/services/channels";
import { getPosts } from "$lib/server/services/content";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params: { channel_id }, locals}) => {
    const db = await getDb();
    const channel = await getChannelById(db, channel_id)
    
    const postQuery = getPosts(db, 0, {
        type: 'channel',
        channelId: channel.id,
        sort: 'date',
        filter: 'all',
        requesterId: locals.user ? locals.user.id : undefined
    });
    return {
        channel_id,
        posts: await postQuery
    };
}) satisfies PageServerLoad;