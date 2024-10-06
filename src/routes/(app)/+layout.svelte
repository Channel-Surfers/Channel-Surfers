<script>
    import { Toaster } from '$lib/shadcn/components/ui/sonner';
    import '../../app.css';
    import { ModeWatcher } from 'mode-watcher';
</script>

<!-- Enable dark-mode detection and switching -->
<ModeWatcher />
<Toaster richColors />
<slot />

<style lang="postcss">
    :global(html) {
        background-color: theme(colors.background);
    }
</style>
