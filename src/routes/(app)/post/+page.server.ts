import { getDb } from '$lib/server';
import type { Channel } from '$lib/server/db/channels.sql';
import { Type, type Static } from '@sinclair/typebox';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AssertError, Value } from '@sinclair/typebox/value';
import { createPost } from '$lib/server/services/content';
import { bunnyClient } from '$lib/server/bunny';

export const load: PageServerLoad = async ({ url }) => {
    const _db = await getDb();

    const videoId = url.searchParams.get('videoId');

    return {
        videoId,
        channels: [] as Channel[],
        formState: videoId ? 'UPLOAD' : 'METADATA',
    };
};

const createValidator = Type.Object({
    title: Type.String({ minLength: 1 }),
    description: Type.String(),
    channelId: Type.String({ minLength: 36 }),
});

export const actions = {
    create: async ({ locals, request }) => {
        if (!locals.user) throw error(401, 'Must be logged in to create a post');
        const db = await getDb();

        // validate form data
        let body: Static<typeof createValidator>;
        const formData = await request.formData();
        try {
            body = Value.Parse(createValidator, {
                title: formData.get('title'),
                description: formData.get('description'),
                channelId: formData.get('channelId'),
            });
        } catch (e: unknown) {
            if (e instanceof AssertError) {
                const errors: Record<string, string> = {};
                for (const err of e.Errors()) {
                    errors[err.path.split('/')[1]] = `${err.message}, got ${err.value}`;
                }
                console.error(e.message, errors);
                return fail(400, errors);
            } else {
                console.error(e);
                throw error(500, 'unknown error occurred');
            }
        }

        // create video on bunny

        // create video in our DB
        const { video } = await createPost(db, bunnyClient, {
            title: body.title,
            description: body.description,
            channelId: body.channelId,
            videoId: '',
            createdBy: locals.user.id,
            status: 'UPLOADING',
        });
        return redirect(303, `/post?videoId=${video.videoId}`);
    },
};
