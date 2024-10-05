<script lang="ts">
    import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';

    export let data;
</script>

<svelte:head>
    <title>Channel Surfers</title>
</svelte:head>
<h1>Welcome to Channel Surfers{data.user ? `, ${data.user.username}` : ''}</h1>

<a href="/user" class="text-blue-700">User page</a>

{#if data.channels}
    <p>retrieved {data.channels.length} channels successfully</p>
{:else}
    <p>retrieved no channels due to error</p>
{/if}

<p>
    Visit <a class="text-blue-700" href="https://github.com/Channel-Surfers/Channel-Surfers/wiki"
        >the Wiki</a
    > to read the documentation
</p>

<InfiniteScroll />
