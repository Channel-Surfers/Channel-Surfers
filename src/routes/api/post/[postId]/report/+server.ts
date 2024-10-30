import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server';
import { createChannelReport, createPostReport } from '$lib/server/services/content';

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user) return error(401);
    const data = await event.request.json();
    const db = await getDb();
    await createChannelReport(db, {
        description: data.details,
        postId: event.params.postId,
    });
    if (data.reason.value === 'site') {
        await createPostReport(db, {
            description: data.details,
            postId: event.params.postId,
        });
    }
    return new Response(null, {
        status: 201,
    });
};
