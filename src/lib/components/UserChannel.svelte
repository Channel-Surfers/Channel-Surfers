<script lang="ts">
    import * as Avatar from '$lib/shadcn/components/ui/avatar/index';
    import { Skeleton } from '$lib/shadcn/components/ui/skeleton/index';

    export let user: { username: string; channel: string; avatar?: string } | undefined;
</script>

<div class="flex items-center space-x-4">
    {#if user}
        <Avatar.Root class="h-12 w-12">
            <Avatar.Image src={user.avatar || ''} alt={user.username} />
            <Avatar.Fallback>{user.username[0]?.toUpperCase() || '?'}</Avatar.Fallback>
        </Avatar.Root>
    {:else}
        <Skeleton class="h-12 w-16 rounded-full" />
    {/if}
    <div class="w-full space-y-2">
        {#if user}
            <p class="h-4 w-full">
                <a
                    href="/c/{user.channel}"
                    class="decoration-slate-500 underline-offset-2 hover:underline"
                >
                    c/{user.channel}
                </a>
            </p>
            <p class="w-4/5 text-muted-foreground">
                <a
                    href="/u/{user.username}"
                    class="decoration-slate-700 underline-offset-2 hover:underline"
                >
                    u/{user.username}
                </a>
            </p>
        {:else}
            <Skeleton class="h-4 w-2/3" />
            <Skeleton class="h-4 w-1/3" />
        {/if}
    </div>
</div>
