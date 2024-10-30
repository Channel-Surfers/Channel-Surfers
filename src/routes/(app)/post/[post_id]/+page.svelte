<script lang="ts">
    import Player from '$lib/components/Player.svelte';
    import Score from '$lib/components/Score.svelte';
    import { AspectRatio } from '$lib/shadcn/components/ui/aspect-ratio';
    import { Badge } from '$lib/shadcn/components/ui/badge';
    import * as Card from '$lib/shadcn/components/ui/card';
    import { Toggle } from '$lib/shadcn/components/ui/toggle';

    import ArrowUp from 'lucide-svelte/icons/arrow-up';
    import ArrowDown from 'lucide-svelte/icons/arrow-down';
    import UserChannel from '$lib/components/UserChannel.svelte';
    import { ScrollArea } from '$lib/shadcn/components/ui/scroll-area';
    import { Skeleton } from '$lib/shadcn/components/ui/skeleton';
    import { toast } from 'svelte-sonner';
    import { EllipsisVertical, Flag } from 'lucide-svelte';
    import { Button } from '$lib/shadcn/components/ui/button';
    import * as DropdownMenu from '$lib/shadcn/components/ui/dropdown-menu';
    import { gfmPlugin } from 'svelte-exmarkdown/gfm';
    import Elapsed from '$lib/components/Elapsed.svelte';
    import Markdown from '$lib/components/Markdown.svelte';

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
            upvotes = ret.upvotes;
            downvotes = ret.downvotes;
            userVote = ret.vote;
        } else {
            userVote = data.userVote;
            toast.error('Unexpected error while submitting vote');
        }
    };

</script>

<svelte:head>
    <title>{data.post.title.substring(0, 20)} | Channel Surfers</title>
</svelte:head>

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
                                private: data.private_channel,
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
                <Markdown md={data.post.description} />
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
