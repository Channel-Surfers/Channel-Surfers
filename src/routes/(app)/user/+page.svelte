<script lang="ts">
	import { enhance } from "$app/forms";

    export let data;
</script>

<h1>Hello { data.username }</h1>

<form method="post" use:enhance>
    <button>Sign out</button>
</form>
