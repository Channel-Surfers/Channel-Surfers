<script lang="ts">
    import type { PostData, uuid } from '$lib/types';
    import { onMount } from 'svelte';
    import Post from './Post.svelte';
    import { toast } from 'svelte-sonner';
    import { Button } from '$lib/shadcn/components/ui/button';

    export let channel_name: string;
    export let user_id: uuid;

    let page: number = 0;
    let buffer: PostData[] = Array(2)
        .fill(0)
        .map(() => ({
            title: 'Look at this cute squirrel that I found while on a walk today',
            videoId: 'e0245338-7c04-4a6c-b44f-0e279a849cf5',
            user: { username: 'SomeN3rd', channel: 'awww' },
            badges: ['Squirrel', 'Animal', 'Nature'],
            upvotes: Math.floor(Math.random() * 10000),
            downvotes: Math.floor(Math.random() * 10000),
        }));
    let loading = false;
    let error: boolean = false;
    const get_posts = async () => {
        loading = true;
        error = false;
        try {
            const search = new URLSearchParams({
                page: `${page}`,
            });
            const res = await fetch(`/api/posts?${search}`);
            await new Promise((res) => setTimeout(() => res(0), 2000));
            const new_posts = await res.json();
            buffer = buffer.concat(new_posts);
        } catch (e) {
            toast.error('Unexpected error while loading posts');
            error = true;
            console.error(e);
        }
        loading = false;
    };

    onMount(async () => {
        get_posts();
    });
</script>

<div class="flex w-full flex-col items-center">
    {#each buffer as post}
        <Post {post} />
    {/each}
    {#if loading}
        <Post />
    {/if}
    {#if error}
        <Button on:click={get_posts} class="mt-4" variant="outline">Try Again</Button>
    {/if}
</div>
