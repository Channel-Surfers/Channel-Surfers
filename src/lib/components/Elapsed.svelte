<script lang="ts">
    import * as Tooltip from '$lib/shadcn/components/ui/tooltip';
    import { elapsedTime } from '$lib/util';

    export let date: Date | number;
    export let tooltipSide: 'top' | 'left' | 'bottom' | 'right' = 'top';

    const trueDate = new Date(date);

    const time = elapsedTime(trueDate);
    const dtf = Intl.DateTimeFormat(undefined, {
        dateStyle: 'long',
    });
</script>

<Tooltip.Root openDelay={5}>
    <Tooltip.Trigger class="cursor-default">
        <div class="text-sm text-slate-500">
            {time}
        </div>
    </Tooltip.Trigger>
    <Tooltip.Content side={tooltipSide}>
        <time datetime={trueDate.toISOString()}>
            {dtf.format(trueDate)}
        </time>
    </Tooltip.Content>
</Tooltip.Root>
