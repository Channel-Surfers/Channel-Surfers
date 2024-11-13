<script lang="ts">
    import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';

    export let data;

    const now = new Date();
    const getPosts = async (page: number) => {
        const search = new URLSearchParams({
            page: `${page}`,
            type: 'home',
            after: now.toISOString(),
            sort: 'date',
            filter: 'all',
            sortDirection: 'dsc',
        });
        const res = await fetch(`/api/posts?${search}`);

        if (res.status !== 200) {
            throw new Error(await res.text());
        }

        return await res.json();
    };
</script>

<svelte:head>
    <title>Channel Surfers</title>
</svelte:head>

<div class="h-[100vh] w-full">
    <InfiniteScroll initBuffer={data.initialPosts} {getPosts} signedIn={data.user} />
</div>
