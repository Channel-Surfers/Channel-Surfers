<script lang="ts">
    import * as Card from '$lib/shadcn/components/ui/card';
    import * as Avatar from '$lib/shadcn/components/ui/avatar/index';
    import * as Tooltip from '$lib/shadcn/components/ui/tooltip/index.js';
    import type { User } from '$lib/server/db/users.sql';
    import type { UserStats } from '$lib/server/services/users';
    import Skeleton from '$lib/shadcn/components/ui/skeleton/skeleton.svelte';
    import Button from '$lib/shadcn/components/ui/button/button.svelte';

    export let userInfo: (User & UserStats) | null = null;
    export let user: User | null = null;
    export let isFollowing: boolean = false;
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
                    <Button type="submit" variant="destructive">Unfollow</Button>
                {:else}
                    <Button type="submit">Follow</Button>
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
