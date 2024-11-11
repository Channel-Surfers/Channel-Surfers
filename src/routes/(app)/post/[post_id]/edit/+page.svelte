<script lang="ts">
    import Confirm from '$lib/components/Confirm.svelte';
    import { Button } from '$lib/shadcn/components/ui/button';
    import { Input } from '$lib/shadcn/components/ui/input';
    import { Label } from '$lib/shadcn/components/ui/label';
    import { Textarea } from '$lib/shadcn/components/ui/textarea';
    import * as Dialog from '$lib/shadcn/components/ui/dialog';
    import { enhance } from '$app/forms';
    import type { SubmitFunction } from '@sveltejs/kit';

    export let data;
    export let form;

    let confirmDelete: () => Promise<boolean>;

    const onEdit: SubmitFunction = async ({ cancel }) => {
        if (data.post.title.length === 0) {
            if (!form) form = { title: [], description: [] };
            form.title.unshift('This field is required.');
            cancel();
        }
    };

    const onDelete: SubmitFunction = async ({ cancel }) => {
        if (!(await confirmDelete())) {
            cancel();
        }
    };
</script>

<Confirm bind:confirm={confirmDelete}>
    <Dialog.Title>Are you sure you want to delete this post?</Dialog.Title>
    <Dialog.Description>This action cannot be undone</Dialog.Description>
</Confirm>

<div class="mx-auto flex h-full w-1/2 flex-col justify-center">
    <form method="POST" action="?/edit" class="flex w-full flex-col space-y-4" use:enhance={onEdit}>
        <div>
            <Label for="title" aria-required>Title <span class="text-red-400">*</span></Label>
            <Input name="title" bind:value={data.post.title} />
            {#each form?.title ?? [] as m}
                <p class="pl-2 text-sm text-red-400">{m}</p>
            {/each}
        </div>

        <div>
            <Label for="description">Description</Label>
            <Textarea
                name="description"
                class="h-[300px] font-mono"
                bind:value={data.post.description}
            />
            {#each form?.description ?? [] as m}
                <p class="pl-2 text-sm text-red-400">{m}</p>
            {/each}
        </div>

        <div class="flex justify-between">
            <!-- Nested forms is needed here to do delete since we can't `action="?/delete"` with the `Button` component. -->
            <form method="POST" action="?/delete" use:enhance={onDelete}>
                <Button class="w-min" variant="destructive" type="submit">Delete</Button>
            </form>
            <Button class="w-min" type="submit">Update Post</Button>
        </div>
    </form>
</div>
