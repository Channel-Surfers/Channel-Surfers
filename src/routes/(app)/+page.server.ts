import { getDb, type DB } from '$lib/server';
import { postReportTable } from '$lib/server/db/reports.posts.sql.js';
import { getChannels } from '$lib/server/services/channels';
import { createReport, getPosts } from '$lib/server/services/content';
import type { PageServerLoad } from './$types';
import { DbError } from '$lib/server/services/utils/errors.js';
import type { Action, Actions } from '@sveltejs/kit';
import Post from '$lib/components/Post.svelte';
import Post from '$lib/components/Post.svelte';



export const load: PageServerLoad = async () => {
    const db = await getDb();
    return {
        initial_posts: await getPosts(db, 0, {
            type: 'home',
            sort: 'date',
            filter: 'all',
        }),
        channels: await getChannels(db),
    };

}

export const actions:Actions = {
    report: async(event) => {
        const db = await getDb();
        const data = await event.request.formData();
        const reason = data.get('reason')
        const details = data.get('details')
        console.log(data)
        console.log(reason)
        console.log(details)
    }
}




