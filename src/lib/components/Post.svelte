<script lang="ts">
    import { PUBLIC_PREVIEW_HOST } from '$env/static/public';

    import * as Card from '$lib/shadcn/components/ui/card/index';
    import { Badge } from '$lib/shadcn/components/ui/badge/index';
    import { Toggle } from '$lib/shadcn/components/ui/toggle/index';
    import { Skeleton } from '$lib/shadcn/components/ui/skeleton/index';

    import ArrowUp from 'lucide-svelte/icons/arrow-up';
    import ArrowDown from 'lucide-svelte/icons/arrow-down';

    import UserChannel from './UserChannel.svelte';
    import Score from './Score.svelte';

    const videoId = 'e0245338-7c04-4a6c-b44f-0e279a849cf5';

    let loading = true;
    setTimeout(() => loading = false, 1000);

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

    let hovering = false;
    $: src = `${PUBLIC_PREVIEW_HOST}/${videoId}/${hovering ? 'preview.webp' : 'thumbnail.jpg'}`
</script>

<Card.Root class="flex flex-row h-48 w-2/3 p-2 m-auto my-4">
    <img src="{src}" alt="" class="rounded-lg cursor-pointer" on:mouseenter={() => hovering = true} on:mouseleave={() => hovering = false}>
    <div class="flex flex-col grow justify-between h-full img">
        <Card.Header class="p-2 px-6">
            <Card.Title class="space-y-1">
                <div class="mb-4">
                    <UserChannel user={loading ? undefined : { username: 'foo', channel: 'bar' }} />
                </div>
                {#if loading}
                    <Skeleton class="h-5 mt-3 w-full" />
                    <Skeleton class="h-5 w-2/3" />
                {:else}
                    <h1 class="mt-3 w-full text-ellipse text-pretty">
                        Lorem ipsum dolor sit amet
                    </h1>
                {/if}
            </Card.Title>
        </Card.Header>
        <Card.Footer class="flex gap-1.5 p-2 px-6 mt-2">
            {#if loading}
                <Skeleton class="h-6 w-[50px] rounded-full" />
                <Skeleton class="h-6 w-[50px] rounded-full" />
                <Skeleton class="h-6 w-[50px] rounded-full" />
            {:else}
                <Badge>Foo</Badge>
            {/if}
        </Card.Footer>
    </div>
    <div class="justify-self-end flex flex-col justify-end">
        <div class="flex flex-col items-center">
            <Toggle size="sm" disabled={loading} class="hover:text-orange-600 data-[state=on]:text-orange-600" bind:pressed={upvote_pressed} on:click={() => vote('up')}>
                <div class:animate-pulse={loading}>
                    <ArrowUp />
                </div>
            </Toggle>
            {#if loading}
                <Skeleton class="h-6 w-6 rounded-full" />
            {:else}
                <Score upvotes={3000} downvotes={4000} />
            {/if}
            <Toggle size="sm" disabled={loading} class="hover:text-cyan-600 data-[state=on]:text-cyan-600" bind:pressed={downvote_pressed} on:click={() => vote('down')}>
                <div class:animate-pulse={loading}>
                    <ArrowDown />
                </div>
            </Toggle>
        </div>
    </div>
</Card.Root>

