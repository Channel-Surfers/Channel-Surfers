import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPosts } from '$lib/server/services/content';
import { getDb } from '$lib/server';

export const GET: RequestHandler = async (event) => {
    // TODO: Get user from cookies
    const db = await getDb();
    const posts = await getPosts(db, {
        type: 'home',
    });
    return json(posts);
};
