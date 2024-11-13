<script lang="ts">
    import ActionTable from '$lib/components/tables/ActionTable.svelte';
    import { createActionTableProps, type ActionTableProps } from '$lib/components/tables/types';
    import type { PageServerData } from './$types';

    export let data: PageServerData;

    let props = createActionTableProps({
        columns: ['id', 'username'],
        data: data.users,
        actions: [],
    });
</script>

<ActionTable {props}></ActionTable>
