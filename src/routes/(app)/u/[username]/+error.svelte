<script>
    import { page } from '$app/stores';
</script>

{#if $page.error}
    <h1 class="p-4 text-2xl">
        <span class="font-bold">{$page.status}</span>: {$page.error.message}
    </h1>
{/if}
