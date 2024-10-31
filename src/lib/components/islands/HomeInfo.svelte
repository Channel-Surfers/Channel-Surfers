<script lang="ts">
    import type { User } from '$lib/server/db/users.sql';
    import type { PostStatistics } from '$lib/server/services/content';
    import Button from '$lib/shadcn/components/ui/button/button.svelte';
    import * as Card from '$lib/shadcn/components/ui/card';
    import Score from '../Score.svelte';

    export let stats: PostStatistics;
    export let user: User | null = null;
</script>

<Card.Root>
    <Card.Content>
        <p>
            Today, Channel surfers posted {stats.numberOfPosts} posts to {stats.numberOfChannelsWithPosts}
            channels amassing {stats.numberOfUpvotes} upvotes and {stats.numberOfDownvotes} downvotes.
        </p>

        <div class="mt-2">
            Site Score: <Score
                upvotes={stats.numberOfUpvotes}
                downvotes={stats.numberOfDownvotes}
                side="bottom"
            />
        </div>

        {#if user}
            <Button class="mt-2 w-full" href="/post">Create Post</Button>
        {/if}
    </Card.Content>
</Card.Root>
