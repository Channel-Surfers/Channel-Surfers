<script lang="ts">
    import { Button } from '$lib/shadcn/components/ui/button';
    import { PAGE_SIZE } from '$lib';
    import { toast } from 'svelte-sonner';
    import type { PostData } from '$lib/types';
    import { viewport } from '$lib/util';

    import Post from './Post.svelte';
    import { ScrollArea } from '$lib/shadcn/components/ui/scroll-area';

    export let initBuffer: PostData[];

    export let getPosts: (pageNumber: number) => Promise<PostData[]>;
    export let signedIn: boolean = false;

    let page: number;
    let state: 'loading' | 'error' | 'active' | 'no-posts';
    let buffer: PostData[];
    reset(initBuffer);

    const getNextPosts = async () => {
        if (state === 'loading') return;
        state = 'loading';
        try {
            const newPosts = await getPosts(page++);
            buffer = buffer.concat(newPosts);
            if (newPosts.length < PAGE_SIZE) {
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
        // if init_buffer has a length less than page size, there logically cannot be any more posts
        if (posts.length > 0 && posts.length < PAGE_SIZE) {
            buffer = posts;
            state = 'no-posts';
            return;
        }
        buffer = posts;
        state = 'active';
        page = Math.floor(posts.length / PAGE_SIZE);
    }
</script>

<ScrollArea class="mx-2 flex h-full max-h-full flex-col items-center">
    {#each buffer as post}
        <Post {post} {signedIn} />
    {/each}
    {#if state === 'loading'}
        <Post />
    {:else if state === 'active'}
        <div use:viewport on:enter={getNextPosts}>
            <Post />
        </div>
    {:else if state === 'error'}
        <div class="mb-8 flex w-full justify-center">
            <Button on:click={getNextPosts} class="mt-4" variant="outline">Try Again</Button>
        </div>
    {:else if state === 'no-posts'}
        <p class="mb-8 mt-4 w-full text-center text-lg text-slate-400">No more posts</p>
    {/if}
</ScrollArea>
