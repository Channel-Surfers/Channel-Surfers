<script lang="ts">
    import type { ComponentType } from 'svelte';
    import type { Icon } from 'lucide-svelte';
    import { page } from '$app/stores';

    export let title: string;
    export let href: string;
    export let icon: ComponentType<Icon> | null = null;
</script>

{#if $page.url.href.includes(href)}
    <a {href} class="w-full flex flex-row items-center space-x-2 bg-accent rounded-md p-2">
        <svelte:component this={icon} /><span class="font-bold text-xl">{title}</span>
    </a>
{:else}
    <a {href} class="w-full flex flex-row items-center space-x-2 bg-secondary rounded-md p-2">
        <svelte:component this={icon} /><span class="font-bold text-xl">{title}</span>
    </a>
{/if}
