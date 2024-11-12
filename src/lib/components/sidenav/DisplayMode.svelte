<script lang="ts">
    import Sun from 'lucide-svelte/icons/sun';
    import Moon from 'lucide-svelte/icons/moon';

    import { themes, colours, type Theme } from '$lib/types';
    import { selectedTheme } from '$lib/stores';

    import { resetMode, setMode } from 'mode-watcher';
    import * as DropdownMenu from '$lib/shadcn/components/ui/dropdown-menu/index.js';
    import { Button } from '$lib/shadcn/components/ui/button/index.js';
    import { Circle, MonitorCog } from 'lucide-svelte';
    import dayjs from 'dayjs';

    let prevTheme: Theme | null = null;
    // TODO: Save this to user configuration so it's consistent across devices
    const setTheme = (theme: Theme) => {
        document.cookie = `theme=${theme}; SameSite=Strict; Expires=${dayjs().add(10, 'years')}`;
        $selectedTheme = theme;
        prevTheme = null;
    };

    const onHoverStart = (theme: Theme) => {
        if (!prevTheme) {
            prevTheme = $selectedTheme;
            $selectedTheme = theme;
        }
    };

    const onHoverEnd = () => {
        if (prevTheme) {
            $selectedTheme = prevTheme;
            prevTheme = null;
        }
    };
</script>

<svelte:head>
    {#each themes as theme}
        <!-- Preload the styles -->
        <link rel="stylesheet" href="/theme/{theme}.css" />
    {/each}
    <link rel="stylesheet" href="/theme/{$selectedTheme}.css" />
</svelte:head>

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
            <Sun class="mr-2 h-4 w-4" />
            Light
        </DropdownMenu.Item>
        <DropdownMenu.Item on:click={() => setMode('dark')}>
            <Moon class="mr-2 h-4 w-4" />
            Dark
        </DropdownMenu.Item>
        <DropdownMenu.Item on:click={() => resetMode()}>
            <MonitorCog class="mr-2 h-4 w-4" />
            System
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Colour Theme</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
                {#each themes as theme}
                    <DropdownMenu.Item
                        on:click={() => setTheme(theme)}
                        on:focusin={() => onHoverStart(theme)}
                        on:focusout={onHoverEnd}
                        data-highlighted={$selectedTheme === theme || undefined}
                    >
                        <Circle
                            fill="currentColor"
                            class="mr-2 h-4 w-4"
                            style="color: {colours[theme]}"
                        />
                        {theme.charAt(0).toUpperCase() + theme.substring(1)}
                    </DropdownMenu.Item>
                {/each}
            </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
    </DropdownMenu.Content>
</DropdownMenu.Root>
