<script lang="ts">
    import * as Avatar from '$lib/shadcn/components/ui/avatar';
    import Button from '$lib/shadcn/components/ui/button/button.svelte';
    import * as Card from '$lib/shadcn/components/ui/card';
    import Input from '$lib/shadcn/components/ui/input/input.svelte';
    import Label from '$lib/shadcn/components/ui/label/label.svelte';
    import { toast } from 'svelte-sonner';

    export let userInfo;

    const userUpdate = {
        username: userInfo.username,
        bio: 'N/A',
    };

    const saveChanges = async () => {
        try {
            const res = await fetch(`/api/settings/update`, {
                method: 'PUT',
                body: JSON.stringify(userUpdate),
                headers: {
                    'content-type': 'application/json',
                },
            });
            if (res.ok) {
                toast.success('Update user succesfully');
            }
            if (!res.ok) {
                throw new Error(`Failed to update user: ${await res.text()}`);
            }
        } catch (e) {
            console.error(e);
            toast.error(`Failed to update user`);
        }
    };
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Profile</Card.Title>
        <Card.Description>Make changes to your profile here.</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-2">
        <div class="space-y-1">
            <Label for="username">Username</Label>
            <Input id="username" placeholder="Username" bind:value={userUpdate.username} />
        </div>
        <div class="space-y-1">
            <Label for="bio">Bio</Label>
            <Input id="bio" placeholder="Biography" disabled bind:value={userUpdate.bio} />
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
            </div>
        </div></Card.Root
    >
    <Card.Footer class="justify-end">
        <Button type="submit" on:click={saveChanges}>Save Changes</Button>
    </Card.Footer>
</Card.Root>
