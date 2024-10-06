<script lang="ts">
    import type { ComponentType } from 'svelte';
    import type { Icon } from 'lucide-svelte';
    import { page } from '$app/stores';

    export let title: string;
    export let href: string;
    export let icon: ComponentType<Icon> | null = null;
</script>

<a
    {href}
    class={`flex w-full flex-row items-center space-x-2 rounded-md ${$page.url.pathname === href ? 'bg-accent' : ''} p-2`}
>
    <svelte:component this={icon} /><span class="text-xl font-bold">{title}</span>
</a>
