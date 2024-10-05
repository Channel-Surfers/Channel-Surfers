<script lang="ts">
    import Post from '$lib/components/Post.svelte';

    export let data;
    // to silence linter
    $: console.log(data);
</script>

<svelte:head>
    <title>Channel Surfers</title>
</svelte:head>
<div class="flex flex-col">
    <Post
        post={{
            title: 'Look at this cute squirrel that I found while on a walk today',
            videoId: 'e0245338-7c04-4a6c-b44f-0e279a849cf5',
            user: { username: 'SomeN3rd', channel: 'awww' },
            badges: ['Squirrel', 'Animal', 'Nature'],
            upvotes: 32514,
            downvotes: 318,
        }}
    />
    <Post />
</div>
