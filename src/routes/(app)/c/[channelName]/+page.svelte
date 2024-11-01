<script lang="ts">
    import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';

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

<InfiniteScroll initBuffer={data.posts} getPosts={getPosts} signedIn={!!data.user} />
