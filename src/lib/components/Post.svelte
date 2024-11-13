<script lang="ts">
    import { PUBLIC_PREVIEW_HOST } from '$env/static/public';

    import * as Card from '$lib/shadcn/components/ui/card';
    import * as DropdownMenu from '$lib/shadcn/components/ui/dropdown-menu';
    import * as Dialog from '$lib/shadcn/components/ui/dialog';
    import * as Select from '$lib/shadcn/components/ui/select';

    import { Label } from '$lib/shadcn/components/ui/label';
    import { Badge } from '$lib/shadcn/components/ui/badge';
    import { Button } from '$lib/shadcn/components/ui/button';
    import { Skeleton } from '$lib/shadcn/components/ui/skeleton';
    import { Toggle } from '$lib/shadcn/components/ui/toggle';

    import ArrowDown from 'lucide-svelte/icons/arrow-down';
    import ArrowUp from 'lucide-svelte/icons/arrow-up';
    import Play from 'lucide-svelte/icons/play';
    import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
    import Pencil from 'lucide-svelte/icons/pencil';
    import Trash2 from 'lucide-svelte/icons/trash-2';

    import Score from './Score.svelte';
    import UserChannel from './UserChannel.svelte';
    import Player from './Player.svelte';
    import Elapsed from './Elapsed.svelte';

    import type { PostData } from '$lib/types';
    import { toast } from 'svelte-sonner';
    import Textarea from '$lib/shadcn/components/ui/textarea/textarea.svelte';
    import { Flag, Share2 } from 'lucide-svelte';
    import type { User } from '$lib/server/db/users.sql';
    import Confirm from './Confirm.svelte';
    import { createEventDispatcher } from 'svelte';

    export let post: PostData | undefined = undefined;
    export let playingVideo: boolean = false;
    export let signedIn: User = false;

    const dispatch = createEventDispatcher();

    let { userVote, upvotes, downvotes } = post || { userVote: null, upvotes: 0, downvotes: 0 };
    let reportDialogOpen = false;

    const vote = async (dir: 'UP' | 'DOWN') => {
        if (!post) return;

        const resetUserVote = userVote;
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

        const res = await fetch(`/api/post/${post.id}/vote`, {
            method: 'POST',
            body: `${userVote}`,
        });

        if (res.ok) {
            const ret = await res.json();
            ({ upvotes, downvotes } = ret);
            userVote = ret.vote;
        } else {
            userVote = resetUserVote;
            toast.error('Unexpected error while submitting vote');
        }
    };

    const reportData = {
        reason: undefined,
        details: '',
    };

    const submitReport = async () => {
        console.log(reportData);
        const res = await fetch(`/api/post/${post!.id}/report`, {
            method: 'POST',
            body: JSON.stringify(reportData),
            headers: {
                'content-type': 'application/json',
            },
        });

        if (res.ok) {
            toast.success('Report submitted sucessfully!');
            reportDialogOpen = false;
        } else {
            toast.error('Unexpected error while submitting report.');
        }
    };

    let confirmDelete: () => Promise<boolean>;
    const deletePost = async () => {
        if (!post) return;
        if (!(await confirmDelete())) return;
        const res = await fetch(`/api/post/${post.id}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            dispatch('delete');
            toast.success('Post deleted successfully.');
        } else {
            toast.error('Unexpected error while deleting post.');
        }
    };

    let hovering = false;
    $: src = post
        ? `${PUBLIC_PREVIEW_HOST}/${post.videoId}/${hovering ? 'preview.webp' : 'thumbnail.jpg'}`
        : '';
</script>

<Confirm bind:confirm={confirmDelete}>
    <Dialog.Title>Are you sure you want to delete this post?</Dialog.Title>
    <Dialog.Description>This action cannot be undone</Dialog.Description>
</Confirm>

<Dialog.Root bind:open={reportDialogOpen}>
    <Dialog.Portal>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>Report Form</Dialog.Title>
                <Dialog.Description>This action cannot be undone</Dialog.Description>
            </Dialog.Header>
            <div class="grid gap-2 py-2">
                <Select.Root bind:selected={reportData.reason} portal={null}>
                    <Select.Trigger class="w-[300px]">
                        <Select.Value placeholder="What is the reason for the report?" />
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="community">
                            Post violates community guidelines
                        </Select.Item>
                        <Select.Item value="site">Post violates site guidelines</Select.Item>
                    </Select.Content>
                </Select.Root>
            </div>
            <div class="grid gap-2 py-2">
                <Label for="Report details" class="text-left">Report Details</Label>
                <Textarea
                    placeholder="Add details here"
                    name="details"
                    bind:value={reportData.details}
                    class="col-span-3"
                />
            </div>
            <Dialog.Footer>
                <Button type="submit" on:click={submitReport}>Submit Report</Button>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>

<Card.Root class="m-auto my-3 flex w-[800px] flex-row p-2">
    <div
        class="relative m-auto h-full w-2/5"
        on:mouseenter={() => (hovering = true)}
        on:mouseleave={() => (hovering = false)}
        role="img"
    >
        {#if !post}
            <Skeleton class="h-full w-full rounded-lg" />
        {:else if playingVideo}
            <Player videoId={post.videoId} autoplay />
        {:else}
            <button
                class="absolute flex h-full w-full items-center justify-center rounded-lg bg-black/50"
                class:hidden={!hovering}
                on:click={() => (playingVideo = true)}
            >
                <Play fill="white" color="white" size="48" />
            </button>
            <img {src} alt="" class="h-full w-full rounded-lg" />
        {/if}
    </div>
    <div class="flex h-full w-2/5 grow flex-col justify-between">
        <Card.Header class="p-2 pl-6">
            <Card.Title class="space-y-1">
                <div class="mb-2">
                    <UserChannel poster={post ? post.poster : undefined} />
                </div>
                {#if post}
                    <h1 class="text-ellipse w-full grow text-pretty">
                        <a href="/post/{post.id}">{post.title}</a>
                    </h1>
                {:else}
                    <Skeleton class="h-5 w-full" />
                    <Skeleton class="h-5 w-2/3" />
                {/if}
            </Card.Title>
        </Card.Header>
        <Card.Footer class="mt-2 flex flex-col items-start gap-1.5 px-6 pb-2">
            <div class="mt-0 pt-0 text-sm text-slate-500">
                {#if post}
                    <Elapsed date={post.createdOn} />
                {/if}
            </div>
            <div class="flex gap-1.5">
                {#if post}
                    {#if post.tags}
                        {#each post.tags as badge}
                            <Badge>{badge}</Badge>
                        {/each}
                    {/if}
                {:else}
                    <Skeleton class="h-6 w-[50px] rounded-full" />
                    <Skeleton class="h-6 w-[50px] rounded-full" />
                    <Skeleton class="h-6 w-[50px] rounded-full" />
                {/if}
            </div>
        </Card.Footer>
    </div>
    <div class="flex flex-col items-center justify-between justify-self-end">
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild let:builder>
                <Button builders={[builder]} variant="ghost" size="icon" disabled={!post}>
                    <div class:animate-pulse={!post}>
                        <EllipsisVertical class="h-5 w-5" />
                    </div>
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content class="w-56">
                <DropdownMenu.Item>
                    <Share2 fill="currentColor" class="mr-2 h-4 w-4" />
                    <span>Share</span>
                </DropdownMenu.Item>
                {#if post && signedIn.id === post.poster.user.id}
                    <DropdownMenu.Item href="/post/{post.id}/edit">
                        <Pencil class="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item class="text-red-600" on:click={deletePost}>
                        <Trash2 class="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenu.Item>
                {/if}
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                    class="text-red-600"
                    on:click={() => (reportDialogOpen = true)}
                    disabled={!signedIn}
                >
                    <Flag fill="currentColor" class="mr-2 h-4 w-4" />
                    <span>Report</span>
                </DropdownMenu.Item>
                <DropdownMenu.Group></DropdownMenu.Group>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
        <div class="flex flex-col items-center">
            <Toggle
                size="sm"
                disabled={!post || !signedIn}
                class="hover:text-upvote data-[state=on]:text-upvote"
                pressed={userVote === 'UP'}
                on:click={() => vote('UP')}
            >
                <div class:animate-pulse={!post}>
                    <ArrowUp />
                </div>
            </Toggle>
            {#if post}
                <Score {upvotes} {downvotes} />
            {:else}
                <Skeleton class="h-6 w-6 rounded-full" />
            {/if}
            <Toggle
                size="sm"
                disabled={!post || !signedIn}
                class="hover:text-downvote data-[state=on]:text-downvote"
                pressed={userVote === 'DOWN'}
                on:click={() => vote('DOWN')}
            >
                <div class:animate-pulse={!post}>
                    <ArrowDown />
                </div>
            </Toggle>
        </div>
    </div>
</Card.Root>
