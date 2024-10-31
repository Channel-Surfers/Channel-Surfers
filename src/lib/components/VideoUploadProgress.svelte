<script lang="ts">
    import { Button } from '$lib/shadcn/components/ui/button/index.js';
    import * as Card from '$lib/shadcn/components/ui/card/index.js';
    import { Progress } from '$lib/shadcn/components/ui/progress/index.js';
    import { UploadIcon } from 'lucide-svelte';
    export let title: string;
    export let status: 'CREATE' | 'UPLOAD';
    export let cancel: () => void;
    export let progress: number;
</script>

<Card.Root class="w-[350px]">
    <Card.Header>
        <div class="flex flex-row justify-between">
            <UploadIcon />
            <Card.Title>{title}</Card.Title>
        </div>
        {#if status === 'CREATE'}
            <Card.Description>Initializing upload...</Card.Description>
        {:else if status === 'UPLOAD'}
            <Card.Description>Video upload in progress...</Card.Description>
        {/if}
    </Card.Header>
    <Card.Content>
        <Progress value={progress} />

        <p class="text-secondary-foreground">Please keep the page open</p>
    </Card.Content>
    <Card.Footer class="flex justify-between">
        <Button on:click={cancel} variant="destructive">Cancel</Button>
    </Card.Footer>
</Card.Root>
