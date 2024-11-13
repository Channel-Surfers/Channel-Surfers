<script lang="ts" generics="T extends string, V extends Record<T, any>">
    import Button from '$lib/shadcn/components/ui/button/button.svelte';

    import { ArrowUpDown } from 'lucide-svelte';

    import ActionMenu from './ActionMenu.svelte';

    import DataTableCheckbox from './DataTableCheckbox.svelte';

    import { readable } from 'svelte/store';

    import * as Table from '$lib/shadcn/components/ui/table/index.js';
    import { createTable, createRender, Subscribe, Render } from 'svelte-headless-table';
    import {
        addHiddenColumns,
        addPagination,
        addSelectedRows,
        addSortBy,
        addTableFilter,
    } from 'svelte-headless-table/plugins';
    import { cn } from '$lib/shadcn/utils.js';
    import type { ActionTableProps } from './types';

    export let props: ActionTableProps<T, V>;

    const table = createTable(readable(props.data), {
        sort: addSortBy({ disableMultiSort: true }),
        page: addPagination(),
        filter: addTableFilter({
            fn: ({ filterValue, value }) => value.includes(filterValue),
        }),
        select: addSelectedRows(),
        hide: addHiddenColumns(),
    });

    const propertyCols = props.columns.map((c) =>
        table.column({
            header: c,
            accessor: c,
            cell: ({ value }) => value.toLowerCase(),
            plugins: {
                filter: {
                    getFilterValue(value: any) {
                        return value.toLowerCase();
                    },
                },
            },
        })
    );

    const columns = table.createColumns(
        (props.selectable
            ? [
                  table.column({
                      header: (_, { pluginStates }) => {
                          const { allPageRowsSelected } = pluginStates.select;
                          return createRender(DataTableCheckbox, {
                              checked: allPageRowsSelected,
                          });
                      },
                      accessor: 'id',
                      cell: ({ row }, { pluginStates }) => {
                          const { getRowState } = pluginStates.select;
                          const { isSelected } = getRowState(row);
                          return createRender(DataTableCheckbox, {
                              checked: isSelected,
                          });
                      },
                      plugins: {
                          sort: {
                              disable: !props.sortable,
                          },
                          filter: {
                              exclude: true,
                          },
                      },
                  }),
              ]
            : []
        ).concat([
            ...propertyCols,
            table.column({
                header: '',
                accessor: (row) => row,
                cell: (item) => {
                    return createRender(ActionMenu, {
                        actions: [],
                    });
                },
            }),
        ])
    );

    const { headerRows, pageRows, tableAttrs, tableBodyAttrs, flatColumns, pluginStates, rows } =
        table.createViewModel(columns);

    const { sortKeys } = pluginStates.sort;

    const { hiddenColumnIds } = pluginStates.hide;
    const ids = flatColumns.map((c) => c.id);
    let hideForId = Object.fromEntries(ids.map((id) => [id, true]));

    $: $hiddenColumnIds = Object.entries(hideForId)
        .filter(([, hide]) => !hide)
        .map(([id]) => id);

    const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;
    const { filterValue } = pluginStates.filter;

    const { selectedDataIds } = pluginStates.select;
</script>

<Table.Root {...$tableAttrs}>
    <Table.Header>
        {#each $headerRows as headerRow}
            <Subscribe rowAttrs={headerRow.attrs()}>
                <Table.Row>
                    {#each headerRow.cells as cell (cell.id)}
                        <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
                            <Table.Head {...attrs} class={cn('[&:has([role=checkbox])]:pl-3')}>
                                {#if cell.id === 'amount'}
                                    <div class="text-right font-medium">
                                        <Render of={cell.render()} />
                                    </div>
                                {:else if cell.id === 'email'}
                                    <Button variant="ghost" on:click={props.sort.toggle}>
                                        <Render of={cell.render()} />
                                        <ArrowUpDown
                                            class={cn(
                                                $sortKeys[0]?.id === cell.id && 'text-foreground',
                                                'ml-2 h-4 w-4'
                                            )}
                                        />
                                    </Button>
                                {:else}
                                    <Render of={cell.render()} />
                                {/if}
                            </Table.Head>
                        </Subscribe>
                    {/each}
                </Table.Row>
            </Subscribe>
        {/each}
    </Table.Header>
    <Table.Body {...$tableBodyAttrs}>
        {#each $pageRows as row (row.id)}
            <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
                <Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && 'selected'}>
                    {#each row.cells as cell (cell.id)}
                        <Subscribe attrs={cell.attrs()} let:attrs>
                            <Table.Cell class="[&:has([role=checkbox])]:pl-3" {...attrs}>
                                {#if cell.id === 'amount'}
                                    <div class="text-right font-medium">
                                        <Render of={cell.render()} />
                                    </div>
                                {:else if cell.id === 'status'}
                                    <div class="capitalize">
                                        <Render of={cell.render()} />
                                    </div>
                                {:else}
                                    <Render of={cell.render()} />
                                {/if}
                            </Table.Cell>
                        </Subscribe>
                    {/each}
                </Table.Row>
            </Subscribe>
        {/each}
    </Table.Body>
</Table.Root>
