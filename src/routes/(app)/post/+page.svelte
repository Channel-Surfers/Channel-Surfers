<script lang="ts">
    import * as Dialog from '$lib/shadcn/components/ui/dialog/index.js';
    import { Button, buttonVariants } from '$lib/shadcn/components/ui/button/index.js';
    import * as Card from '$lib/shadcn/components/ui/card/index.js';
    import { Checkbox } from '$lib/shadcn/components/ui/checkbox/index.js';
    import Input from '$lib/shadcn/components/ui/input/input.svelte';
    import Label from '$lib/shadcn/components/ui/label/label.svelte';
    import Textarea from '$lib/shadcn/components/ui/textarea/textarea.svelte';
    import { debounce } from '$lib/util';
    import type { MiniChannel } from '$lib/server/services/channels';
    import { CHANNEL_SEARCH_PAGE_SIZE } from '$lib';
    import ScrollArea from '$lib/shadcn/components/ui/scroll-area/scroll-area.svelte';
    import { toast } from 'svelte-sonner';
    import * as tus from 'tus-js-client';
    import { PUBLIC_LIBRARY_ID } from '$env/static/public';
    import Progress from '$lib/shadcn/components/ui/progress/progress.svelte';

    export let data;

    let { formState } = data;

    let channels: MiniChannel[] = [];
    let open = false;
    let searchChannelIsPrivate = false;
    let channelSearchPage = 0;
    let channelSearchQuery = '';
    let channelSearchError: string | null = null;
    let selectedChannel: MiniChannel | null = null;

    let upload: tus.Upload | null = null;
    let uploadProgress: number | null = null;

    $: canLoadMore = channels.length !== 0 && channels.length % CHANNEL_SEARCH_PAGE_SIZE === 0;

    const resetState = () => {
        channels = [];
        open = false;
        searchChannelIsPrivate = false;
        channelSearchPage = 0;
        channelSearchQuery = '';
        channelSearchError = null;
    };

    const handleInputUpdate = async (event: KeyboardEvent) => {
        const input = event.target as HTMLInputElement;
        if (!input) throw new Error('input does not exist');
        const query = input.value;

        channelSearchPage = 0;

        if (!query || query.length === 0) {
            channels = [];
            return;
        }
        channels = await searchChannels(query);
    };

    $: updateChannelPrivacy(searchChannelIsPrivate);
    const updateChannelPrivacy = async (_: boolean) => {
        channelSearchPage = 0;
        channelSearchError = null;
        channels = channelSearchQuery === '' ? [] : await searchChannels(channelSearchQuery);
    };

    const searchChannels = async (query: string) => {
        const params = new URLSearchParams({
            name: query,
            isPrivate: String(searchChannelIsPrivate),
            page: String(channelSearchPage),
        });

        const res = await fetch(`api/s/channels?${params}`);
        if (!res.ok) {
            console.error(await res.text());
            channelSearchError = 'failed to search';
            return [];
        } else {
            return await res.json();
        }
    };

    const loadMoreChannels = async () => {
        channelSearchPage++;
        const more = await searchChannels(channelSearchQuery);
        channels = channels.concat(more);
    };

    const selectChannel = (channel: MiniChannel) => {
        selectedChannel = channel;
        resetState();
    };

    const uploadVideo = async (event: SubmitEvent) => {
        if (!data.uploadKey || !data.expirationTime || !data.videoId) return;
        event.preventDefault();
        if (!event.target) throw new Error('Something went wrong');
        const formData = new FormData(event.target as HTMLFormElement);
        const videoFile = formData.get('video') as File;
        if (!videoFile) {
            toast.error('Please submit video');
            console.error("Something went wrong submitting video. Ensure you've provided one.");
            return;
        }

        upload = new tus.Upload(videoFile as File, {
            endpoint: 'https://video.bunnycdn.com/tusupload',
            retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000],
            headers: {
                AuthorizationSignature: data.uploadKey,
                AuthorizationExpire: data.expirationTime.toString(),
                VideoId: data.videoId,
                LibraryId: PUBLIC_LIBRARY_ID,
            },
            metadata: {
                filetype: videoFile.type,
                title: data.post.id,
            },
            onError: (error) => {
                toast.error(`upload failed (${error.message}). Retrying...`);
                console.error(error);
            },
            onProgress: (bytesUploaded, bytesTotal) => {
                uploadProgress = (bytesUploaded / bytesTotal) * 100;
            },
            onSuccess: async () => {
                // update post to be status=OK
                const res = await fetch(`/api/post/${data.post.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: 'OK' }),
                });

                if (!res.ok) {
                    toast.error('Something went wrong updating post status');
                    console.error('Something went wrong updating post status');
                }

                uploadProgress = 100;
                toast.success('Video uploaded!');

                formState = 'COMPLETE';
            },
        });
        upload.start();
        uploadProgress = 0;
    };

    const cancelUpload = async () => {
        if (upload) await upload.abort(true);
        uploadProgress = null;
        upload = null;
    };
</script>

{#if formState === 'METADATA'}
    <div class="m-auto grid min-h-full w-3/5 place-items-center">
        <form method="POST" action="?/create" class="w-full">
            <Label for={'title'} aria-required>Title</Label>

            <Input name="title" required />
            <Label for="description">Description</Label>
            <Textarea name="description" />
            <div class="flex items-center space-x-2">
                <Label class="my-2" aria-required>Channel:</Label>
                {#if selectedChannel}
                    <p>{selectedChannel.name}</p>
                {/if}
            </div>
            <Input class="hidden" name="channelId" value={selectedChannel?.id} />
            <div>
                <Dialog.Root bind:open>
                    <Dialog.Trigger
                        on:click={() => {
                            open = true;
                        }}
                        class={buttonVariants({ variant: 'outline' })}
                        >Select Channel</Dialog.Trigger
                    >
                    <Dialog.Content class="sm:max-w-[625px]">
                        <Dialog.Header>
                            <Dialog.Title>Select Channel</Dialog.Title>
                            <Dialog.Description>Select a channel</Dialog.Description>
                        </Dialog.Header>
                        <div class="flex space-x-2">
                            <Checkbox
                                id="terms"
                                bind:checked={searchChannelIsPrivate}
                                aria-labelledby="public-channel-label"
                            />
                            <Label id="public-channel-label">Private Channel</Label>
                        </div>
                        <Label>Search</Label>
                        <Input
                            placeholder="Channel search by name"
                            on:keyup={debounce(handleInputUpdate)}
                            bind:value={channelSearchQuery}
                        />

                        <Card.Root>
                            <Card.Content>
                                <div class="flex w-full flex-col space-y-2">
                                    <ScrollArea class="h-36 w-full space-y-2">
                                        {#each channels as channel}
                                            <div
                                                class="my-1 flex w-full flex-row justify-between pr-4"
                                            >
                                                <p>{channel.name}</p>
                                                <Button
                                                    type="submit"
                                                    on:click={() => selectChannel(channel)}
                                                    >Select</Button
                                                >
                                            </div>
                                        {:else}
                                            <p>No channels found</p>
                                        {/each}
                                    </ScrollArea>
                                    {#if canLoadMore}
                                        <Button on:click={loadMoreChannels}>Load More</Button>
                                    {/if}
                                    {#if channelSearchError}
                                        <p class="text-red-500">{channelSearchError}</p>
                                    {/if}
                                </div>
                            </Card.Content>
                        </Card.Root>
                    </Dialog.Content>
                </Dialog.Root>
            </div>
            <Button class="mt-2" type="submit">Create Post</Button>
        </form>
    </div>
{:else if formState === 'UPLOAD'}
    <div class="m-auto grid min-h-full w-3/5 place-items-center">
        {#if !uploadProgress}
            <form on:submit={uploadVideo} class="w-full">
                <Label for="video" aria-required>Upload Video File</Label>
                <Input name="video" type="file" required />
                <Button class="mt-2 w-full" type="submit">Upload</Button>
            </form>
        {:else}
            <div class="flex w-full flex-col space-y-2">
                <h1>Uploading</h1>
                <Progress value={uploadProgress} class="w-full"></Progress>
                <Button on:click={cancelUpload} variant="destructive">Cancel</Button>
            </div>
        {/if}
    </div>
{:else if formState === 'COMPLETE' && data.post}
    <div class="m-auto grid min-h-full w-3/5 place-items-center">
        <div>
            <p>Congratulations! Your post has been uploaded.</p>
            <Button class="w-full" href={`/post/${data.post.id}`}>View Post</Button>
        </div>
    </div>
{/if}
