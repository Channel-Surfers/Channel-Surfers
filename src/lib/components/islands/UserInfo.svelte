<script lang="ts">
    import * as Card from '$lib/shadcn/components/ui/card';
    import * as Avatar from '$lib/shadcn/components/ui/avatar/index';
    import * as Tooltip from '$lib/shadcn/components/ui/tooltip/index.js';
    import type { User } from '$lib/server/db/users.sql';
    import type { UserStats } from '$lib/server/services/users';
    import Skeleton from '$lib/shadcn/components/ui/skeleton/skeleton.svelte';
    import Button from '$lib/shadcn/components/ui/button/button.svelte';
    import { toast } from 'svelte-sonner';

    export let userInfo: (User & UserStats) | null = null;
    export let user: User | null = null;
    export let isFollowing: boolean = false;
    let followLoading = false;

    const updateFollow = (action: 'follow' | 'unfollow') => async () => {
        if (!userInfo) {
            const message = `Attempted to ${action} an unknown user`;
            console.error(message);
            toast.error(message);
            return;
        }
        followLoading = true;
        switch (action) {
            case 'follow': {
                if (isFollowing) {
                    const message = `Attempted to follow a user you're already following`;
                    console.error(message);
                    toast.error(message);
                }
                // eagerly assume action success
                isFollowing = true;

                fetch(`/api/u/${userInfo.username}/follow`, {
                    method: 'POST',
                })
                    .then(async (res) => {
                        if (!res.ok) {
                            throw new Error(`Failed to follow user: ${await res.text()}`);
                        }
                        followLoading = false;
                    })
                    .catch((e) => {
                        console.error(e);
                        const message = `Failed to follow user`;
                        toast.error(message);
                        isFollowing = false;
                        followLoading = false;
                    });

                break;
            }
            case 'unfollow': {
                if (!isFollowing) {
                    const message = `Attempted to unfollow a user you're not following`;
                    console.error(message);
                    toast.error(message);
                }
                isFollowing = false;
                fetch(`/api/u/${userInfo.username}/follow`, {
                    method: 'DELETE',
                })
                    .then(async (res) => {
                        if (!res.ok) {
                            throw new Error(`Failed to unfollow user: ${await res.text()}`);
                        }
                        followLoading = false;
                    })
                    .catch((e) => {
                        console.error(e);
                        const message = `Failed to unfollow user`;
                        toast.error(message);
                        isFollowing = true;
                        followLoading = false;
                    });
            }
        }
    };
</script>

<Card.Root>
    <Card.Header>
        <div class="flex flex-row items-center justify-between">
            <div class="flex flex-row items-center space-x-4">
                {#if userInfo}
                    <Avatar.Root class="h-12 w-12">
                        <Avatar.Image src={userInfo.profileImage || ''} alt={userInfo.username} />
                        <Avatar.Fallback class="font-bold"
                            >{userInfo.username[0]?.toUpperCase() || '?'}</Avatar.Fallback
                        >
                    </Avatar.Root>
                {:else}
                    <Skeleton class="h-12 w-12 rounded-full" />
                {/if}
                {#if userInfo}
                    <h1 class="text-xl font-bold">u/{userInfo.username}</h1>
                {:else}
                    <h1 class="text-xl font-bold">u/</h1>
                    <Skeleton class="h-4 w-[100px]" />
                {/if}
            </div>
            {#if user}
                {#if isFollowing}
                    <Button
                        disabled={followLoading}
                        variant="outline"
                        on:click={updateFollow('unfollow')}>Unfollow</Button
                    >
                {:else}
                    <Button disabled={followLoading} on:click={updateFollow('follow')}
                        >Follow</Button
                    >
                {/if}
            {:else}
                <Tooltip.Root>
                    <Tooltip.Trigger>
                        <Button disabled>Follow</Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>Sign in to follow</p>
                    </Tooltip.Content>
                </Tooltip.Root>
            {/if}
        </div>
    </Card.Header>
    <Card.Content></Card.Content>
</Card.Root>
