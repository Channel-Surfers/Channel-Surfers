<script lang="ts">
    import * as Tooltip from '$lib/shadcn/components/ui/tooltip';

    export let href: string;
    console.log($$props);
</script>

<Tooltip.Root openDelay={0}>
    <Tooltip.Trigger>
        <a {href}><slot /></a>
    </Tooltip.Trigger>
    <Tooltip.Content>
        {href}
    </Tooltip.Content>
</Tooltip.Root>
