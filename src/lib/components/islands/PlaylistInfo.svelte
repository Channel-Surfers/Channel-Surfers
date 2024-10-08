<script lang="ts">
    import * as Card from '$lib/shadcn/components/ui/card';
    import type { User } from '$lib/server/db/users.sql';
    import Skeleton from '$lib/shadcn/components/ui/skeleton/skeleton.svelte';
    import Button from '$lib/shadcn/components/ui/button/button.svelte';
    import type { Playlist } from '$lib/server/db/playlists.sql';

    // will need to update in the future when playlists can be added
    export let playlistInfo: (Playlist & { creator: User }) | null = null;
    export let isAdded: boolean = false;
</script>

<Card.Root>
    <Card.Header>
        <div class="flex flex-row items-center justify-between">
            <div class="flex flex-row items-center space-x-4">
                {#if playlistInfo}
                    <h1 class="text-xl font-bold">p/{playlistInfo.name}</h1>
                {:else}
                    <h1 class="text-xl font-bold">p/</h1>
                    <Skeleton class="h-4 w-[100px]" />
                {/if}
            </div>
            {#if playlistInfo}
                {#if isAdded}
                    <Button type="submit" variant="destructive">Remove</Button>
                {:else}
                    <Button type="submit">Save</Button>
                {/if}
            {:else}
                <Button disabled>Save</Button>
            {/if}
        </div>
        {#if playlistInfo}
            <p class="text-slate-500">Created by {playlistInfo.creator.username}</p>
        {/if}
    </Card.Header>
    <Card.Content>
        {#if playlistInfo}
            <p>{playlistInfo.description}</p>
        {:else}
            <Skeleton class="h-4 w-[250px]" />
        {/if}
    </Card.Content>
</Card.Root>
