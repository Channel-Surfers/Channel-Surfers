<script lang="ts">
    import { Button } from '$lib/shadcn/components/ui/button';
    import * as Card from '$lib/shadcn/components/ui/card';
</script>

<Card.Root class="m-auto w-96">
    <Card.Header>
        <Card.Title>Sign In</Card.Title>
        <Card.Description>Sign up or sign in with one of the following platforms</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-2">
        <Button href="/signin/discord" variant="secondary" class="w-full">Discord</Button>
        <Button href="/signin/github" variant="secondary" class="w-full">GitHub</Button>
    </Card.Content>
</Card.Root>
