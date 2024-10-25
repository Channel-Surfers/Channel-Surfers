import { getDb } from '$lib/server';
import type { Channel } from '$lib/server/db/channels.sql';
import { Type, type Static } from '@sinclair/typebox';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AssertError, Value } from '@sinclair/typebox/value';
import { createPost } from '$lib/server/services/content';

export const load: PageServerLoad = async ({ url }) => {
    const _db = await getDb();

    const videoId = url.searchParams.get('videoId');

    return {
        channels: [] as Channel[],
        formState: videoId ? 'UPLOAD' : 'METADATA',
    };
};

const createValidator = Type.Object({
    title: Type.String({
        minLength: 1,
    }),
    description: Type.String(),
    channelId: Type.String(),
});

export const actions = {
    create: async ({ locals, request }) => {
        if (!locals.user) throw error(401);
        const db = await getDb();

        // validate form data
        let body: Static<typeof createValidator>;
        const formData = await request.formData();
        try {
            body = Value.Parse(createValidator, formData);
        } catch (e: unknown) {
            if (e instanceof AssertError) {
                console.log(e.message);
                const errors = [];
                for (const err of e.Errors()) {
                    errors.push(err.message);
                }
                return fail(400, { errors });
            } else throw error(500, 'unknown error occurred');
        }

        // create video on bunny

        // create video in our DB
        const _post = createPost(db, {
            title: body.title,
            description: body.description,
            channelId: body.channelId,
            videoId: '',
            createdBy: locals.user.id,
            status: 'UPLOADING',
        });
        console.log(body);
        return redirect(303, '/');
    },
};
