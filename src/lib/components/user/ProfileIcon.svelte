<script lang="ts">
    import Settings from 'lucide-svelte/icons/settings';
    import UserIcon from 'lucide-svelte/icons/user';
    import LogOut from 'lucide-svelte/icons/log-out';
    import LogIn from 'lucide-svelte/icons/log-in';

    import * as Avatar from '$lib/shadcn/components/ui/avatar';
    import * as DropdownMenu from '$lib/shadcn/components/ui/dropdown-menu';

    export let user;
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        <Avatar.Root>
            {#if user}
                <Avatar.Image src={user.profileImage} alt="{user.username}'s profile" />
            {:else}
                <Avatar.Image></Avatar.Image>
            {/if}
            <Avatar.Fallback><UserIcon /></Avatar.Fallback>
        </Avatar.Root>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="w-56">
        {#if user}
            <DropdownMenu.Item href="/settings">
                <Settings class="mr-2 h-4 w-4" />
                <span>Settings</span>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item href="/signout">
                <LogOut class="mr-2 h-4 w-4" />
                <span>Sign out</span>
            </DropdownMenu.Item>
        {:else}
            <DropdownMenu.Item href="/signin">
                <LogIn class="mr-2 h-4 w-4" />
                <span>Sign In</span>
            </DropdownMenu.Item>
        {/if}
    </DropdownMenu.Content>
</DropdownMenu.Root>
