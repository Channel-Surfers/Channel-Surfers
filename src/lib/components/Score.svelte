<script lang="ts">
    import * as Tooltip from '$lib/shadcn/components/ui/tooltip/index';

    import ArrowUp from 'lucide-svelte/icons/arrow-up';
    import ArrowDown from 'lucide-svelte/icons/arrow-down';

    export let upvotes: number;
    export let downvotes: number;

    const humanise = (n: number): string => {
        if (n < 1000) {
            return `${n}`;
        } else if (n < 1_000_000) {
            return `${(n / 1000).toFixed(1)}k`;
        } else {
            return `${(n / 1_000_000).toFixed(1)}m`;
        }
    };

    $: clazz = upvotes > downvotes ? 'text-orange-600' : upvotes < downvotes ? 'text-cyan-600' : '';
</script>

<Tooltip.Root>
    <Tooltip.Trigger class={clazz}>
        <span class="small-caps">{humanise(Math.abs(upvotes - downvotes))}</span>
    </Tooltip.Trigger>
    <Tooltip.Content>
        <p class="small-caps flex flex-row items-center text-orange-600">
            <ArrowUp />
            {humanise(upvotes)}
        </p>
        <p class="small-caps flex flex-row items-center text-cyan-600">
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
