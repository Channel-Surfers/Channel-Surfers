<script lang="ts">
    import type { Channel } from '$lib/server/db/channels.sql';
    import ScrollArea from '$lib/shadcn/components/ui/scroll-area/scroll-area.svelte';
    import Separator from '$lib/shadcn/components/ui/separator/separator.svelte';
    import { Home, Settings, Flame } from 'lucide-svelte';
    import Route from './Route.svelte';
    import * as Accordion from '$lib/shadcn/components/ui/accordion';
    import type { getUserSubscriptions } from '$lib/server/services/content';

    // type signature here is temporary
    export let channels: (Channel & { publicInfo: { displayName: string } | null })[] = [];
    export let subscriptions: Awaited<ReturnType<typeof getUserSubscriptions>> = [];
</script>

<div class="flex h-full flex-col justify-between">
    <div class="flex grow flex-col">
        <Route title={'Home'} icon={Home} href="/" />
        <Route title={'Popular'} icon={Flame} href="/h/popular" />
        <Separator class="my-2" />
        <Accordion.Root class="h-full" multiple value={['my_channels', 'my_subscriptions']}>
            <Accordion.Item value="my_channels">
                <Accordion.Trigger>Channels</Accordion.Trigger>
                <Accordion.Content>
                    <ScrollArea class="grow">
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
                    </ScrollArea>
                </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="my_subscriptions">
                <Accordion.Trigger>Subscriptions</Accordion.Trigger>
                <Accordion.Content>
                    <ScrollArea class="grow">
                        {#each subscriptions as sub}
                            <Route
                                href={`/c/${sub.channelDisplayName}`}
                                title={sub.channelDisplayName}
                            />
                        {/each}
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
