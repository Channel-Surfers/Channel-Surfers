import { getDb } from '$lib/server';
import { loadMoreRepliesToComment } from '$lib/server/services/content';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params: { commentId }, url }) => {
    const db = await getDb();

    const page = Number(url.searchParams.get('offset'));

    const replies = await loadMoreRepliesToComment(db, commentId!, page);

    return json(replies);
};
