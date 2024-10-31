<script lang="ts">
    import '../../app.css';
    import { Toaster } from '$lib/shadcn/components/ui/sonner';
    import { ModeWatcher } from 'mode-watcher';
    import LeftNav from '$lib/components/sidenav/LeftNav.svelte';
    import * as Card from '$lib/shadcn/components/ui/card';
    import type { LayoutServerData } from './$types';
    import HomeInfo from '$lib/components/islands/HomeInfo.svelte';
    import Button from '$lib/shadcn/components/ui/button/button.svelte';
    import ChannelInfo from '$lib/components/islands/ChannelInfo.svelte';
    import ProfileIcon from '$lib/components/user/ProfileIcon.svelte';
    import Score from '$lib/components/Score.svelte';
    import UserInfo from '$lib/components/islands/UserInfo.svelte';
    import type { User } from '$lib/server/db/users.sql';
    import { page } from '$app/stores';
    import type { Channel } from '$lib/server/db/channels.sql';

    export let data: LayoutServerData;

    const updateChannels = async () => {
        const res = await fetch('/api/channels');
        data.myChannels = await res.json();
        console.log(data.myChannels);
    };

    $: ({ myChannels, mySubscriptions } = data);
    $: userAsUser = data.user ? (data.user as User) : null;
    $: channelAsChannel = data.island.data?.channelData
        ? (data.island.data.channelData as Channel)
        : null;
</script>

<!-- Enable dark-mode detection and switching -->
<ModeWatcher />
<Toaster richColors />

<div class="flex max-h-screen min-h-screen flex-row justify-between">
    <!-- Left navigation -->
    <div class="w-1/6 min-w-96 p-4">
        {#if data.user && myChannels}
            <LeftNav
                channels={myChannels.map((channel) => ({
                    ...channel,
                    publicInfo: { displayName: channel.name },
                }))}
                subscriptions={mySubscriptions}
                on:updateChannels={updateChannels}
            />
        {:else}
            <LeftNav />
        {/if}
    </div>

    <!-- Main content (infinite scroll) -->
    <div class="grow">
        <slot />
    </div>

    <!-- Right islands -->
    <div class="flex w-1/6 min-w-96 flex-col space-y-4 pr-4 pt-4">
        {#if data.island.type === 'home' && data.island.data}
            <HomeInfo stats={data.island.data} user={userAsUser} />
            <!-- As channel routes are implemented, update this block to show `ChannelInfo` where appropriate -->
        {:else if data.island.type === 'channel' && data.island.data}
            <ChannelInfo channel={channelAsChannel} isSubscribed={data.island.data.isSubscribed} />
        {:else if data.island.type === 'user' && data.island.exists && data.island.data}
            <UserInfo
                isBlocking={data.island.data.isBlocking}
                isFollowing={data.island.data.isFollowing}
                userInfo={data.island.data.userData}
                user={userAsUser}
            />
        {/if}

        {#if data.user && data.userStats}
            <Card.Root>
                <Card.Header>
                    <div class="flex flex-row items-center justify-between">
                        <ProfileIcon user={data.user} />
                        <h1>u/{data.user.username}</h1>
                    </div>
                </Card.Header>
                <Card.Content>
                    <p>
                        Score: <Score
                            upvotes={data.userStats.numberOfUpvotes}
                            downvotes={data.userStats.numberOfDownvotes}
                            side={'right'}
                        />
                    </p>
                    {#if data.uploads.length !== 0}
                        <p class="m-2 text-muted-foreground">
                            These posts have been created, but you have yet to upload videos for
                            them.
                        </p>
                        <div class="flex w-full flex-col space-y-2">
                            {#each data.uploads as upload}
                                <div class="mx-2 flex w-full flex-row rounded-sm border">
                                    <Button
                                        class="w-full"
                                        href={`/post?postId=${upload.id}`}
                                        variant="link">{upload.title}</Button
                                    >
                                </div>
                            {/each}
                        </div>
                    {/if}
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
                    <Button
                        href="/signin/discord?redirect={encodeURI($page.url.pathname)}"
                        variant="secondary"
                        class="w-full"
                    >
                        Discord
                    </Button>
                    <Button
                        href="/signin/github?redirect={encodeURI($page.url.pathname)}"
                        variant="secondary"
                        class="w-full"
                    >
                        GitHub
                    </Button>
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
