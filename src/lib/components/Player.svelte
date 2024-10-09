<script lang="ts">
    import { PUBLIC_LIBRARY_ID } from '$env/static/public';
    import type { Props } from '$lib/shadcn/components/ui/button';

    export let videoId: string;

    export let autoplay: boolean = false;
    export let loop: boolean = false;
    export let muted: boolean = false;
    export let preload: boolean = true;
    export let responsive: boolean = true;

    export let title: string = 'Post video';

    let className: Props['class'] = undefined;
    export { className as class };

    $: src =
        `https://iframe.mediadelivery.net/embed/${PUBLIC_LIBRARY_ID}/${videoId}` +
        `?autoplay=${autoplay}` +
        `&loop=${loop}` +
        `&muted=${muted}` +
        `&preload=${preload}` +
        `&responsive=${responsive}`;
</script>

<iframe
    {src}
    loading="lazy"
    class="h-full w-full rounded-lg border-0 bg-black {className}"
    allow="autoplay;encrypted-media;picture-in-picture;"
    {title}
    allowfullscreen
></iframe>
