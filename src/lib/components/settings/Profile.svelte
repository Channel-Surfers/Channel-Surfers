<script lang="ts">
    import * as Avatar from '$lib/shadcn/components/ui/avatar';
    import Button from "$lib/shadcn/components/ui/button/button.svelte";
    import * as Card from "$lib/shadcn/components/ui/card";
    import Input from "$lib/shadcn/components/ui/input/input.svelte";
    import Label from "$lib/shadcn/components/ui/label/label.svelte";
    import Skeleton from "$lib/shadcn/components/ui/skeleton/skeleton.svelte";

    export let userInfo;
    
    const userUpdate = {
        username: userInfo.username,
        bio: "N/A",
    }

    const saveChanges = async () => {
        console.log(userUpdate.username)
        console.log(userUpdate.bio)
        userUpdate.username=''
        userUpdate.bio=''
    }
</script>
<Card.Root>
    <Card.Header>
        <Card.Title>Profile</Card.Title>
        <Card.Description>Make changes to your profile here.</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-2">
        <div class="space-y-1">
            <Label for="username">Username</Label>
            <Input id="username" placeholder="Username" bind:value={userUpdate.username}/>
        </div>
        <div class="space-y-1">
            <Label for="bio">Bio</Label>
            <Input id="bio" placeholder="Biography" disabled bind:value={userUpdate.bio}/>
        </div>
        <div class="space-y-1">
            <form class="w-full">
                <Label for="pfp" aria-required>Profile Picture</Label>
                <Input name="pfp" disabled type="file" />
            </form>
        </div>
    </Card.Content> 
    <Card.Root class="m-6">
        <div class="flex flex-row justify-between">
            <div class="flex flex-row items-center space-x-4">
                    <Avatar.Root class="h-12 w-12">
                        <Avatar.Image src={userInfo.profileImage || ''} alt={userInfo.username} />
                        <Avatar.Fallback class="font-bold">
                            {userInfo.username[0]?.toUpperCase() || '?'}
                        </Avatar.Fallback>
                    </Avatar.Root>
                    <h1 class="text-xl font-bold">u/{userUpdate.username}</h1>
    </Card.Root>
    <Card.Footer class="justify-end">
        <Button type="submit" on:click={saveChanges}>Save Changes</Button>
    </Card.Footer>
</Card.Root>
