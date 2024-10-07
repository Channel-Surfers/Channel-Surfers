<script lang="ts">
    import { onMount } from 'svelte';
    import { PAGE_SIZE } from '$lib';
    import { toast } from 'svelte-sonner';
    import type { PostData, uuid } from '$lib/types';
    import { viewport } from '$lib/util';

    import Clock from 'lucide-svelte/icons/clock';
    import ArrowUp from 'lucide-svelte/icons/arrow-up';
    import ChevronUp from 'lucide-svelte/icons/chevron-up';
    import ChevronDown from 'lucide-svelte/icons/chevron-down';

    import Post from './Post.svelte';

    import * as Select from '$lib/shadcn/components/ui/select';
    import { Button } from '$lib/shadcn/components/ui/button';

    export let data: { signed_in?: boolean } & (
        | { source: 'home' }
        | { source: 'channel'; channel_name: string }
        | { source: 'private_channel'; channel_id: uuid }
        | { source: 'user'; username: string }
    );

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

    let filter = {
        value: 'all',
        label: 'All',
        disabled: false,
    };

    let sort = {
        value: 'votes',
        label: 'Top',
        disabled: false,
    };

    let reverseSort = false;

    let page: number = 0;
    let buffer: PostData[] = [];
    let state: 'loading' | 'error' | 'active' | 'no-posts' = 'active';
    const get_posts = async () => {
        if (state === 'loading') return;
        state = 'loading';
        try {
            console.log('get_posts', { sort, filter });
            const search = new URLSearchParams({
                page: `${page++}`,
                type: 'home',
                sort: sort.value as 'votes' | 'date',
                filter: filter.value as 'all' | 'subscribed',
                reverseSort: reverseSort + '', // default behaviour, but ts is ts
            });
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

    const update = () => {
        console.log('update');
        buffer = [];
        get_posts();
    };

    onMount(get_posts);
</script>

<div class="flex h-full max-h-full w-full flex-col items-center overflow-auto">
    <div class="mx-4 mb-2 mt-4 flex flex-row gap-4 self-end">
        <Select.Root
            portal={null}
            selected={filter}
            onSelectedChange={(e) => {
                filter = e;
                update();
            }}
        >
            <Select.Trigger class="w-[180px]">
                <Select.Value placeholder="Filter" />
            </Select.Trigger>
            <Select.Content>
                <Select.Item value="all" label="All">All</Select.Item>
                <Select.Item value="subscribed" label="Subscribed" disabled={!data.signed_in}
                    >Subscribed</Select.Item
                >
            </Select.Content>
        </Select.Root>
        <Select.Root
            portal={null}
            selected={sort}
            onSelectedChange={(e) => {
                sort = e;
                update();
            }}
        >
            <Select.Trigger class="w-[180px]">
                <Select.Value placeholder="Sort" />
            </Select.Trigger>
            <Select.Content>
                <Select.Item value="date" label="Date Posted">
                    <Clock class="mr-2 h-4 w-4" />
                    <span>Date Posted</span>
                </Select.Item>
                <Select.Item value="votes" label="Top">
                    <ArrowUp class="mr-2 h-4 w-4" />
                    <span>Top</span>
                </Select.Item>
            </Select.Content>
        </Select.Root>
        <Button
            size="icon"
            variant="secondary"
            on:click={() => {
                reverseSort = !reverseSort;
                update();
            }}
        >
            {#if reverseSort}
                <ChevronUp />
            {:else}
                <ChevronDown />
            {/if}
        </Button>
    </div>
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
