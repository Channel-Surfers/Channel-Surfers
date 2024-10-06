<script lang="ts">
    import type { Channel } from '$lib/server/db/channels.sql';
    import ScrollArea from '$lib/shadcn/components/ui/scroll-area/scroll-area.svelte';
    import Separator from '$lib/shadcn/components/ui/separator/separator.svelte';
    import { Home, Settings, Flame } from 'lucide-svelte';
    import Route from './Route.svelte';
    import * as Accordion from '$lib/shadcn/components/ui/accordion';
    import type { UserSubscription } from '$lib/server/services/channels';
    import type { Playlist } from '$lib/server/db/playlists.sql';

    // type signature here is temporary
    export let channels: (Channel & { publicInfo: { displayName: string } | null })[] | null = null;
    export let subscriptions: UserSubscription[] | null = null;
    export let playlists: Playlist[] | null = null;
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
                            {#if channels.length === 0}
                                <p class="pl-2">You have no channels</p>
                            {:else}
                                {#each channels as channel}
                                    {#if channel.publicInfo}
                                        <Route
                                            href={`/c/${channel.publicInfo.displayName}`}
                                            title={channel.publicInfo.displayName}
                                        />
                                    {:else}
                                        <a href={`/c/private/${channel.id}`}>{channel.name}</a>
                                    {/if}
                                {/each}
                            {/if}
                        {:else}
                            <p>Login to create a channel</p>
                        {/if}
                    </ScrollArea>
                </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="my_subscriptions">
                <Accordion.Trigger class="pl-2">Subscriptions</Accordion.Trigger>
                <Accordion.Content>
                    <ScrollArea class="grow">
                        {#if subscriptions}
                            {#if subscriptions.length === 0}
                                <p class="pl-2">You have no subscriptions</p>
                            {:else}
                                {#each subscriptions as sub}
                                    <Route
                                        href={`/c/${sub.channelDisplayName}`}
                                        title={sub.channelDisplayName}
                                    />
                                {/each}
                            {/if}
                        {:else}
                            <p>Login to subscribe to a channel</p>
                        {/if}
                    </ScrollArea>
                </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="my_playlists">
                <Accordion.Trigger class="pl-2">Playlists</Accordion.Trigger>
                <Accordion.Content>
                    <ScrollArea class="grow">
                        {#if playlists}
                            {#if playlists.length === 0}
                                <p class="pl-2">You have no playlists</p>
                            {:else}{/if}
                            {#each playlists as pl}
                                <Route href={`/p/${pl.id}`} title={pl.name ?? pl.id} />
                            {/each}
                        {:else}
                            <p>Login to view playlists</p>
                        {/if}
                    </ScrollArea>
                </Accordion.Content>
            </Accordion.Item>
        </Accordion.Root>
    </div>
    <div class="flex flex-col">
        <Separator class="my-2" />
        <Route href="/settings" title="Settings" icon={Settings} />
    </div>
</div>
