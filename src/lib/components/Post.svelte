<script lang="ts">
    import { PUBLIC_PREVIEW_HOST } from '$env/static/public';

    import * as Card from '$lib/shadcn/components/ui/card';
    import * as Popover from '$lib/shadcn/components/ui/popover';
    import { Badge } from '$lib/shadcn/components/ui/badge';
    import { Button } from '$lib/shadcn/components/ui/button';
    import { Skeleton } from '$lib/shadcn/components/ui/skeleton';
    import { Toggle } from '$lib/shadcn/components/ui/toggle';

    import ArrowDown from 'lucide-svelte/icons/arrow-down';
    import ArrowUp from 'lucide-svelte/icons/arrow-up';
    import Share2 from 'lucide-svelte/icons/share-2';
    import Play from 'lucide-svelte/icons/play';

    import Score from './Score.svelte';
    import UserChannel from './UserChannel.svelte';
    import Player from './Player.svelte';

    import type { PostData } from '$lib/types';
    import { createEventDispatcher } from 'svelte';

    export let post: PostData | undefined = undefined;
    export let playing_video: boolean = false;
    const dispatch = createEventDispatcher();

    let upvote_pressed = false;
    let downvote_pressed = false;

    const vote = (dir: 'up' | 'down') => {
        let new_state;
        if (dir === 'up') {
            downvote_pressed = false;
            new_state = !upvote_pressed;
        } else {
            upvote_pressed = false;
            new_state = !downvote_pressed;
        }
        const voteChangeValue: 'up' | 'down' | 'none' = new_state ? dir : 'none';
        dispatch('voteChange', voteChangeValue);
    };

    let hovering = false;
    $: src = post
        ? `${PUBLIC_PREVIEW_HOST}/${post.videoId}/${hovering ? 'preview.webp' : 'thumbnail.jpg'}`
        : '';
</script>

<Card.Root class="m-auto my-3 flex h-48 w-[750px] flex-row p-2">
    <div
        class="relative h-full w-2/5"
        on:mouseenter={() => (hovering = true)}
        on:mouseleave={() => (hovering = false)}
        role="img"
    >
        {#if !post}
            <Skeleton class="h-full w-full rounded-lg" />
        {:else if playing_video}
            <Player videoId={post.videoId} autoplay />
        {:else}
            <button
                class="absolute flex h-full w-full items-center justify-center rounded-lg bg-black/50"
                class:hidden={!hovering}
                on:click={() => (playing_video = true)}
            >
                <Play fill="white" size="48" />
            </button>
            <img {src} alt="" class="h-full w-full rounded-lg object-cover" />
        {/if}
    </div>
    <div class="img flex h-full grow flex-col justify-between">
        <Card.Header class="p-2 px-6">
            <Card.Title class="space-y-1">
                <div class="mb-4">
                    <UserChannel user={post ? post.poster : undefined} />
                </div>
                {#if post}
                    <h1 class="text-ellipse mt-3 w-full text-pretty">{post.title}</h1>
                {:else}
                    <Skeleton class="mt-3 h-5 w-full" />
                    <Skeleton class="h-5 w-2/3" />
                {/if}
            </Card.Title>
        </Card.Header>
        <Card.Footer class="mt-2 flex gap-1.5 p-2 px-6">
            {#if post}
                {#if post.tags}
                    {#each post.tags as badge}
                        <Badge>{badge}</Badge>
                    {/each}
                {/if}
            {:else}
                <Skeleton class="h-6 w-[50px] rounded-full" />
                <Skeleton class="h-6 w-[50px] rounded-full" />
                <Skeleton class="h-6 w-[50px] rounded-full" />
            {/if}
        </Card.Footer>
    </div>
    <div class="flex flex-col items-center justify-between justify-self-end">
        <Popover.Root>
            <Popover.Trigger asChild let:builder>
                <Button builders={[builder]} variant="ghost" size="icon" disabled={!post}>
                    <div class:animate-pulse={!post}>
                        <Share2 class="h-5 w-5" />
                    </div>
                </Button>
            </Popover.Trigger>
            <Popover.Content>
                <h1>Not yet implemented!</h1>
            </Popover.Content>
        </Popover.Root>
        <div class="flex flex-col items-center">
            <Toggle
                size="sm"
                disabled={!post}
                class="hover:text-upvote data-[state=on]:text-upvote"
                bind:pressed={upvote_pressed}
                on:click={() => vote('up')}
            >
                <div class:animate-pulse={!post}>
                    <ArrowUp />
                </div>
            </Toggle>
            {#if post}
                <Score upvotes={post.upvotes} downvotes={post.downvotes} />
            {:else}
                <Skeleton class="h-6 w-6 rounded-full" />
            {/if}
            <Toggle
                size="sm"
                disabled={!post}
                class="hover:text-downvote data-[state=on]:text-downvote"
                bind:pressed={downvote_pressed}
                on:click={() => vote('down')}
            >
                <div class:animate-pulse={!post}>
                    <ArrowDown />
                </div>
            </Toggle>
        </div>
    </div>
</Card.Root>
