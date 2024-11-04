<script>
    import * as Card from "$lib/shadcn/components/ui/card";
    import Label from "$lib/shadcn/components/ui/label/label.svelte";

</script>
<Card.Root>
    <Card.Header>
        <Card.Title>Blocked</Card.Title>
        <Card.Description>View your blocked channels and users here. Can be used to unblock them.</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-2">
        <div class="space-y-1">
            <Label for="blockedUsers">Blocked Users</Label>
            data table here
        </div>
        <div class="space-y-1">
            <Label for="blockedChannels">Blocked Channels</Label>
            data table here
        </div>
    </Card.Content>
</Card.Root>