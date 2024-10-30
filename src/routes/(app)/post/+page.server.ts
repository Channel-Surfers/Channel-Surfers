import { getDb } from '$lib/server';
import { Type, type Static } from '@sinclair/typebox';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, RequestEvent } from './$types';
import { AssertError, Value } from '@sinclair/typebox/value';
import { createPost, getPost } from '$lib/server/services/content';
import { bunnyClient } from '$lib/server/bunny';
import { createTUSUploadKey } from '$lib/server/bunny/utils';
import dayjs from 'dayjs';

export const load: PageServerLoad = async ({ url, locals }) => {
    if (!locals.user) throw error(401, 'Must be logged in to upload video');
    const db = await getDb();

    const postId = url.searchParams.get('postId');

    if (!postId) {
        return {
            formState: 'METADATA',
        } as const;
    }

    const queryResult = await getPost(db, postId);

    if (!queryResult) throw error(404, 'Post not found');

    const { post, user } = queryResult;

    if (user.id != locals.user?.id) throw error(403, 'Do not have access to this video');
    else if (post.status === 'OK') return redirect(303, `/post/${postId}`);

    const expirationTime = dayjs().add(12, 'hours').unix();

    const uploadKey = await createTUSUploadKey(expirationTime, post.videoId);

    return {
        post,
        videoId: post.videoId,
        formState: 'UPLOAD',
        uploadKey,
        expirationTime,
    } as const;
};

const createValidator = Type.Object({
    title: Type.String({ minLength: 1 }),
    description: Type.String(),
    channelId: Type.String({ minLength: 36 }),
});

export const actions = {
    create: async ({ locals, request }: RequestEvent) => {
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

        // create video (DB + Bunny)
        const { post } = await createPost(db, bunnyClient, {
            title: body.title,
            description: body.description,
            channelId: body.channelId,
            createdBy: locals.user.id,
            status: 'UPLOADING',
        });
        return redirect(303, `/post?postId=${post.id}`);
    },
};
