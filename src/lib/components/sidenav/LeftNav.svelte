<script lang="ts">
    import type { Channel } from '$lib/server/db/channels.sql';
    import ScrollArea from '$lib/shadcn/components/ui/scroll-area/scroll-area.svelte';
    import Separator from '$lib/shadcn/components/ui/separator/separator.svelte';
    import { Home } from 'lucide-svelte';
    import Route from './Route.svelte';

    // type signature here is temporary
    export let channels: (Channel & { publicInfo: { displayName: string } | null })[] = [];
</script>

<div class="flex h-full flex-col justify-between">
    <div class="flex grow flex-col">
        <Route title={'Home'} icon={Home} href="/"/>
        <Separator />
        <h1 class="font-bold text-slate-500">My Channels</h1>
        <ScrollArea class="grow">
            {#each channels as channel}
                {#if channel.publicInfo}
                    <a href={`/c/${channel.publicInfo.displayName}`}
                        >{channel.publicInfo.displayName}</a
                    >
                {:else}
                    <a href={`/c/private/${channel.id}`}>{channel.name}</a>
                {/if}
            {/each}
        </ScrollArea>
    </div>
    <div class="flex flex-col">
        <a href="/settings">Settings</a>
    </div>
</div>
