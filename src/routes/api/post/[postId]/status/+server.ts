import { getDb } from '$lib/server';
import { error, type RequestHandler } from '@sveltejs/kit';

export const PUT: RequestHandler = async ({ params: { postId } }) => {
    const db = await getDb();

    throw error(503, 'unimplemented');
};
