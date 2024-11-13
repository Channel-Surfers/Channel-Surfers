<script lang="ts">
    import * as Card from "$lib/shadcn/components/ui/card";
    import Label from "$lib/shadcn/components/ui/label/label.svelte";
    import BlockedDataTable from "./BlockedUserData/BlockedUserDataTable.svelte";

    export let blocked;
</script>
<Card.Root>
    <Card.Header>
        <Card.Title>Blocked</Card.Title>
        <Card.Description>View your blocked channels and users here. Can be used to unblock them.</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-2">
        <div class="space-y-1">
            <Label for="blockedUsers">Blocked Users</Label>
            <BlockedDataTable users={blocked} />    
        </div>
    </Card.Content>
</Card.Root>