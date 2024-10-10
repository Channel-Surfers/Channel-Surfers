import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server';
import { createCommunityReport, createSiteReport } from '$lib/server/services/content';

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user) return error(401);
    const data = await event.request.json();
    const db = await getDb();
    await createCommunityReport(db, {
        description: data.details,
        postId: event.params.post_id,
    });
    if (data.reason.value == 'site') {
        await createSiteReport(db, {
            description: data.details,
            postId: event.params.post_id,
        });
    }
    return new Response(null, {
        status: 201,
    });
};
