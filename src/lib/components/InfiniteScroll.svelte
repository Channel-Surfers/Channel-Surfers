<script lang="ts">
    import type { PostData, uuid } from '$lib/types';
    import { viewport } from '$lib/util';
    import { PAGE_SIZE } from '$lib';
    import { onMount } from 'svelte';
    import Post from './Post.svelte';
    import { toast } from 'svelte-sonner';
    import { Button } from '$lib/shadcn/components/ui/button';
    import type { HomePostFilter } from '$lib/server/services/content';

    export let data:
        | { source: 'home' }
        | { source: 'channel'; channel_name: string }
        | { source: 'private_channel'; channel_id: uuid }
        | { source: 'user'; username: string };

    const url =
        data.source === 'home'
            ? '/api/posts'
            : data.source === 'channel'
              ? `/api/c/${data.channel_name}/posts`
              : data.source === 'private_channel'
                ? `/api/c/private/${data.channel_id}/posts`
                : data.source === 'user'
                  ? `/api/u/${data.username}/posts`
                  : 0; // unreachable

    let page: number = 0;
    let buffer: PostData[] = [];
    let state: 'loading' | 'error' | 'active' | 'no-posts' = 'active';
    const get_posts = async () => {
        state = 'loading';
        try {
            const params: HomePostFilter = {
                type: 'home',
                sort: 'votes',
                filter: 'all',
            };

            const search = new URLSearchParams({
                page: `${page++}`,
                ...params,
            } as any);
            const res = await fetch(`${url}?${search}`);

            if (res.status !== 200) {
                throw new Error(await res.text());
            }

            const new_posts = await res.json();
            buffer = buffer.concat(new_posts);
            if (new_posts.length < PAGE_SIZE) {
                state = 'no-posts';
            } else {
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
