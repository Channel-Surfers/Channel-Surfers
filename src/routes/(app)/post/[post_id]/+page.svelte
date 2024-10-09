<script lang="ts">
    import Player from '$lib/components/Player.svelte';
    import Score from '$lib/components/Score.svelte';
    import { AspectRatio } from '$lib/shadcn/components/ui/aspect-ratio';
    import { Badge } from '$lib/shadcn/components/ui/badge';
    import * as Card from '$lib/shadcn/components/ui/card';
    import { Toggle } from '$lib/shadcn/components/ui/toggle';

    import ArrowUp from 'lucide-svelte/icons/arrow-up';
    import ArrowDown from 'lucide-svelte/icons/arrow-down';
    import UserChannel from '$lib/components/UserChannel.svelte';

    export let data;

    console.log(data);

    let upvote_pressed = false;
    let downvote_pressed = false;

    const vote = (dir: 'UP' | 'DOWN') => {
        let new_state;
        if (dir === 'UP') {
            downvote_pressed = false;
            new_state = !upvote_pressed;
        } else {
            upvote_pressed = false;
            new_state = !downvote_pressed;
        }
        console.log('vote', new_state ? dir : null);
    };
</script>

<svelte:head>
    <title>{data.post.title.substring(0, 10)} | Channel Surfers</title>
</svelte:head>

<Card.Root class="m-auto w-2/3 p-2">
    <Card.Header class="p-2 px-6">
        <Card.Title class="space-y-1">
            <!-- <div class="mb-4">
                    <UserChannel user={post ? post.user : undefined} />
                </div> -->
            <h1 class="text-ellipse mt-3 w-full text-pretty">{data.post.title}</h1>
        </Card.Title>
    </Card.Header>
    <Card.Content>
        <AspectRatio ratio={16 / 9}>
            <Player title={data.post.title} videoId={data.post.videoId} />
        </AspectRatio>
        <!-- Tags -->
        <div class="flex max-w-full gap-1.5 overflow-scroll p-2">
            {#each data.tags as tag}
                <Badge style="background: {tag.color}">
                    {tag.name}
                </Badge>
            {/each}
        </div>
        {#if data.post.description}
            <p class="my-4">{data.post.description}</p>
        {/if}
        <!-- Buttons/Stats -->
        <div class="flex flex-row items-center items-center justify-between">
            <div class="w-2/5">
                <UserChannel
                    user={{
                        username: data.user?.username || '',
                        avatar: data.user?.profileImage || undefined,
                        channel: data.channel.name,
                    }}
                />
            </div>
            <div class="flex flex-row items-center">
                <Toggle
                    size="sm"
                    class="hover:text-upvote data-[state=on]:text-upvote"
                    bind:pressed={upvote_pressed}
                    on:click={() => vote('UP')}
                >
                    <ArrowUp />
                </Toggle>
                <span class="w-8 text-center">
                    <Score side="top" upvotes={data.upvotes} downvotes={data.downvotes} />
                </span>
                <Toggle
                    size="sm"
                    class="hover:text-downvote data-[state=on]:text-downvote"
                    bind:pressed={downvote_pressed}
                    on:click={() => vote('DOWN')}
                >
                    <ArrowDown />
                </Toggle>
            </div>
        </div>
    </Card.Content>
</Card.Root>
