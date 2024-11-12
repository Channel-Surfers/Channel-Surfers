<script lang="ts">
    import * as Card from '$lib/shadcn/components/ui/card';
    import * as Avatar from '$lib/shadcn/components/ui/avatar';
    import * as DropdownMenu from '$lib/shadcn/components/ui/dropdown-menu';
    import type { User } from '$lib/server/db/users.sql';
    import type { UserStats } from '$lib/server/services/users';
    import Skeleton from '$lib/shadcn/components/ui/skeleton/skeleton.svelte';
    import Button from '$lib/shadcn/components/ui/button/button.svelte';
    import { toast } from 'svelte-sonner';
    import { Ban, CircleCheck, EllipsisVertical, Flag } from 'lucide-svelte';

    export let userInfo: (User & UserStats) | null = null;
    export let user: User | null = null;
    export let isFollowing: boolean = false;
    export let isBlocking: boolean = false;
    let followLoading = false;

    $: isSelf = !!user && !!userInfo && user.id === userInfo.id;

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

                try {
                    const res = await fetch(`/api/u/${userInfo.username}/follow`, {
                        method: 'POST',
                    });
                    if (!res.ok) {
                        throw new Error(`Failed to follow user: ${await res.text()}`);
                    }
                } catch (e) {
                    console.error(e);
                    toast.error('Failed to follow user');
                    isFollowing = false;
                }

                break;
            }
            case 'unfollow': {
                if (!isFollowing) {
                    const message = `Attempted to unfollow a user you're not following`;
                    console.error(message);
                    toast.error(message);
                }
                isFollowing = false;
                try {
                    const res = await fetch(`/api/u/${userInfo.username}/follow`, {
                        method: 'DELETE',
                    });
                    if (!res.ok) {
                        throw new Error(`Failed to unfollow user: ${await res.text()}`);
                    }
                    followLoading = false;
                } catch (e) {
                    console.error(e);
                    toast.error('Failed to unfollow user');
                    isFollowing = true;
                }
            }
        }
        followLoading = false;
    };

    let blockLoading = false;
    const toggleBlocking = async () => {
        const newBlockState = (isBlocking = !isBlocking);
        if (!userInfo || blockLoading) return;

        try {
            const res = await fetch(`/api/u/${userInfo.username}/block`, {
                method: newBlockState ? 'POST' : 'DELETE',
            });

            if (!res.ok) {
                throw new Error(`Failed to unfollow user: ${await res.text()}`);
            }
        } catch (e) {
            console.error(e);
            toast.error(`Failed to ${newBlockState ? '' : 'un'}block user`);
            isBlocking = !isBlocking; // reset blocking
        }
        blockLoading = false;
    };
</script>

<Card.Root>
    <Card.Header>
        <div class="flex flex-row justify-between">
            <div class="flex flex-row items-center space-x-4">
                {#if userInfo}
                    <Avatar.Root class="h-12 w-12">
                        <Avatar.Image src={userInfo.profileImage || ''} alt={userInfo.username} />
                        <Avatar.Fallback class="font-bold">
                            {userInfo.username[0]?.toUpperCase() || '?'}
                        </Avatar.Fallback>
                    </Avatar.Root>
                {:else}
                    <Skeleton class="h-12 w-12 rounded-full" />
                {/if}
                {#if userInfo}
                    <h1 class="text-xl font-bold">u/{userInfo.username}</h1>
                    {#if isBlocking}
                        <h2 class="text-muted-foreground">(Blocked)</h2>
                    {/if}
                {:else}
                    <h1 class="text-xl font-bold">u/</h1>
                    <Skeleton class="h-4 w-[100px]" />
                {/if}
            </div>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                    <Button builders={[builder]} variant="ghost" size="icon" disabled={!userInfo}>
                        <EllipsisVertical />
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="w-56">
                    <DropdownMenu.Item
                        class="text-red-600"
                        on:click={toggleBlocking}
                        disabled={!user || isSelf}
                    >
                        {#if isBlocking}
                            <CircleCheck class="mr-2 h-4 w-4" />
                            <span>Unblock</span>
                        {:else}
                            <Ban class="mr-2 h-4 w-4" />
                            <span>Block</span>
                        {/if}
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item class="text-red-600" disabled>
                        <Flag fill="currentColor" class="mr-2 h-4 w-4" />
                        <span>Report</span>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    </Card.Header>
    <Card.Content>
        {#if isFollowing}
            <Button
                class="w-full"
                disabled={followLoading || isSelf}
                variant="outline"
                on:click={updateFollow('unfollow')}>Unfollow</Button
            >
        {:else}
            <Button
                class="w-full"
                disabled={followLoading || !user || isSelf}
                on:click={updateFollow('follow')}>Follow</Button
            >
        {/if}
    </Card.Content>
</Card.Root>
