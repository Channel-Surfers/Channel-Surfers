<script lang="ts">
    import '../app.css';
    import { page } from '$app/stores';

    const error = $page.error!;
</script>

<h1>{$page.status}: {error.message}</h1>
