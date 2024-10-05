<script lang="ts">
    import type { getPostStatistics } from '$lib/server/services/content';
    import * as Card from '$lib/shadcn/components/ui/card';
    import Score from '../Score.svelte';

    export let stats: Awaited<ReturnType<typeof getPostStatistics>>;
</script>

<Card.Root>
    <Card.Content>
        <p>
            Today, Channel surfers posted {stats.numberOfPosts} posts to {stats.numberOfChannelsWithPosts}
            channels amassing {stats.numberOfUpvotes} upvotes and {stats.numberOfDownvotes} downvotes.
        </p>

        Site Score: <Score upvotes={stats.numberOfUpvotes} downvotes={stats.numberOfDownvotes} />
    </Card.Content>
</Card.Root>
