<script lang="ts">
    import type { Channel } from '$lib/server/db/channels.sql';
    import type { Playlist } from '$lib/server/db/playlists.sql';
    import type { User } from '$lib/server/db/users.sql';
    import ChannelInfo from './ChannelInfo.svelte';
    import HomeInfo from './HomeInfo.svelte';
    import PlaylistInfo from './PlaylistInfo.svelte';
    import UserInfo from './UserInfo.svelte';

    export let src:
        | { type: 'home' }
        | { type: 'channel'; channel: Channel }
        | { type: 'user'; user: User }
        | { type: 'playlist'; playlist: Playlist };
</script>

{#if src.type === 'home'}
    <HomeInfo />
{:else if src.type === 'channel'}
    <ChannelInfo />
{:else if src.type === 'user'}
    <UserInfo />
{:else}
    <PlaylistInfo />
{/if}
