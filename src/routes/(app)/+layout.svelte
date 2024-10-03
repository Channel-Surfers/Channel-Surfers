<script lang="ts">
    import UserManagementIsland from '$lib/components/islands/UserManagementIsland.svelte';
    import LeftNav from '$lib/components/LeftNav.svelte';
    //import DisplayMode from '$lib/shadcn/components/utils/DisplayMode.svelte';
    import '../../app.css';
    import { ModeWatcher } from 'mode-watcher';
    import HomeInfo from '$lib/components/islands/HomeInfo.svelte';
    import ChannelInfo from '$lib/components/islands/ChannelInfo.svelte';
    import UserInfo from '$lib/components/islands/UserInfo.svelte';
    import PlaylistInfo from '$lib/components/islands/PlaylistInfo.svelte';
    import type { LayoutServerData } from './$types';

    export let data: LayoutServerData;
</script>

<!-- Enable dark-mode detection and switching -->
<ModeWatcher />
<!--<DisplayMode />-->

<div class="flex flex-row justify-between">
    <!-- Left navigation -->
    <div class="w-1/4"><LeftNav /></div>

    <!-- Main content (infinite scroll) -->
    <slot />

    <!-- Right islands -->
    <div class="flex w-1/4 flex-col">
        {data.islandData.type}
    </div>
</div>

<style lang="postcss">
    :global(html) {
        background-color: theme(colors.background);
    }
</style>
