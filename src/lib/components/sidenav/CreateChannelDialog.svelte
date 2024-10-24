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
    import type { CreateChannel } from '$lib/types';
    import { validateUrl } from '$lib/util';
    import type { Channel } from '$lib/server/db/channels.sql';

    const dispatch = createEventDispatcher();

    const formData: {
        [k in keyof CreateChannel]-?: { value: NonNullable<CreateChannel[k]>; error: string };
    } = {
        name: { value: '', error: '' },
        description: { value: '', error: '' },
        guidelines: { value: '', error: '' },
        bannerImage: { value: '', error: '' },
        icon: { value: '', error: '' },
        publishNow: { value: false, error: '' },
    };

    const validate = () => {
        let valid = true;
        if (!formData.name.value) {
            formData.name.error = 'Name must be provided';
            valid = false;
        }

        if (formData.description.value.length > 4000) {
            formData.description.error = 'Description must be fewer than 4000 characters';
            valid = false;
        }

        if (formData.guidelines.value.length > 4000) {
            formData.guidelines.error = 'Guidelines must be fewer than 4000 characters';
            valid = false;
        }

        if (formData.bannerImage.value && !validateUrl(formData.bannerImage.value)) {
            formData.bannerImage.error = 'Not a valid URL';
            valid = false;
        }

        if (formData.icon.value && !validateUrl(formData.icon.value)) {
            formData.icon.error = 'Must be a valid URL';
            valid = false;
        }

        return valid;
    };

    const submit = async () => {
        if (!validate()) return;

        const body = Object.fromEntries(Object.entries(formData).map(([k, v]) => [k, v.value]));
        console.log({ formData, body });

        const res = await fetch('/api/c', {
            body: JSON.stringify(body),
            method: 'POST',
        });

        if (res.status === 400 || res.status === 409) {
            const json = await res.json();
            for (const [k, v] of Object.entries(json) as [keyof CreateChannel, string][]) {
                formData[k].error = v;
            }
            return;
        } else if (!res.ok) {
            console.error(res);
            console.error(await res.text());
            toast.error('Unexpected error while creating channel.');
            return;
        }

        const channel: Channel = await res.json();

        if (formData.publishNow.value) {
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
                    bind:value={formData.name.value}
                />
                {#if formData.name.error}
                    <p class="pl-2 text-sm text-red-400">{formData.name.error}</p>
                {/if}
            </div>

            <div class="">
                <Label for="description">Channel Description</Label>
                <Textarea
                    id="description"
                    placeholder="Enter some text..."
                    class="my-1"
                    bind:value={formData.description.value}
                />
                {#if formData.description.error}
                    <p class="pl-2 text-sm text-red-400">{formData.description.error}</p>
                {/if}
            </div>

            <div class="">
                <Label for="guidelines">Channel Guidelines</Label>
                <Textarea
                    id="guidelines"
                    placeholder="Enter some text..."
                    class="my-1"
                    bind:value={formData.guidelines.value}
                />
                {#if formData.guidelines.error}
                    <p class="pl-2 text-sm text-red-400">{formData.guidelines.error}</p>
                {/if}
            </div>

            <div class="">
                <Label for="banner-image">Banner Image</Label>
                <Input
                    id="banner-image"
                    placeholder="https://example.com"
                    type="text"
                    class="my-1"
                    bind:value={formData.bannerImage.value}
                />
                {#if formData.bannerImage.error}
                    <p class="pl-2 text-sm text-red-400">{formData.bannerImage.error}</p>
                {/if}
            </div>

            <div class="">
                <Label for="icon">Channel Icon</Label>
                <Input
                    id="icon"
                    placeholder="https://example.com"
                    type="text"
                    class="my-1"
                    bind:value={formData.icon.value}
                />
                {#if formData.icon.error}
                    <p class="pl-2 text-sm text-red-400">{formData.icon.error}</p>
                {/if}
            </div>

            <div class="flex flex-row items-center gap-2">
                <Switch id="public" bind:checked={formData.publishNow.value} />
                <Label for="public">Publish Now</Label>
            </div>
        </div>
        <div class="flex w-full justify-end pt-4">
            <Button type="submit">Create Channel</Button>
        </div>
    </form>
</Dialog.Content>
