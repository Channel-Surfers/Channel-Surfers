<script lang="ts">
    import type { Channel } from '$lib/server/db/channels.sql';
    import ScrollArea from '$lib/shadcn/components/ui/scroll-area/scroll-area.svelte';
    import Separator from '$lib/shadcn/components/ui/separator/separator.svelte';
    import { Home, Settings, Flame } from 'lucide-svelte';
    import Route from './Route.svelte';
    import * as Accordion from '$lib/shadcn/components/ui/accordion';
    import * as Dialog from '$lib/shadcn/components/ui/dialog';
    import type { UserSubscription } from '$lib/server/services/channels';
    import type { Playlist } from '$lib/server/db/playlists.sql';
    import { Button } from '$lib/shadcn/components/ui/button';
    import CreateChannelDialog from './CreateChannelDialog.svelte';
    import { createEventDispatcher } from 'svelte';
    import DisplayMode from '$lib/components/sidenav/DisplayMode.svelte';

    // type signature here is temporary
    export let channels: (Channel & { private: boolean })[] | null = null;
    export let subscriptions: UserSubscription[] | null = null;
    export let playlists: Playlist[] | null = null;

    const dispatch = createEventDispatcher();

    const createChannel = () => {
        dispatch('updateChannels');
        channelDialogOpen = false;
    };

    let channelDialogOpen = false;
</script>

<div class="flex h-full flex-col justify-between">
    <div class="flex grow flex-col">
        <Route title={'Home'} icon={Home} href="/" />
        <Route title={'Popular'} icon={Flame} href="/h/popular" />
        <Separator class="mt-2" />
        <Accordion.Root class="h-full" multiple>
            <Accordion.Item value="my_channels">
                <Accordion.Trigger class="pl-2">Channels</Accordion.Trigger>
                <Accordion.Content>
                    <ScrollArea class="grow">
                        {#if channels}
                            {#each channels as channel}
                                {#if channel.private}
                                    <Route
                                        href="/c/private/{channel.id}"
                                        title="c/{channel.name}"
                                    />
                                {:else}
                                    <Route href="/c/{channel.name}" title="c/{channel.name}" />
                                {/if}
                            {:else}
                                <p class="pl-2">You have no channels</p>
                            {/each}
                            <Dialog.Root bind:open={channelDialogOpen}>
                                <Dialog.Trigger class="flex w-full justify-center">
                                    <Button class="m-2 w-full">Create Channel</Button>
                                </Dialog.Trigger>
                                {#key channelDialogOpen}
                                    <CreateChannelDialog on:create={createChannel} />
                                {/key}
                            </Dialog.Root>
                        {:else}
                            <p class="pl-2">Login to create a channel</p>
                        {/if}
                    </ScrollArea>
                </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="my_subscriptions">
                <Accordion.Trigger class="pl-2">Subscriptions</Accordion.Trigger>
                <Accordion.Content>
                    <ScrollArea class="grow">
                        {#if subscriptions}
                            {#each subscriptions as sub}
                                <Route
                                    href="/c/{sub.channelDisplayName}"
                                    title="c/{sub.channelDisplayName}"
                                />
                            {:else}
                                <p class="pl-2">You have no subscriptions</p>
                            {/each}
                        {:else}
                            <p class="pl-2">Login to subscribe to a channel</p>
                        {/if}
                    </ScrollArea>
                </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="my_playlists">
                <Accordion.Trigger class="pl-2">Playlists</Accordion.Trigger>
                <Accordion.Content>
                    <ScrollArea class="grow">
                        {#if playlists}
                            {#each playlists as pl}
                                <Route href={`/p/${pl.id}`} title={pl.name ?? pl.id} />
                            {:else}
                                <p class="pl-2">You have no playlists</p>
                            {/each}
                        {:else}
                            <p class="pl-2">Login to view playlists</p>
                        {/if}
                    </ScrollArea>
                </Accordion.Content>
            </Accordion.Item>
        </Accordion.Root>
    </div>
    <div class="flex flex-row space-x-4">
        <Button class="flex grow justify-start" href="/settings" variant="outline">
            <Settings />
            <span class="text-base">Settings</span>
        </Button>
        <DisplayMode />
    </div>
</div>
