<script lang="ts">
    import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';

    export let data;

    let filter = 'all';
    let sort = 'date';
    let reverseSort = false;
    const now = new Date();

    const getPosts = async (page: number) => {
        const search = new URLSearchParams({
            page: `${page}`,
            type: 'user',
            after: now.toISOString(),
            username: data.username,
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

<h1>Hello {data.username}</h1>
<InfiniteScroll init_buffer={data.posts} get_posts={getPosts} signed_in={!!data.user} />
