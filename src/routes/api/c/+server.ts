import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPosts } from '$lib/server/services/content';
import { getDb } from '$lib/server';
import { is } from '$lib/util';
import { getPublicChannelByName } from '$lib/server/services/channels';

export const POST: RequestHandler = async ({ request }) => {
    return json({});
};
