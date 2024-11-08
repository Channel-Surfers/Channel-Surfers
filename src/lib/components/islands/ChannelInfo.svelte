<script lang="ts">
    import type { ChannelInfo } from '$lib/server/services/channels';
    import * as Avatar from '$lib/shadcn/components/ui/avatar/index';
    import Button from '$lib/shadcn/components/ui/button/button.svelte';
    import * as Card from '$lib/shadcn/components/ui/card';
    import ScrollArea from '$lib/shadcn/components/ui/scroll-area/scroll-area.svelte';
    import Separator from '$lib/shadcn/components/ui/separator/separator.svelte';

    export let channel: ChannelInfo;
    export let signedIn: boolean;
    export let isPrivate: boolean = false;
    export let isSubscribed: boolean = false;

    let expandGuidelines = false;
</script>

<Card.Root>
    <Card.Header>
        <div class="flex flex-row items-center justify-between">
            <Avatar.Root class="h-12 w-12">
                <Avatar.Image src={channel.icon || ''} alt={channel.name} />
                <Avatar.Fallback class="font-bold">
                    {channel.name[0]?.toUpperCase() || '?'}
                </Avatar.Fallback>
            </Avatar.Root>
            <h1 class="text-xl font-bold">c/{channel.name}</h1>
        </div>
    </Card.Header>
    <Card.Content>
        <p>{channel.description}</p>
        {#if isPrivate}
            <Button class="mt-2 w-full" disabled={!signedIn}>Leave</Button>
        {:else if isSubscribed}
            <Button type="submit" variant="destructive" class="mt-2 w-full" disabled={!signedIn}
                >Unsubscribe</Button
            >
        {:else}
            <Button type="submit" class="mt-2 w-full" disabled={!signedIn}>Subscribe</Button>
        {/if}
    </Card.Content>
    {#if channel.guidelines}
        <Card.Footer>
            {#if expandGuidelines}
                <Card.Root class="w-full">
                    <Card.Content>
                        <h4 class="mb-4 text-sm font-medium leading-none">Guidelines</h4>
                        <ScrollArea class="h-24">
                            <div class="p-4">
                                {#each channel.guidelines.split('\n') as rule, i}
                                    <div class="text-sm">
                                        {i + 1}. {rule}
                                    </div>
                                    <Separator class="my-2" />
                                {/each}
                            </div>
                        </ScrollArea>
                        <Button
                            variant="secondary"
                            on:click={() => {
                                expandGuidelines = false;
                            }}>Close</Button
                        >
                    </Card.Content>
                </Card.Root>
            {:else}
                <Button
                    variant="secondary"
                    on:click={() => {
                        expandGuidelines = true;
                    }}>View Guidelines</Button
                >
            {/if}
        </Card.Footer>
    {/if}
</Card.Root>
