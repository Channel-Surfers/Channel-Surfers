<script lang="ts">
    import { Button } from '$lib/shadcn/components/ui/button';
    import { PAGE_SIZE } from '$lib';
    import { toast } from 'svelte-sonner';
    import type { PostData } from '$lib/types';
    import { viewport } from '$lib/util';

    import Post from './Post.svelte';

    export let init_buffer: PostData[];

    export let get_posts: (page_number: number) => Promise<PostData[]>;

    let page: number;
    let state: 'loading' | 'error' | 'active' | 'no-posts';
    let buffer: PostData[];
    reset(init_buffer);

    const get_next_posts = async () => {
        if (state === 'loading') return;
        state = 'loading';
        try {
            const new_posts = await get_posts(page++);
            buffer = buffer.concat(new_posts);
            if (new_posts.length < PAGE_SIZE) {
                state = 'no-posts';
            } else {
                state = 'active';
            }
        } catch (e) {
            toast.error('Unexpected error while loading posts');
            console.error(e);
            state = 'error';
        }
    };

    export function reset(posts: PostData[] = []) {
        buffer = posts;
        state = 'active';
        page = Math.floor(posts.length / PAGE_SIZE);
    }
</script>

<div class="flex h-full max-h-full w-full flex-col items-center overflow-auto">
    {#each buffer as post}
        <Post {post} />
    {/each}
    {#if state === 'loading'}
        <Post />
    {:else if state === 'active'}
        <div use:viewport on:enter={get_next_posts}>
            <Post />
        </div>
    {:else if state === 'error'}
        <Button on:click={get_next_posts} class="mt-4" variant="outline">Try Again</Button>
    {:else if state === 'no-posts'}
        <p class="mt-4 text-lg text-slate-400">No more posts</p>
    {/if}
</div>
