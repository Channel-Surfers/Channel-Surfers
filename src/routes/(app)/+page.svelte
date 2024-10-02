<script lang="ts">
    import { Either } from 'effect';
    import Post from '$lib/components/Post.svelte';

    export let data;
</script>

<svelte:head>
    <title>Channel Surfers</title>
</svelte:head>
<h1>Welcome to Channel Surfers</h1>

{#if !Either.isLeft(data.channels)}
    <p>retrieved {data.channels.length} channels successfully</p>
{:else}
    <p>retrieved no channels due to error</p>
{/if}

<p>
    Visit <a class="text-blue-700" href="https://github.com/Channel-Surfers/Channel-Surfers/wiki"
        >the Wiki</a
    > to read the documentation
</p>

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
