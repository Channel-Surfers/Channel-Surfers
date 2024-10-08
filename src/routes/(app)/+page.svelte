<script lang="ts">
    import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';

    export let data;
    // to silence linter
    $: console.log(data);
</script>

<svelte:head>
    <title>Channel Surfers</title>
</svelte:head>

<div class="h-[100vh] w-2/3">
    <InfiniteScroll data={{ source: 'home', signed_in: true }} />
</div>
