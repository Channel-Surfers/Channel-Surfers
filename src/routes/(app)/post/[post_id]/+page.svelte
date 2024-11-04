<script lang="ts">
    import Player from '$lib/components/Player.svelte';
    import Score from '$lib/components/Score.svelte';
    import { AspectRatio } from '$lib/shadcn/components/ui/aspect-ratio';
    import { Badge } from '$lib/shadcn/components/ui/badge';
    import * as Card from '$lib/shadcn/components/ui/card';
    import { Toggle } from '$lib/shadcn/components/ui/toggle';

    import Markdown from 'svelte-exmarkdown';

    import ArrowUp from 'lucide-svelte/icons/arrow-up';
    import ArrowDown from 'lucide-svelte/icons/arrow-down';
    import UserChannel from '$lib/components/UserChannel.svelte';
    import { ScrollArea } from '$lib/shadcn/components/ui/scroll-area';
    import { Skeleton } from '$lib/shadcn/components/ui/skeleton';
    import { toast } from 'svelte-sonner';
    import { EllipsisVertical, Flag, Pencil, Trash2 } from 'lucide-svelte';
    import { Button } from '$lib/shadcn/components/ui/button';
    import * as DropdownMenu from '$lib/shadcn/components/ui/dropdown-menu';
    import * as Dialog from '$lib/shadcn/components/ui/dialog';
    import { gfmPlugin } from 'svelte-exmarkdown/gfm';
    import Elapsed from '$lib/components/Elapsed.svelte';
    import Confirm from '$lib/components/Confirm.svelte';
    import { goto } from '$app/navigation';

    export let data;

    let {
        userVote,
        post: { upvotes, downvotes },
    } = data;

    const vote = async (dir: 'UP' | 'DOWN') => {
        if (userVote === 'UP') {
            upvotes -= 1;
        } else if (userVote === 'DOWN') {
            downvotes -= 1;
        }

        if (userVote === dir) {
            userVote = null;
        } else {
            if (dir === 'UP') {
                upvotes += 1;
            } else {
                downvotes += 1;
            }
            userVote = dir;
        }

        const res = await fetch(`/api/post/${data.post.id}/vote`, {
            method: 'POST',
            body: `${userVote}`,
        });

        if (res.ok) {
            const ret = await res.json();
            ({ upvotes, downvotes, vote: userVote } = ret);
        } else {
            ({ userVote } = data);
            toast.error('Unexpected error while submitting vote');
        }
    };

    let confirmDelete: () => Promise<boolean>;
    const del = async () => {
        if (!(await confirmDelete())) return;
        const res = await fetch(`/api/post/${data.post.id}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            goto('/');
        } else {
            toast.error('Unexpected error while deleting post.');
        }
    };

    const mdPlugins = [gfmPlugin()];
</script>

<svelte:head>
    <title>{data.post.title.substring(0, 20)} | Channel Surfers</title>
</svelte:head>

<Confirm bind:confirm={confirmDelete}>
    <Dialog.Title>Are you sure you want to delete this post?</Dialog.Title>
    <Dialog.Description>This action cannot be undone</Dialog.Description>
</Confirm>

<ScrollArea class="flex h-full w-full flex-col px-4">
    <Card.Root class="mx-auto my-4 px-2 pt-2">
        <Card.Header class="px-6 py-2">
            <Card.Title class="flex flex-row">
                <h1 class="text-ellipse mt-3 w-full text-pretty">{data.post.title}</h1>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild let:builder>
                        <Button builders={[builder]} variant="ghost" size="icon">
                            <EllipsisVertical />
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                        {#if data.signedIn?.id === data.post.createdBy}
                            <DropdownMenu.Item href="/post/{data.post.id}/edit">
                                <Pencil class="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenu.Item>
                        {/if}
                        {#if data.canDelete}
                            <DropdownMenu.Item class="text-red-600" on:click={del}>
                                <Trash2 class="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenu.Item>
                        {/if}
                        <DropdownMenu.Item class="text-red-600">
                            <Flag fill="currentColor" class="mr-2 h-4 w-4" />
                            <span>Report</span>
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </Card.Title>
        </Card.Header>
        <Card.Content class="pt-0">
            <AspectRatio ratio={16 / 9}>
                <Player title={data.post.title} videoId={data.post.videoId} />
            </AspectRatio>
            <!-- Tags -->
            <div class="flex justify-between">
                <div class="flex max-w-full gap-1.5 overflow-scroll p-2">
                    {#each data.tags as tag}
                        <Badge style="background: {tag.color}">
                            {tag.name}
                        </Badge>
                    {/each}
                </div>
                <Elapsed date={data.post.createdOn} />
            </div>
            <!-- Buttons/Stats -->
            <div class="my-4 flex flex-row items-center items-center justify-between">
                <div class="w-2/5">
                    <UserChannel
                        poster={{
                            user: {
                                id: data.user.id,
                                name: data.user.username,
                                avatar: data.user.profileImage || undefined,
                            },
                            channel: {
                                name: data.channel.name,
                                id: data.channel.id,
                                private: data.privateChannel,
                            },
                        }}
                    />
                </div>
                <div class="flex flex-row items-center">
                    <Toggle
                        size="sm"
                        class="hover:text-upvote data-[state=on]:text-upvote"
                        disabled={!data.signedIn}
                        pressed={userVote === 'UP'}
                        on:click={() => vote('UP')}
                    >
                        <ArrowUp />
                    </Toggle>
                    <span class="w-8 text-center">
                        <Score side="top" {upvotes} {downvotes} />
                    </span>
                    <Toggle
                        size="sm"
                        class="hover:text-downvote data-[state=on]:text-downvote"
                        disabled={!data.signedIn}
                        pressed={userVote === 'DOWN'}
                        on:click={() => vote('DOWN')}
                    >
                        <ArrowDown />
                    </Toggle>
                </div>
            </div>

            <!-- Description -->
            {#if data.post.description}
                <p class="markdown">
                    <Markdown md={data.post.description} plugins={mdPlugins} />
                </p>
            {/if}
        </Card.Content>
    </Card.Root>

    <Card.Root class="mx-auto my-4 p-2">
        <Card.Header class="px-6">
            <Card.Title>Comments</Card.Title>
        </Card.Header>
        <Card.Content>
            <Skeleton class="mt-2 h-5 w-2/3" />
        </Card.Content>
    </Card.Root>
</ScrollArea>

<style>
    .markdown :global(h1) {
        font-size: 1.2em;
        font-weight: bold;
    }

    .markdown :global(a) {
        color: blue;
        text-decoration: underline;
    }
</style>
