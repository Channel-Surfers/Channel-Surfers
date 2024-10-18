<script lang="ts">
    import * as Avatar from '$lib/shadcn/components/ui/avatar/index';
    import { Skeleton } from '$lib/shadcn/components/ui/skeleton/index';
    import type { PosterData } from '$lib/types';

    export let poster: PosterData | undefined;
</script>

<div class="flex items-center space-x-2">
    {#if poster}
        <Avatar.Root class="h-8 w-8">
            <Avatar.Image src={poster.user.avatar || ''} alt={poster.user.name} />
            <Avatar.Fallback>{poster.user.name[0]?.toUpperCase() || '?'}</Avatar.Fallback>
        </Avatar.Root>
    {:else}
        <div>
            <Skeleton class="h-8 w-8 rounded-full" />
        </div>
    {/if}
    <div class="w-full">
        {#if poster}
            <p class="h-4 w-full text-sm">
                <a
                    href="/c/{poster.channel.private
                        ? `private/${poster.channel.id}`
                        : poster.channel.name}"
                    class="decoration-slate-500 underline-offset-2 hover:underline"
                >
                    c/{poster.channel.name}
                </a>
            </p>
            <p class="w-4/5 text-sm text-muted-foreground">
                <a
                    href="/u/{poster.user.name}"
                    class="decoration-slate-700 underline-offset-2 hover:underline"
                >
                    u/{poster.user.name}
                </a>
            </p>
        {:else}
            <Skeleton class="mb-1 h-3 w-1/3" />
            <Skeleton class="h-3 w-1/5" />
        {/if}
    </div>
</div>
