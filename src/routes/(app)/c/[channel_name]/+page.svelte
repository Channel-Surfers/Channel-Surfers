<script lang="ts">
    import InfiniteScroll from "$lib/components/InfiniteScroll.svelte";

    export let data;

    let filter = 'all'
    let sort = 'date'
    let reverseSort = 'false'
    
    const now = new Date();

    const get_posts = async (page: number) => {
        const search = new URLSearchParams({
            page: `${page}`,
            after: now.toISOString(),
            sort,
            filter,
            reverseSort: `${reverseSort}`,
        });

        const res = await fetch(`/api/c/${data.channel_name}/posts?${search}`);

        if (res.status !== 200) {
            throw new Error(await res.text());
        }

        return await res.json();
    };
</script>


<InfiniteScroll init_buffer={data.posts} {get_posts} signed_in={!!data.user} />