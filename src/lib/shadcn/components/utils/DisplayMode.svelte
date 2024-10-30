<script lang="ts">
    import Sun from 'lucide-svelte/icons/sun';
    import Moon from 'lucide-svelte/icons/moon';

    import { resetMode, setMode } from 'mode-watcher';
    import * as DropdownMenu from '$lib/shadcn/components/ui/dropdown-menu/index.js';
    import { Button } from '$lib/shadcn/components/ui/button/index.js';
    import { MonitorCog } from 'lucide-svelte';
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger asChild let:builder>
        <Button builders={[builder]} variant="outline" size="icon">
            <Sun
                class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            />
            <Moon
                class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            />
            <span class="sr-only">Toggle theme</span>
        </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
        <DropdownMenu.Item on:click={() => setMode('light')}>
            <Sun class="size-5"/>
            Light
        </DropdownMenu.Item>
        <DropdownMenu.Item on:click={() => setMode('dark')}>
            <Moon class="size-5"/>
            Dark
        </DropdownMenu.Item>
        <DropdownMenu.Item on:click={() => resetMode()}>
            <MonitorCog class="size-5"/>
            System
        </DropdownMenu.Item>
    </DropdownMenu.Content>
</DropdownMenu.Root>
