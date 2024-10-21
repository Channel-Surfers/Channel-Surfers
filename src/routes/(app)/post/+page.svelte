<script lang="ts">
    import * as Command from '$lib/shadcn/components/ui/command/index.js';
    import * as Popover from '$lib/shadcn/components/ui/popover/index.js';
    import Check from 'lucide-svelte/icons/check';
    import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
    import { cn } from '$lib/shadcn/utils.js';
    import Button from '$lib/shadcn/components/ui/button/button.svelte';
    import { tick } from 'svelte';
    import Input from '$lib/shadcn/components/ui/input/input.svelte';
    import Label from '$lib/shadcn/components/ui/label/label.svelte';
    import Textarea from '$lib/shadcn/components/ui/textarea/textarea.svelte';

    export let data;

    let open = false;
    let value = '';

    $: selectedValue = data.channels.find((f) => f.name === value)?.name ?? 'Select a channel...';

    function closeAndFocusTrigger(triggerId: string) {
        open = false;
        tick().then(() => {
            document.getElementById(triggerId)?.focus();
        });
    }
</script>

<form class="m-auto w-3/5">
    <Label for={'title'} aria-required>Title</Label>
    <Input name={'title'} required />
    <Label for={'description'}>Description</Label>
    <Textarea name={'description'} />
    <Label>Channel</Label>
    <Popover.Root bind:open let:ids>
        <Popover.Trigger asChild let:builder>
            <Button
                builders={[builder]}
                variant="outline"
                role="combobox"
                aria-expanded={open}
                class="w-full justify-between"
            >
                {selectedValue}
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </Popover.Trigger>
        <Popover.Content class="p-0">
            <Command.Root>
                <Command.Input placeholder="Search channel..." />
                <Command.Empty>No channel found.</Command.Empty>
                <Command.Group>
                    {#each data.channels as channel}
                        <Command.Item
                            value={channel.name}
                            onSelect={(currentValue) => {
                                value = currentValue;
                                closeAndFocusTrigger(ids.trigger);
                            }}
                        >
                            <Check
                                class={cn(
                                    'mr-2 h-4 w-4',
                                    value !== channel.name && 'text-transparent'
                                )}
                            />
                            {channel.name}
                        </Command.Item>
                    {/each}
                </Command.Group>
            </Command.Root>
        </Popover.Content>
    </Popover.Root>
</form>
