<script lang="ts">
    import * as Card from '$lib/shadcn/components/ui/card';
    import * as Avatar from '$lib/shadcn/components/ui/avatar/index';
    import { Button } from '$lib/shadcn/components/ui/button';
    import { PAGE_SIZE } from '$lib';
    import * as DropdownMenu from '$lib/shadcn/components/ui/dropdown-menu';
    import { EllipsisVertical, Flag } from 'lucide-svelte';
    import * as Dialog from '$lib/shadcn/components/ui/dialog';
    import * as Select from '$lib/shadcn/components/ui/select';
    import { Label } from '$lib/shadcn/components/ui/label';
    import { Textarea } from '$lib/shadcn/components/ui/textarea';
    import { toast } from 'svelte-sonner';
    import type { CommentData } from '$lib/types';
    import { Toggle } from '$lib/shadcn/components/ui/toggle';
    import Score from './Score.svelte';
    import ArrowUp from 'lucide-svelte/icons/arrow-up';
    import ArrowDown from 'lucide-svelte/icons/arrow-down';
    import { onMount } from 'svelte';
    export let commentData: CommentData;
    let reportDialogOpen = false;
    let viewingReplies = true;
    let pageCount = 0;
    let userVote: string | null;
    let downvotes = 0;
    let upvotes = 0;
    onMount(() => {
        // Destructuring to extract upvotes and downvotes
        const { upvotes: initialUpvotes, downvotes: initialDownvotes } = commentData.comment;
        upvotes = initialUpvotes;
        downvotes = initialDownvotes;
    });
    const loadMoreReplies = async (commentId: string) => {
        const res = await fetch(`/api/post/comments/${commentId}/replies?offset=${pageCount}`);
        const data = await res.json();
        const newReplies = data.filter(
            (reply: { comment: { id: string } }) =>
                !commentData.children.some(
                    (existingReply) => existingReply.comment.id === reply.comment.id
                )
        );
        commentData.children = [...commentData.children, ...newReplies];
        pageCount += 1;
    };
    const getMonthAndDate = (fullDate: string | Date) => {
        const date = fullDate instanceof Date ? fullDate : new Date(fullDate);
        const monthName = date.toLocaleString('default', { month: 'long' });
        const day = date.getDate();
        return `${monthName} ${day}`;
    };
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
        const res = await fetch(`/api/post/comments/${commentData.comment.id}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ vote: userVote }), // Send the vote direction as JSON
        });
        if (res.ok) {
            const ret = await res.json();
            ({ upvotes, downvotes } = ret);
        }
        // else {
        //     toast.error('Unexpected error while submitting vote');
        // }
    };
    const reportData = {
        commentId: commentData.comment.id,
        reason: undefined,
        details: '',
    };
    const submitReport = async () => {
        console.log(reportData);
        const res = await fetch(`/api/post/comments/${commentData.comment.id}/report`, {
            method: 'POST',
            body: JSON.stringify(reportData),
            headers: {
                'content-type': 'application/json',
            },
        });
        // await res.json();
        if (res.ok) {
            toast.success('Report submitted sucessfully!');
            reportDialogOpen = false;
        } else {
            toast.error('Unexpected error while submitting report.');
        }
    };
    function toggleReplies() {
        viewingReplies = !viewingReplies;
    }
</script>

<Dialog.Root bind:open={reportDialogOpen}>
    <Dialog.Portal>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>Reporting {commentData.user.username}</Dialog.Title>
                <Dialog.Description>This action cannot be undone</Dialog.Description>
            </Dialog.Header>
            <div class="grid gap-2 py-2">
                <Select.Root bind:selected={reportData.reason} portal={null}>
                    <Select.Trigger class="w-[300px]">
                        <Select.Value placeholder="What is the reason for the report?" />
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="community"
                            >Comment violates community guidelines</Select.Item
                        >
                        <Select.Item value="site">Comment violates site guidelines</Select.Item>
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

<div class="comment-card ml-4 p-4">
    <Card.Root>
        <div class="flex items-center">
            <!-- Avatar Image -->
            <Avatar.Root class="mb-2 ml-4 mt-4 h-8 w-8">
                <Avatar.Image
                    src={commentData.user.profileImage || ''}
                    alt={commentData.user.username}
                />
                <Avatar.Fallback
                    >{commentData.user.username[0]?.toUpperCase() || '?'}</Avatar.Fallback
                >
            </Avatar.Root>

            <!-- Display Username -->
            <p class="mb-1 ml-2 h-4 w-full text-xl">
                <a
                    href="/u/{commentData.user.username}"
                    class="decoration-slate-500 underline-offset-2 hover:underline"
                >
                    u/{commentData.user.username}
                </a>
            </p>

            <!-- Display Day Uploaded -->
            <p class="mb-2 h-4 w-full text-right text-xl">
                {getMonthAndDate(commentData.comment.createdOn)}
            </p>

            <!-- Report Stuff -->
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                    <Button builders={[builder]} variant="ghost" size="icon" class="ml-2 mr-2">
                        <EllipsisVertical />
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="mr-2">
                    <DropdownMenu.Item
                        class="text-red-600"
                        on:click={() => (reportDialogOpen = true)}
                    >
                        <Flag fill="currentColor" class="mr-2 h-4 w-4" />
                        <span>Report</span>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>

        <!-- Display Comment itself -->
        <p class="mb-4 justify-start px-6 text-xl">{commentData.comment.content}</p>

        <div class="mb-2 mr-4 flex flex-row items-center justify-end">
            <!-- Toggle Replies Button -->
            {#if commentData.children && commentData.children.length > 0}
                <button class="mr-2" on:click={toggleReplies}>
                    {viewingReplies ? 'Hide Replies' : 'Show Replies'}
                </button>
            {/if}

            <Toggle
                size="sm"
                class="hover:text-upvote data-[state=on]:text-upvote"
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
                pressed={userVote === 'DOWN'}
                on:click={() => vote('DOWN')}
            >
                <ArrowDown />
            </Toggle>
        </div>

        <!-- Display replies to current comment -->
        {#if viewingReplies}
            {#each commentData.children as reply}
                <svelte:self commentData={reply} />
            {/each}
        {/if}

        <!-- Load More Button -->
        {#if commentData.children && commentData.children.length >= PAGE_SIZE * pageCount}
            <div class="mb-4 flex justify-end px-6">
                <Button
                    class="mb-2 w-fit"
                    variant="secondary"
                    on:click={async () => loadMoreReplies(commentData.comment.id)}
                >
                    Load More
                </Button>
            </div>
        {/if}
    </Card.Root>
</div>
