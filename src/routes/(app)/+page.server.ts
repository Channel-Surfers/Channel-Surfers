import { getDb, type DB } from '$lib/server';
import { postReportTable } from '$lib/server/db/reports.posts.sql.js';
import { getChannels } from '$lib/server/services/channels';
import { getPosts } from '$lib/server/services/content';
import type { PageServerLoad } from './$types';
import { DbError } from '$lib/server/services/utils/errors.js';


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

export const actions = {
    report: async(db: getDB) => {
        db.insert(postReportTable).values
    }
}




