<script lang="ts">
    import '../app.css';
    import { page } from '$app/stores';
    import { ModeWatcher } from 'mode-watcher';
    import { Button } from '$lib/shadcn/components/ui/button';
    import { House } from 'lucide-svelte';
    console.log($page.error);

    let message = $page.error?.message;
</script>

<svelte:head>
    {#if message}
        <title>{message} | Channel Surfers</title>
    {:else}
        <title>{$page.status} Error | Channel Surfers</title>
    {/if}
</svelte:head>

<ModeWatcher />

<div class="flex max-h-screen min-h-screen flex-col items-center justify-center gap-6">
    <p class="text-5xl">{$page.status} {#if !message}Error{/if}</p>
    {#if message}
        <p class="text-3xl">
            {message}
        </p>
    {/if}
    <img src="/404.webp" alt="error GIF" />
    <Button href="/">
        <House class="mr-2 h-4 w-4" />
        Go Home
    </Button>
</div>
