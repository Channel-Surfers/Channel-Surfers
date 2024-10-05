<script lang="ts">
    import type { PostData } from '$lib/types';
    import { sleep, viewport } from '$lib/util';
    import { onMount } from 'svelte';
    import Post from './Post.svelte';
    import { toast } from 'svelte-sonner';
    import { Button } from '$lib/shadcn/components/ui/button';
    import { dev } from '$app/environment';

    export let channel_name: string;

    let page: number = 0;
    let buffer: PostData[] = Array(3)
        .fill(0)
        .map((_, i) => ({
            title: 'Look at this cute squirrel that I found while on a walk today',
            videoId: 'e0245338-7c04-4a6c-b44f-0e279a849cf5',
            poster: {
                user: {
                    id: '56a34a19-4bfb-4401-96de-ae473e1331ff',
                    name: 'SomeN3rd',
                },
                channel: {
                    name: 'awww',
                    id: '56a34a19-4bfb-4401-96de-ae473e1331ff',
                    private: !!i,
                },
            },
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

            // Add artificial delay so we can see what it looks like when loading
            if (dev) await sleep(2000);

            const new_posts = await res.json();
            if (new_posts.length === 0) {
                state = 'no-posts';
            } else {
                buffer = buffer.concat(new_posts);
                state = 'active';
            }
            console.log('done loading');
        } catch (e) {
            toast.error('Unexpected error while loading posts');
            console.error(e);
            state = 'error';
        }
    };

    const enter = () => {
        get_posts();
    };

    onMount(get_posts);
</script>

<div class="flex h-full max-h-full w-full flex-col items-center overflow-auto pb-8">
    {#each buffer as post}
        <Post {post} />
    {/each}
    {#if state === 'loading'}
        <Post />
    {:else if state === 'active'}
        <div use:viewport on:enter={enter}>
            <Post />
        </div>
    {:else if state === 'error'}
        <Button on:click={get_posts} class="mt-4" variant="outline">Try Again</Button>
    {:else if state === 'no-posts'}
        <p class="mt-4 text-lg text-slate-400">No more posts</p>
    {/if}
</div>
