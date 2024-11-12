<script lang="ts">
    import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
    import { page } from '$app/stores';

    export let data;

    const filter = 'all';
    const sort = 'date';
    const reverseSort = 'false';

    const now = new Date();
    const getPosts = async (page: number) => {
        const search = new URLSearchParams({
            page: `${page}`,
            after: now.toISOString(),
            sort,
            filter,
            reverseSort: `${reverseSort}`,
        });

        const res = await fetch(`/api/c/${data.channelName}/posts?${search}`);

        if (res.status !== 200) {
            throw new Error(await res.text());
        }

        return await res.json();
    };
</script>

<svelte:head>
    <title>c/{$page.params.channelName} | Channel Surfers</title>
</svelte:head>

<InfiniteScroll initBuffer={data.posts} {getPosts} signedIn={data.user} />
