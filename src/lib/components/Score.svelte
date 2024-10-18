<script lang="ts">
    import * as Tooltip from '$lib/shadcn/components/ui/tooltip/index';

    import ArrowUp from 'lucide-svelte/icons/arrow-up';
    import ArrowDown from 'lucide-svelte/icons/arrow-down';

    export let upvotes: number;
    export let downvotes: number;
    export let side: 'top' | 'left' | 'bottom' | 'right' = 'left';

    const humanise = (n: number): string => {
        if (Math.abs(n) < 1000) {
            return `${n}`;
        } else if (Math.abs(n) < 1_000_000) {
            return `${(n / 1000).toFixed(1)}k`;
        } else {
            return `${(n / 1_000_000).toFixed(1)}m`;
        }
    };

    $: clazz = upvotes > downvotes ? 'text-upvote' : upvotes < downvotes ? 'text-downvote' : '';
</script>

<Tooltip.Root openDelay={5}>
    <Tooltip.Trigger class="{clazz} cursor-default">
        <span class="small-caps">{humanise(upvotes - downvotes)}</span>
    </Tooltip.Trigger>
    <Tooltip.Content {side}>
        <p class="small-caps flex flex-row items-center text-upvote">
            <ArrowUp />
            {humanise(upvotes)}
        </p>
        <p class="small-caps flex flex-row items-center text-downvote">
            <ArrowDown />
            {humanise(downvotes)}
        </p>
    </Tooltip.Content>
</Tooltip.Root>

<style>
    .small-caps {
        font-variant: small-caps;
    }
</style>
