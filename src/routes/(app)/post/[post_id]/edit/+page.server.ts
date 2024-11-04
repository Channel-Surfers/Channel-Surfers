import { getDb } from "$lib/server";
import { deletePost, getPost, updatePost } from "$lib/server/services/content";
import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { assertAuth } from "$lib/server/auth";
import * as v from 'valibot';
import { canDeletePostInChannel } from "$lib/server/services/channels";
import { bunnyClient } from "$lib/server/bunny";

export const load: PageServerLoad = async (event) => {
    assertAuth(event);
    const db = await getDb();

    const { post_id } = event.params;

    const data = await getPost(db, post_id);
    if (!data) return error(404);

    if (data.user.id !== event.locals.user.id) return error(403);

    return {
        ...data,
    };
};

const updateSchema = v.object({
    title: v.pipe(v.string(), v.minLength(1, 'Post title must be at least 1 character long.'), v.maxLength(200, 'Post title must be fewer than 200 characters')),
    description: v.pipe(v.string(), v.maxLength(4000, 'Post description must be fewer than 4000 characters')),
});

export const actions: Actions = {
    edit: async (event) => {
        assertAuth(event);
        const postId = event.params.post_id;

        console.log('edit');
        const formData = await event.request.formData();

        const { success, issues, output } = v.safeParse(updateSchema, {
            title: formData.get('title'),
            description: formData.get('description'),
        });

        const errors: { [k in keyof v.InferInput<typeof updateSchema>]: string[]; } = {
            description: [],
            title: []
        };

        if (!success) {
            for (const issue of issues || []) {
                errors[issue.path![0].key as keyof typeof errors]!.push(issue.message);
            }
            return fail(400, errors);
        }

        const db = await getDb();
        const post = await getPost(db, postId);

        if (!post) return fail(404);

        if (event.locals.user.id !== post.user.id) return fail(403);

        const update = await updatePost(db, {
            id: postId,
            ...output
        });
        if (!update) return fail(500);
        return redirect(302, `/post/${postId}`);
    },
    delete: async (event) => {
        assertAuth(event);
        const postId = event.params.post_id;
        const db = await getDb();
        const post = await getPost(db, postId);

        if (!post) return fail(404);

        if (event.locals.user.id !== post.user.id && !canDeletePostInChannel(db, event.locals.user.id, post.channel.id)) return fail(403);

        const update = await deletePost(db, bunnyClient, postId);
        if (!update) return fail(500);
        return redirect(302, '/');
    },
};
