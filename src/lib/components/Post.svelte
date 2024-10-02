<script lang="ts">
    import { PUBLIC_PREVIEW_HOST } from '$env/static/public';

    import * as Card from '$lib/shadcn/components/ui/card';
    import * as Drawer from '$lib/shadcn/components/ui/drawer';
    import { Badge } from '$lib/shadcn/components/ui/badge';
    import { Button } from '$lib/shadcn/components/ui/button';
    import { Skeleton } from '$lib/shadcn/components/ui/skeleton';
    import { Toggle } from '$lib/shadcn/components/ui/toggle';

    import ArrowDown from 'lucide-svelte/icons/arrow-down';
    import ArrowUp from 'lucide-svelte/icons/arrow-up';
    import Share2 from 'lucide-svelte/icons/share-2';
    import Play from 'lucide-svelte/icons/play';

    import Score from './Score.svelte';
    import ShareSheet from './ShareSheet.svelte';
    import UserChannel from './UserChannel.svelte';
    import Player from './Player.svelte';

    import type { PostData } from '$lib/types';
    import { createEventDispatcher } from 'svelte';

    export let post: PostData;
	const dispatch = createEventDispatcher();

    let loading = true;
    setTimeout(() => (loading = false), 1000);

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
        console.log(dir, new_state);

    };

    let playing_video = false;

    let hovering = false;
    $: src = `${PUBLIC_PREVIEW_HOST}/${post.videoId}/${hovering ? 'preview.webp' : 'thumbnail.jpg'}`;
</script>

<Card.Root class="m-auto my-4 flex h-48 w-2/3 flex-row p-2">
    <div
        class="relative h-full w-2/5"
        on:mouseenter={() => (hovering = true)}
        on:mouseleave={() => (hovering = false)}
        role="img"
    >
        {#if loading}
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
                    <UserChannel user={loading ? post.user : undefined} />
                </div>
                {#if loading}
                    <Skeleton class="mt-3 h-5 w-full" />
                    <Skeleton class="h-5 w-2/3" />
                {:else}
                    <h1 class="text-ellipse mt-3 w-full text-pretty">Lorem ipsum dolor sit amet</h1>
                {/if}
            </Card.Title>
        </Card.Header>
        <Card.Footer class="mt-2 flex gap-1.5 p-2 px-6">
            {#if loading}
                <Skeleton class="h-6 w-[50px] rounded-full" />
                <Skeleton class="h-6 w-[50px] rounded-full" />
                <Skeleton class="h-6 w-[50px] rounded-full" />
            {:else}
                <Badge>Foo</Badge>
            {/if}
        </Card.Footer>
    </div>
    <div class="flex flex-col items-center justify-between justify-self-end">
        <Drawer.Root>
            <Drawer.Trigger asChild let:builder>
                <Button builders={[builder]} variant="ghost" size="icon" disabled={loading}>
                    <div class:animate-pulse={loading}>
                        <Share2 class="h-5 w-5" />
                    </div>
                </Button>
            </Drawer.Trigger>
            <Drawer.Content>
                <ShareSheet title="Share Post" url={location.href} />
            </Drawer.Content>
        </Drawer.Root>
        <div class="flex flex-col items-center">
            <Toggle
                size="sm"
                disabled={loading}
                class="hover:text-upvote data-[state=on]:text-upvote"
                bind:pressed={upvote_pressed}
                on:click={() => vote('up')}
            >
                <div class:animate-pulse={loading}>
                    <ArrowUp />
                </div>
            </Toggle>
            {#if loading}
                <Skeleton class="h-6 w-6 rounded-full" />
            {:else}
                <Score upvotes={3000} downvotes={4000} />
            {/if}
            <Toggle
                size="sm"
                disabled={loading}
                class="hover:text-downvote data-[state=on]:text-downvote"
                bind:pressed={downvote_pressed}
                on:click={() => vote('down')}
            >
                <div class:animate-pulse={loading}>
                    <ArrowDown />
                </div>
            </Toggle>
        </div>
    </div>
</Card.Root>
