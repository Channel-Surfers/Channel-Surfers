

<script lang='ts'>
    
    import * as Card from '$lib/shadcn/components/ui/card';
    import * as Avatar from '$lib/shadcn/components/ui/avatar/index';
    import { Skeleton } from '$lib/shadcn/components/ui/skeleton/index';
    import { Button } from '$lib/shadcn/components/ui/button';
    import { PAGE_SIZE } from '$lib';
    import * as DropdownMenu from '$lib/shadcn/components/ui/dropdown-menu';
    import { EllipsisVertical, Flag } from 'lucide-svelte';
    import * as Dialog from '$lib/shadcn/components/ui/dialog';
    import * as Select from '$lib/shadcn/components/ui/select';
    import { Label } from '$lib/shadcn/components/ui/label';
    import { Textarea } from '$lib/shadcn/components/ui/textarea';
    import { toast } from 'svelte-sonner';
    import { string } from 'valibot';
    import type { CommentData } from '$lib/types';
    import { Toggle } from '$lib/shadcn/components/ui/toggle';
    import Score from './Score.svelte';
    import ArrowUp from 'lucide-svelte/icons/arrow-up';
    import ArrowDown from 'lucide-svelte/icons/arrow-down';

    export let commentData : CommentData;
    let reportDialogOpen = false;
    let viewingReplies = true;
    let pageCount = 0;

    const loadMoreReplies = async (commentId: string, page: number) => {
        const res = await fetch(`/api/post/comments/${commentId}/replies?offset=${pageCount}`);
        const data = await res.json();
        
        // Ensure only unique replies are added
        const newReplies = data.filter((reply: { comment: { id: string; }; }) => 
            !commentData.children.some(existingReply => existingReply.comment.id === reply.comment.id)
        );


        // Append new replies to the current replies
        commentData.children = [...commentData.children, ...newReplies];
        console.log("Updated commentData.children:", commentData.children);
        pageCount += 1;  
    };

    const getMonthAndDate = (fullDate: string | Date) => { 
        const date = fullDate instanceof Date ? fullDate : new Date(fullDate);
        const monthName = date.toLocaleString('default', { month: 'long' });
        const day = date.getDate();

        return `${monthName} ${day}`;
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
                        <Select.Item value="community">Comment violates community guidelines</Select.Item>
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



<div class="comment-card p-4 ">
    <Card.Root>
        <div class="flex items-center">
            <!-- Avatar Image -->
            <Avatar.Root class="h-8 w-8 ml-4 mt-4 mb-2">
                <Avatar.Image src={commentData.user.profileImage || ''} alt={commentData.user.username} />
                <Avatar.Fallback>{commentData.user.username[0]?.toUpperCase() || '?'}</Avatar.Fallback>
            </Avatar.Root>
            
            <!-- Display Username -->
            <p class="h-4 w-full text-xl mb-1 ml-2">
                <a href="/u/{commentData.user.username}" class="decoration-slate-500 underline-offset-2 hover:underline">
                    u/{commentData.user.username}
                </a>
            </p>

            <div class="flex flex-row items-center">
                <Toggle
                    size="sm"
                    class="hover:text-upvote data-[state=on]:text-upvote"
                >
                    <ArrowUp />
                </Toggle>
                <Toggle
                    size="sm"
                    class="hover:text-downvote data-[state=on]:text-downvote"
                >
                    <ArrowDown />
                </Toggle>
            </div>

            <!-- Display Day Uploaded -->
            <p class="h-4 w-full text-xl text-right mb-2">
                {getMonthAndDate(commentData.comment.createdOn)}
            </p>

            <!-- Report Stuff -->
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                    <Button builders={[builder]} variant="ghost" size="icon" class = "mr-2 ml-2">
                        <EllipsisVertical />
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="mr-2">
                    <DropdownMenu.Item class="text-red-600" on:click={() => (reportDialogOpen = true)}>
                        <Flag fill="currentColor" class="mr-2 h-4 w-4" />
                        <span>Report</span>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

        </div>

        <!-- Display Comment itself -->
        <p class = "px-6 justify-start text-xl mb-4">{commentData.comment.content}</p>

        <!-- Toggle Replies Button -->
        {#if commentData.children && commentData.children.length > 0}
            <button class="toggle-btn ml-4 mb-2" on:click={toggleReplies}>
                {viewingReplies ? 'Hide Replies' : 'Show Replies'}
            </button>
        {/if}
        
        <!-- Display replies to current comment -->
        {#if viewingReplies}
            {#each commentData.children as reply}
                <svelte:self commentData={reply} />
            {/each}
        {/if}
            
        <!-- Load More Button -->
        {#if commentData.children && commentData.children.length >= PAGE_SIZE * pageCount}
            <div class="px-6 flex justify-end mb-4">
                <Button class="w-fit mb-2" variant="secondary" on:click={async() => loadMoreReplies(commentData.comment.id, pageCount)}>
                    Load More
                </Button>
            </div>
        {/if}



    </Card.Root>
</div>