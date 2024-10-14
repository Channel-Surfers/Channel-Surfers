<script lang="ts">
    import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';

    export let data;

    let filter = 'all';
    let sort = 'date';
    let reverseSort = false;
    const now = new Date();

    const get_posts = async (page: number) => {
        const search = new URLSearchParams({
            page: `${page}`,
            type: 'home',
            after: now.toISOString(),
            sort,
            filter,
            reverseSort: `${reverseSort}`,
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
    <InfiniteScroll init_buffer={data.initial_posts} {get_posts} signed_in={!!data.user} />
</div>
