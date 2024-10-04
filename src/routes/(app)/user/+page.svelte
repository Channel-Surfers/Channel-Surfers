<script lang="ts">
    import { Button } from '$lib/shadcn/components/ui/button';

    export let data;
</script>

<h1>Hello {data.username}</h1>

<Button href="/signout">Sign out</Button>
