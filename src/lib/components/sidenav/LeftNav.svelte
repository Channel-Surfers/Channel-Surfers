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
    import { Button, buttonVariants } from '$lib/shadcn/components/ui/button';
    import { Label } from '$lib/shadcn/components/ui/label';
    import { Input } from '$lib/shadcn/components/ui/input';

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
                            <Dialog.Root>
                                <Dialog.Trigger class="w-full flex justify-center">
                                    <Button class="w-full m-2">Create Channel</Button>
                                </Dialog.Trigger>
                                <Dialog.Content class="sm:max-w-[425px]">
                                    <Dialog.Header>
                                        <Dialog.Title>Create Channel</Dialog.Title>
                                    </Dialog.Header>
                                    <div class="grid gap-4 py-4">
                                        <div class="grid grid-cols-4 items-center gap-4">
                                            <Label for="name" class="text-right">Name</Label>
                                                <Input id="name" value="Pedro Duarte" class="col-span-3" />
                                        </div>
                                        <div class="grid grid-cols-4 items-center gap-4">
                                            <Label for="username" class="text-right">Username</Label>
                                                <Input id="username" value="@peduarte" class="col-span-3" />
                                        </div>
                                    </div>
                                    <Dialog.Footer>
                                        <Button type="submit">Save changes</Button>
                                    </Dialog.Footer>
                                </Dialog.Content>
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
        <Route href="/settings" title="Settings" icon={Settings} />
    </div>
</div>
