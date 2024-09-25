<script>
    import DisplayMode from '$lib/components/utils/DisplayMode.svelte';
    import '../app.css';
    import { ModeWatcher } from 'mode-watcher';
</script>

<!-- Enable dark-mode detection and switching -->
<ModeWatcher />
<DisplayMode />
<slot />

<style lang="postcss">
    :global(html) {
        background-color: theme(colors.background);
    }
</style>
