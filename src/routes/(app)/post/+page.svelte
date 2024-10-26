<script lang="ts">
    import * as Dialog from '$lib/shadcn/components/ui/dialog/index.js';
    import { Button, buttonVariants } from '$lib/shadcn/components/ui/button/index.js';
    import * as Card from '$lib/shadcn/components/ui/card/index.js';
    import { Checkbox } from '$lib/shadcn/components/ui/checkbox/index.js';
    import Input from '$lib/shadcn/components/ui/input/input.svelte';
    import Label from '$lib/shadcn/components/ui/label/label.svelte';
    import Textarea from '$lib/shadcn/components/ui/textarea/textarea.svelte';
    import type { Channel } from '$lib/server/db/channels.sql.js';
    import { debounce } from '$lib/util';

    type miniChannel = { channelId: string; icon: string; name: string };

    export let data;
    export let form;

    let formState: 'METADATA' | 'UPLOAD' = 'METADATA';

    let channels: miniChannel[] = [];
    let open = false;
    let searchChannelIsPrivate = false;
    let channelSearchPage = 0;
    let channelSearchError: string | null = null;
    let channelId = '';

    const searchChannels = async (event: KeyboardEvent) => {
        const input = event.target as HTMLInputElement;
        if (!input) throw new Error('input does not exist');
        const query = input.value;

        if (!query || query.length === 0) {
            channels = [];
            return;
        }
        const params = new URLSearchParams({
            name: query,
            isPrivate: String(searchChannelIsPrivate),
            page: String(channelSearchPage),
        });

        const res = await fetch(`api/s/channels?${params}`);
        if (!res.ok) {
            console.error(await res.text());
        } else {
            channels = await res.json();
        }
    };

    const selectChannel = (channel: miniChannel) => {
        channelId = channel.channelId;
        channelSearchError = null;
        channelSearchPage = 0;
        channels = [];
        open = false;
    };
</script>

{#if formState === 'METADATA'}
    <form method="POST" action="?/create" class="m-auto w-3/5">
        <Label for={'title'} aria-required>Title</Label>

        <Input name="title" required />
        <Label for={'description'}>Description</Label>
        <Textarea name="description" />
        <div class="flex items-center space-x-2">
            <Label class="my-2" aria-required>Channel:</Label>
            {#if channelId !== ''}
                <p>{channelId}</p>
            {/if}
        </div>
        <Input class="hidden" name={'channelId'} bind:value={channelId} />
        <div>
            <Dialog.Root bind:open>
                <Dialog.Trigger
                    on:click={() => {
                        open = true;
                    }}
                    class={buttonVariants({ variant: 'outline' })}>Select Channel</Dialog.Trigger
                >
                <Dialog.Content class="sm:max-w-[625px]">
                    <Dialog.Header>
                        <Dialog.Title>Select Channel</Dialog.Title>
                        <Dialog.Description>Select a channel</Dialog.Description>
                    </Dialog.Header>
                    <div class="flex space-x-2">
                        <Checkbox
                            id="terms"
                            bind:checked={searchChannelIsPrivate}
                            aria-labelledby="public-channel-label"
                        />
                        <Label id="public-channel-label">Private Channel</Label>
                    </div>
                    <Label>Search</Label>
                    <Input
                        placeholder="Channel search by name"
                        on:keyup={debounce(searchChannels)}
                    />

                    <Card.Root>
                        <Card.Content>
                            <div class="flex w-full flex-col space-y-2">
                                {#each channels as channel}
                                    <div class="flex w-full flex-row justify-between">
                                        <p>{channel.name}</p>
                                        <Button
                                            type="submit"
                                            on:click={() => selectChannel(channel)}>Select</Button
                                        >
                                    </div>
                                {:else}
                                    <p>No channels found</p>
                                {/each}
                            </div>
                        </Card.Content>
                    </Card.Root>
                </Dialog.Content>
            </Dialog.Root>
        </div>
        <Button class="mt-2" type="submit">Create Post</Button>
    </form>
{:else if formState === 'UPLOAD'}
    <p>{data.videoId}</p>
{/if}
