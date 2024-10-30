<script lang="ts">
    import Markdown from 'svelte-exmarkdown';
    import { gfmPlugin } from 'svelte-exmarkdown/gfm';

    const plugins = [gfmPlugin()];

    export let md: string;
</script>

<article class="prose prose-slate dark:prose-invert prose-code:before:content-[''] prose-code:after:content-['']">
    <Markdown {md} {plugins} />
</article>
