<script lang="ts">
    import { Button } from '$lib/shadcn/components/ui/button';
    import { PAGE_SIZE } from '$lib';
    import { toast } from 'svelte-sonner';
    import type { PostData, ScrollFilters } from '$lib/types';
    import { is, viewport } from '$lib/util';

    import Post from './Post.svelte';
    import { ScrollArea } from '$lib/shadcn/components/ui/scroll-area';
    import type { User } from '$lib/server/db/users.sql';
    import { ArrowDownAz, ArrowUpAz } from 'lucide-svelte';
    import * as Select from '$lib/shadcn/components/ui/select';
    import { createEventDispatcher } from 'svelte';

    export let initBuffer: PostData[];

    export let getPosts: (pageNumber: number) => Promise<PostData[]>;
    export let signedIn: User = false;
    export let filters: ScrollFilters | undefined;

    const dispatch = createEventDispatcher();

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
        // if initBuffer has a length less than page size, there logically cannot be any more posts
        if (posts.length > 0 && posts.length < PAGE_SIZE) {
            buffer = posts;
            state = 'no-posts';
            return;
        }
        buffer = posts;
        state = 'active';
        page = Math.floor(posts.length / PAGE_SIZE);
    }

    const postDeleted = (post: PostData) => {
        buffer = buffer.filter((p) => p.id !== post.id);
    };
</script>

<ScrollArea class="mx-2 flex h-full max-h-full flex-col items-center">
    {#if filters}
        <div class="sticky top-0 z-50 flex w-full flex-row justify-end gap-2 pr-4 pt-2">
            <Select.Root
                selected={{ value: 'date', label: 'Date' }}
                onSelectedChange={(selected) => {
                    if (!selected || !is(['date', 'votes'], selected.value)) return;
                    filters.sort = selected.value;
                    dispatch('updateFilters');
                }}
            >
                <Select.Trigger class="w-[180px]">
                    <Select.Value placeholder="Sort" />
                </Select.Trigger>
                <Select.Content>
                    <Select.Group>
                        <Select.Item value="date">Date</Select.Item>
                        <Select.Item value="votes">Votes</Select.Item>
                    </Select.Group>
                </Select.Content>
            </Select.Root>
            <Button
                size="icon"
                variant="outline"
                on:click={() => {
                    filters.sortDirection = filters.sortDirection === 'asc' ? 'dsc' : 'asc';
                    dispatch('updateFilters');
                }}
            >
                {#if filters.sortDirection === 'asc'}
                    <ArrowDownAz />
                {:else}
                    <ArrowUpAz />
                {/if}
            </Button>
        </div>
    {/if}
    {#each buffer as post}
        <Post {post} {signedIn} on:delete={() => postDeleted(post)} />
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
