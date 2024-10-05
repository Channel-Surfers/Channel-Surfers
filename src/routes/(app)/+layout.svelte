<script>
    import DisplayMode from '$lib/shadcn/components/utils/DisplayMode.svelte';
    import ProfileIcon from '$lib/components/user/ProfileIcon.svelte';
    import { Toaster } from '$lib/shadcn/components/ui/sonner';
    import '../../app.css';
    import { ModeWatcher } from 'mode-watcher';

    export let data;
</script>

<!-- Enable dark-mode detection and switching -->
<ModeWatcher />
<DisplayMode />
<ProfileIcon user={data.user} />
<Toaster richColors />
<slot />

<style lang="postcss">
    :global(html) {
        background-color: theme(colors.background);
    }
</style>
