<script lang="ts">
    import LeftNav from '$lib/components/sidenav/LeftNav.svelte';
    import * as Card from '$lib/shadcn/components/ui/card';
    import '../../app.css';
    import { ModeWatcher } from 'mode-watcher';
    import type { LayoutServerData } from './$types';
    import HomeInfo from '$lib/components/islands/HomeInfo.svelte';
    import Button from '$lib/shadcn/components/ui/button/button.svelte';
    import ChannelInfo from '$lib/components/islands/ChannelInfo.svelte';
    import ProfileIcon from '$lib/components/user/ProfileIcon.svelte';
    import Score from '$lib/components/Score.svelte';

    export let data: LayoutServerData;

    const dummyChannel = {
        id: '',
        icon: null,
        bannerImage: null,
        name: 'awww',
        description: 'A place to appreciate cuteness',
        guidelines:
            "Don't post things that are not cute\nNo bigotry of any kind allowed\nNo promotion",
        createdBy: '',
        createdOn: new Date(),
        updatedOn: new Date(),
        subscriptionsCount: 2,
    };

    $: ({ myChannels } = data);
</script>

<!-- Enable dark-mode detection and switching -->
<ModeWatcher />
<!--<DisplayMode />-->

<div class="flex max-h-screen min-h-screen flex-row justify-between">
    <!-- Left navigation -->
    <div class="w-1/6 p-4">
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
    <div class="max-w-1/6 flex w-1/6 flex-col space-y-4 pr-4 pt-4">
        {#if data.island.type === 'home' && data.island.data}
            <HomeInfo stats={data.island.data} />
            <!-- As channel routes are implemented, update this block to show `ChannelInfo` where appropriate -->
        {/if}

        <ChannelInfo channel={dummyChannel} />

        {#if data.user && data.userStats}
            <Card.Root>
                <Card.Content>
                    <div class="flex flex-row items-center justify-between">
                        <ProfileIcon user={data.user} />
                        <h1>u/{data.user.username}</h1>
                    </div>
                    Score: <Score
                        upvotes={data.userStats.numberOfUpvotes}
                        downvotes={data.userStats.numberOfDownvotes}
                    />
                </Card.Content>
            </Card.Root>
        {:else}
            <Card.Root class="">
                <Card.Header>
                    <Card.Title>Sign In</Card.Title>
                    <Card.Description
                        >Sign up or sign in with one of the following platforms</Card.Description
                    >
                </Card.Header>
                <Card.Content class="flex flex-col gap-2">
                    <Button href="/signin/discord" variant="secondary" class="w-full"
                        >Discord</Button
                    >
                    <Button href="/signin/github" variant="secondary" class="w-full">GitHub</Button>
                </Card.Content>
            </Card.Root>
        {/if}
    </div>
</div>

<style lang="postcss">
    :global(html) {
        background-color: theme(colors.background);
    }
</style>
