<script>
    import Button from "$lib/shadcn/components/ui/button/button.svelte";
    import * as Card from "$lib/shadcn/components/ui/card";
    import Input from "$lib/shadcn/components/ui/input/input.svelte";
    import Label from "$lib/shadcn/components/ui/label/label.svelte";
    import * as Tabs from "$lib/shadcn/components/ui/tabs";
    import { Upload } from "lucide-svelte";

    export let data;


</script>
Settings
<Tabs.Root>
    <Tabs.List class="flex flex-row grow">
        <Tabs.Trigger value="profile" class="flex flex-row grow" >Profile</Tabs.Trigger>
        <Tabs.Trigger value="blocked"class="flex flex-row grow">Blocked</Tabs.Trigger>
        <Tabs.Trigger value="content" class="flex flex-row grow">Content</Tabs.Trigger>
        <Tabs.Trigger value="notifications" class="flex flex-row grow">Notifications</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="profile">
        <Card.Root>
            <Card.Header>
                <Card.Title>Profile</Card.Title>
                <Card.Description>Make changes to your profile here.</Card.Description>
            </Card.Header>
            <Card.Content class="space-y-2">
                <div class="space-y-1">
                    <Label for="username">Username</Label>
                    <Input id="username" placeholder={data.username}/>
                </div>
                <div class="space-y-1">
                    <Label for="bio">Bio</Label>
                    <Input id="bio"/>
                </div>
                <div class="space-y-1">
                    <Label for="pfp">Profile Picture</Label>
                    <Upload/>
                </div>
            </Card.Content> 
            <Card.Footer class="justify-end">
                <Button type="submit">Save Changes</Button>
            </Card.Footer>
        </Card.Root>
    </Tabs.Content>
    <Tabs.Content value="blocked">
        moneky
    </Tabs.Content>
    <Tabs.Content value="content">
        
    </Tabs.Content>
    <Tabs.Content value="notification">

    </Tabs.Content>
</Tabs.Root>