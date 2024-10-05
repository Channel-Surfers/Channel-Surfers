<script lang="ts">
    import type { PostData } from '$lib/types';
    import { onMount } from 'svelte';
    import Post from './Post.svelte';
    import { toast } from 'svelte-sonner';
    import { Button } from '$lib/shadcn/components/ui/button';
    import { dev } from '$app/environment';

    export let channel_name: string;

    let page: number = 0;
    let buffer: PostData[] = Array(2)
        .fill(0)
        .map(() => ({
            title: 'Look at this cute squirrel that I found while on a walk today',
            videoId: 'e0245338-7c04-4a6c-b44f-0e279a849cf5',
            user: { username: 'SomeN3rd', channel: 'awww' },
            tags: ['Squirrel', 'Animal', 'Nature'],
            comments: 0,
            upvotes: Math.floor(Math.random() * 10000),
            downvotes: Math.floor(Math.random() * 10000),
        }));
    let state: 'loading' | 'error' | 'active' | 'no-posts' = 'active';
    const get_posts = async () => {
        state = 'loading';
        try {
            const search = new URLSearchParams({
                page: `${page++}`,
                channel_name,
            });
            const res = await fetch(`/api/posts?${search}`);

            if (dev) {
                await new Promise((res) => setTimeout(() => res(0), 2000));
            }

            throw 'foo';

            const new_posts = await res.json();
            if (new_posts.length === 0) {
                state = 'no-posts';
            } else {
                buffer = buffer.concat(new_posts);
                state = 'active';
            }
        } catch (e) {
            toast.error('Unexpected error while loading posts');
            console.error(e);
            state = 'error';
        }
    };

    onMount(async () => {
        get_posts();
    });
</script>

<div class="flex w-full flex-col items-center">
    {#each buffer as post}
        <Post {post} />
    {/each}
    {#if state === 'loading'}
        <Post />
    {:else if state === 'error'}
        <Button on:click={get_posts} class="mt-4" variant="outline">Try Again</Button>
    {:else if state === 'no-posts'}
        <p class="mt-4 text-lg text-slate-400">No more posts</p>
    {/if}
</div>
