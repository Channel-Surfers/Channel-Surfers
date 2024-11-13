<script lang="ts">
    //TEST: 066ed576-645f-46a3-b8ee-8b6429d233cf
    import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
    import type { ScrollFilters } from '$lib/types.js';

    export let data;
    let scroll: InfiniteScroll;

    const filters: ScrollFilters = {
        sort: 'date',
        sortDirection: 'dsc',
        filter: 'all',
        after: new Date(),
    };

    const getPosts = async (page: number) => {
        const search = new URLSearchParams({
            page: `${page}`,
            after: filters.after!.toISOString(),
            sort: filters.sort as string,
            filter: filters.filter as string,
            sortDirection: filters.sortDirection as string,
        });

        const res = await fetch(`/api/c/private/${data.channelId}/posts?${search}`);

        if (res.status !== 200) {
            throw new Error(await res.text());
        }

        return await res.json();
    };
</script>

<svelte:head>
    <title>c/{data.channelName} | Channel Surfers</title>
</svelte:head>

<InfiniteScroll
    initBuffer={data.posts}
    {getPosts}
    signedIn={data.user}
    bind:this={scroll}
    {filters}
    on:updateFilters={() => scroll.reset()}
/>
