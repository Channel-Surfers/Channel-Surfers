<script lang="ts">
    import Button from "$lib/shadcn/components/ui/button/button.svelte";
    import * as Card from "$lib/shadcn/components/ui/card";
    import Input from "$lib/shadcn/components/ui/input/input.svelte";
    import Label from "$lib/shadcn/components/ui/label/label.svelte";

    const userUpdate = {
        username: "Quentavius115",
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
            <Input id="bio" placeholder="Biography" bind:value={userUpdate.bio}/>
        </div>
        <div class="space-y-1">
            <form class="w-full">
                <Label for="pfp" aria-required>Profile Picture</Label>
                <Input name="pfp" disabled type="file" />
            </form>
        </div>
    </Card.Content> 
    <Card.Footer class="justify-end">
        <Button type="submit" on:click={saveChanges}>Save Changes</Button>
    </Card.Footer>
</Card.Root>