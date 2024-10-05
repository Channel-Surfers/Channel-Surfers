<script lang="ts">
    import LeftNav from '$lib/components/sidenav/LeftNav.svelte';
    import * as Card from '$lib/shadcn/components/ui/card';
    import '../../app.css';
    import { ModeWatcher } from 'mode-watcher';
    import type { LayoutServerData } from './$types';
    import HomeInfo from '$lib/components/islands/HomeInfo.svelte';
    import Button from '$lib/shadcn/components/ui/button/button.svelte';
    import ChannelInfo from '$lib/components/islands/ChannelInfo.svelte';
    import type { Channel } from '$lib/server/db/channels.sql';
    import ProfileIcon from '$lib/components/user/ProfileIcon.svelte';

    export let data: LayoutServerData;

    const dummyChannel: Channel = {
        id: '',
        name: 'awww',
        description: 'A place to appreciate cuteness',
        guidelines:
            "Don't post things that are not cute\nNo bigotry of any kind allowed\nNo promotion",
        createdBy: '',
        createdOn: new Date(),
        updatedOn: new Date(),
    };

    $: ({ myChannels } = data);
</script>

<!-- Enable dark-mode detection and switching -->
<ModeWatcher />
<!--<DisplayMode />-->

<div class="flex max-h-screen min-h-screen flex-row justify-between">
    <!-- Left navigation -->
    <div class="w-1/4 p-4">
        <LeftNav
            channels={myChannels.map((channel) => ({
                ...channel,
                publicInfo: { displayName: channel.name },
            }))}
        />
    </div>

    <!-- Main content (infinite scroll) -->
    <slot />

    <!-- Right islands -->
    <div class="max-w-1/4 flex w-1/4 flex-col space-y-4 pr-4 pt-4">
        {#if data.island.type === 'home'}
            <HomeInfo stats={data.island.data} />
        {/if}

        <ChannelInfo channel={dummyChannel} />

        <Card.Root>
            <Card.Content>
                <h1 class="text-xl">Welcome!</h1>

                <p class="py-4">Sign in to start posting today!</p>
              
                <ProfileIcon user={data.user} />

                <div>
                    <Button>Sign in</Button>
                </div>
            </Card.Content>
        </Card.Root>
    </div>
</div>

<style lang="postcss">
    :global(html) {
        background-color: theme(colors.background);
    }
</style>
