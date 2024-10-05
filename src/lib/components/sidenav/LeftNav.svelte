<script lang="ts">
    import type { Channel } from '$lib/server/db/channels.sql';
    import ScrollArea from '$lib/shadcn/components/ui/scroll-area/scroll-area.svelte';
    import Separator from '$lib/shadcn/components/ui/separator/separator.svelte';
    import { Home, Settings } from 'lucide-svelte';
    import Route from './Route.svelte';

    // type signature here is temporary
    export let channels: (Channel & { publicInfo: { displayName: string } | null })[] = [];
</script>

<div class="flex h-full flex-col justify-between">
    <div class="flex grow flex-col">
        <Route title={'Home'} icon={Home} href="/" />
        <Separator />
        <h1 class="font-bold text-slate-500">My Channels</h1>
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
    </div>
    <div class="flex flex-col">
        <Route href="/settings" title="Settings" icon={Settings} />
    </div>
</div>
