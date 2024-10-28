<script lang="ts">
    import * as Dialog from '$lib/shadcn/components/ui/dialog/index.js';
    import { Button, buttonVariants } from '$lib/shadcn/components/ui/button/index.js';
    import * as Card from '$lib/shadcn/components/ui/card/index.js';
    import { Checkbox } from '$lib/shadcn/components/ui/checkbox/index.js';
    import Input from '$lib/shadcn/components/ui/input/input.svelte';
    import Label from '$lib/shadcn/components/ui/label/label.svelte';
    import Textarea from '$lib/shadcn/components/ui/textarea/textarea.svelte';
    import { debounce } from '$lib/util';
    import type { MiniChannel } from '$lib/server/services/channels';
    import { CHANNEL_SEARCH_PAGE_SIZE } from '$lib';
    import ScrollArea from '$lib/shadcn/components/ui/scroll-area/scroll-area.svelte';

    export let data;
    export let form;

    let formState: 'METADATA' | 'UPLOAD' = 'METADATA';

    let channels: MiniChannel[] = [];
    let open = false;
    let searchChannelIsPrivate = false;
    let channelSearchPage = 0;
    let channelSearchQuery = '';
    let channelSearchError: string | null = null;
    let selectedChannel: MiniChannel | null = null;

    $: canLoadMore = channels.length !== 0 && channels.length % CHANNEL_SEARCH_PAGE_SIZE === 0;

    const resetState = () => {
        channels = [];
        open = false;
        searchChannelIsPrivate = false;
        channelSearchPage = 0;
        channelSearchQuery = '';
        channelSearchError = null;
    };

    const handleInputUpdate = async (event: KeyboardEvent) => {
        const input = event.target as HTMLInputElement;
        if (!input) throw new Error('input does not exist');
        const query = input.value;

        channelSearchPage = 0;

        if (!query || query.length === 0) {
            channels = [];
            return;
        }
        channels = await searchChannels(query);
    };

    $: (async (_) => {
        channelSearchPage = 0;
        channelSearchError = null;
        channels = channelSearchQuery === '' ? [] : await searchChannels(channelSearchQuery);
    })(searchChannelIsPrivate);

    const searchChannels = async (query: string) => {
        const params = new URLSearchParams({
            name: query,
            isPrivate: String(searchChannelIsPrivate),
            page: String(channelSearchPage),
        });

        const res = await fetch(`api/s/channels?${params}`);
        if (!res.ok) {
            console.error(await res.text());
            channelSearchError = 'failed to search';
            return [];
        } else {
            return await res.json();
        }
    };

    const loadMoreChannels = async () => {
        channelSearchPage++;
        const more = await searchChannels(channelSearchQuery);
        channels = channels.concat(more);
    };

    const selectChannel = (channel: MiniChannel) => {
        selectedChannel = channel;
        resetState();
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
            {#if selectedChannel}
                <p>{selectedChannel.name}</p>
            {/if}
        </div>
        <Input class="hidden" name={'channelId'} value={selectedChannel?.id} />
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
                        on:keyup={debounce(handleInputUpdate)}
                        bind:value={channelSearchQuery}
                    />

                    <Card.Root>
                        <Card.Content>
                            <div class="flex w-full flex-col space-y-2">
                                <ScrollArea class="h-36 w-full space-y-2">
                                    {#each channels as channel}
                                        <div class="my-1 flex w-full flex-row justify-between pr-4">
                                            <p>{channel.name}</p>
                                            <Button
                                                type="submit"
                                                on:click={() => selectChannel(channel)}
                                                >Select</Button
                                            >
                                        </div>
                                    {:else}
                                        <p>No channels found</p>
                                    {/each}
                                </ScrollArea>
                                {#if canLoadMore}
                                    <Button on:click={loadMoreChannels}>Load More</Button>
                                {/if}
                                {#if channelSearchError}
                                    <p class="text-red-500">{channelSearchError}</p>
                                {/if}
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
