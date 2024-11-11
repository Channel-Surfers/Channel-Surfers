<script lang="ts">
    import * as Dialog from '$lib/shadcn/components/ui/dialog';
    import { Label } from '$lib/shadcn/components/ui/label';
    import { Input } from '$lib/shadcn/components/ui/input';
    import { Textarea } from '$lib/shadcn/components/ui/textarea';
    import { Switch } from '$lib/shadcn/components/ui/switch';
    import { Button } from '$lib/shadcn/components/ui/button';
    import { goto } from '$app/navigation';
    import { createEventDispatcher } from 'svelte';
    import { toast } from 'svelte-sonner';
    import type { Channel } from '$lib/server/db/channels.sql';
    import * as v from 'valibot';
    import { createChannelSchema } from '$lib/validation';

    const dispatch = createEventDispatcher();

    const formData: v.InferInput<typeof createChannelSchema> = {
        name: '',
        description: '',
        guidelines: '',
        bannerImage: '',
        icon: '',
        publishNow: false,
    };

    let errors: {
        [k in keyof v.InferInput<typeof createChannelSchema>]: string[];
    } = {
        name: [],
        description: [],
        guidelines: [],
        bannerImage: [],
        icon: [],
        publishNow: [],
    };

    const validate = () => {
        const { success, issues } = v.safeParse(createChannelSchema, formData);

        console.log({ success, issues });
        if (issues) {
            errors = {
                name: [],
                description: [],
                guidelines: [],
                bannerImage: [],
                icon: [],
                publishNow: [],
            };
            for (const issue of issues) {
                errors[issue.path![0].key as keyof typeof errors].push(issue.message);
            }
            errors = { ...errors };
        }
        console.log(errors);

        return success;
    };

    const submit = async () => {
        if (!validate()) return;

        const body = Object.fromEntries(Object.entries(formData).map(([k, v]) => [k, v]));
        console.log({ formData, body });

        const res = await fetch('/api/c', {
            body: JSON.stringify(body),
            method: 'POST',
        });

        if (res.status === 400 || res.status === 409) {
            errors = await res.json();
            return;
        } else if (!res.ok) {
            console.error(res);
            console.error(await res.text());
            toast.error('Unexpected error while creating channel.');
            return;
        }

        const channel: Channel = await res.json();

        if (formData.publishNow) {
            goto(`/c/${channel.name}`);
        } else {
            goto(`/c/private/${channel.id}`);
        }

        dispatch('create');
    };
</script>

<Dialog.Content>
    <Dialog.Header>
        <Dialog.Title>Create Channel</Dialog.Title>
    </Dialog.Header>
    <!-- Note: a form action would be ideal here, but they break in dialogs -->
    <form on:submit|preventDefault={submit}>
        <div class="flex flex-col gap-4">
            <div class="">
                <Label for="name">Channel Name <span class="text-red-400">*</span></Label>
                <Input
                    id="name"
                    placeholder=""
                    type="text"
                    class="my-1"
                    bind:value={formData.name}
                />
                {#each errors.name as m}
                    <p class="pl-2 text-sm text-red-400">{m}</p>
                {/each}
            </div>

            <div class="">
                <Label for="description">Channel Description</Label>
                <Textarea
                    id="description"
                    placeholder="Enter some text..."
                    class="my-1"
                    bind:value={formData.description}
                />
                {#each errors.description as m}
                    <p class="pl-2 text-sm text-red-400">{m}</p>
                {/each}
            </div>

            <div class="">
                <Label for="guidelines">Channel Guidelines</Label>
                <Textarea
                    id="guidelines"
                    placeholder="Enter some text..."
                    class="my-1"
                    bind:value={formData.guidelines}
                />
                {#each errors.guidelines as m}
                    <p class="pl-2 text-sm text-red-400">{m}</p>
                {/each}
            </div>

            <div class="">
                <Label for="banner-image">Banner Image</Label>
                <Input
                    id="banner-image"
                    placeholder="https://example.com"
                    type="text"
                    class="my-1"
                    bind:value={formData.bannerImage}
                />
                {#each errors.bannerImage as m}
                    <p class="pl-2 text-sm text-red-400">{m}</p>
                {/each}
            </div>

            <div class="">
                <Label for="icon">Channel Icon</Label>
                <Input
                    id="icon"
                    placeholder="https://example.com"
                    type="text"
                    class="my-1"
                    bind:value={formData.icon}
                />
                {#each errors.icon as m}
                    <p class="pl-2 text-sm text-red-400">{m}</p>
                {/each}
            </div>

            <div class="flex flex-row items-center gap-2">
                <Switch id="public" bind:checked={formData.publishNow} />
                <Label for="public">Publish Now</Label>
            </div>
        </div>
        <div class="flex w-full justify-end pt-4">
            <Button type="submit">Create Channel</Button>
        </div>
    </form>
</Dialog.Content>
