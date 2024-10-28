<script lang="ts">
    import type { Channel } from '$lib/server/db/channels.sql';
    import ScrollArea from '$lib/shadcn/components/ui/scroll-area/scroll-area.svelte';
    import Separator from '$lib/shadcn/components/ui/separator/separator.svelte';
    import { Home, Settings, Flame } from 'lucide-svelte';
    import Route from './Route.svelte';
    import * as Accordion from '$lib/shadcn/components/ui/accordion';
    import type { UserSubscription } from '$lib/server/services/channels';
    import type { Playlist } from '$lib/server/db/playlists.sql';
    import { DropdownMenu } from 'bits-ui';
    import { resetMode, setMode } from 'mode-watcher';
    import Sun from 'lucide-svelte/icons/sun'
    import Moon from 'lucide-svelte/icons/moon'
    import MonitorCog from 'lucide-svelte/icons/monitor-cog'
    import Palete from 'lucide-svelte/icons/palette'
    import Button from '$lib/shadcn/components/ui/button/button.svelte';
    import { Group } from '$lib/shadcn/components/ui/dropdown-menu';

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
                            {#each channels as channel}
                                {#if channel.publicInfo}
                                    <Route
                                        href={`/c/${channel.publicInfo.displayName}`}
                                        title={channel.publicInfo.displayName}
                                    />
                                {:else}
                                    <a href={`/c/private/${channel.id}`}>{channel.name}</a>
                                {/if}
                            {:else}
                                <p class="pl-2">You have no channels</p>
                            {/each}
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
                                    href={`/c/${sub.channelDisplayName}`}
                                    title={sub.channelDisplayName}
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
        <div class="flex flex-col">
        <Separator class="my-2" />
        <Route  href="/settings" title="Settings" icon={Settings} /> <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Palete/>
                <span class="text-xl font-bold">Color Scheme</span>  
            </DropdownMenu.Trigger>
            <DropdownMenu.Content class="w-56">
                <DropdownMenu.Item on:click={() => setMode('light')}>
                    <Sun class="mr-2 h-4 w-4" />
                    Light
                </DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => setMode('dark')}>
                    <Moon class="mr-2 h-4 w-4" />
                    Dark
                </DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => resetMode()}>
                    <MonitorCog class="mr-2 h-4 w-4" />
                    System
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>
</div>
