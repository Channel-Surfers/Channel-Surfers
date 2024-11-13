<script lang="ts">
    import '../../app.css';
    import { Toaster } from '$lib/shadcn/components/ui/sonner';
    import { ModeWatcher } from 'mode-watcher';
    import type { LayoutServerData } from './$types';
    export let data: LayoutServerData;
    import { selectedTheme } from '$lib/stores';

    // default to previous value
    $selectedTheme = data.theme;
</script>

<ModeWatcher />
<Toaster richColors />

<div class="flex max-h-screen min-h-screen flex-row justify-between">
    Admin panel

    <slot />
</div>

<style lang="postcss">
    :global(html) {
        background-color: theme(colors.background);
    }
</style>
