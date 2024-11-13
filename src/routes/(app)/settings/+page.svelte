<script lang="ts">
    import Blocked from "$lib/components/settings/Blocked.svelte";
    import Profile from "$lib/components/settings/Profile.svelte";
    import * as Tabs from "$lib/shadcn/components/ui/tabs"; 

    export let data;
</script>

<Tabs.Root>
    <Tabs.List class="flex flex-row grow">
        <Tabs.Trigger value="profile" class="flex flex-row grow" >Profile</Tabs.Trigger>
        <Tabs.Trigger value="blocked"class="flex flex-row grow">Blocked</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="profile">
        <Profile userInfo={data.user}/>
    </Tabs.Content>
    <Tabs.Content value="blocked">
        <Blocked blocked={data.blockedUser}/>
    </Tabs.Content>
</Tabs.Root>