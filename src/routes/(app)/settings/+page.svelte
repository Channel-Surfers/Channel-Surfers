<script lang="ts">
    import Blocked from '$lib/components/settings/Blocked.svelte';
    import Profile from '$lib/components/settings/Profile.svelte';
    import * as Tabs from '$lib/shadcn/components/ui/tabs';

    export let data;
</script>

<Tabs.Root class="p-2 pt-4">
    <Tabs.List class="flex grow flex-row">
        <Tabs.Trigger value="profile" class="flex grow flex-row">Profile</Tabs.Trigger>
        <Tabs.Trigger value="blocked" class="flex grow flex-row">Blocked</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="profile">
        <Profile userInfo={data.user} />
    </Tabs.Content>
    <Tabs.Content value="blocked">
        <Blocked blocked={data.blockedUser} />
    </Tabs.Content>
</Tabs.Root>
