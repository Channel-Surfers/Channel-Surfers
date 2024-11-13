<script lang="ts">
	import { Render, Subscribe, createRender, createTable } from "svelte-headless-table";
	import {
		addHiddenColumns,
		addPagination,
		addSelectedRows,
		addSortBy,
		addTableFilter,
	} from "svelte-headless-table/plugins";
	import { readable } from "svelte/store";
	import ArrowUpDown from "lucide-svelte/icons/arrow-up-down";
	import ChevronDown from "lucide-svelte/icons/chevron-down";
	import DataTableCheckbox from "$lib/components/settings/BlockedUserData/BlockedUserDataTableCheckbox.svelte";
	import * as Table from "$lib/shadcn/components/ui/table";
	import { Button } from "$lib/shadcn/components/ui/button";
	import * as DropdownMenu from "$lib/shadcn/components/ui/dropdown-menu";
	import { cn } from "$lib/util.ts";
	import { Input } from "$lib/shadcn/components/ui/input";
    import { toast } from "svelte-sonner";

    export let users;

	type blockedUser = {
    id: string;
    role: "USER" | "MODERATOR" | "ADMIN" | "SUPER";
    username: string;
    profileImage: string | null;
    createdOn: Date;
    updatedOn: Date;
    discordId: bigint | null;
    githubId: number | null;
    followers: number;
    following: number;
};

	let data: blockedUser[] = users

	const table = createTable(readable(data), {
		sort: addSortBy({ disableMultiSort: true }),
		page: addPagination(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.includes(filterValue),
		}),
		select: addSelectedRows(),
		hide: addHiddenColumns(),
	});

	const columns = table.createColumns([
		table.column({
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(DataTableCheckbox, {
					checked: allPageRowsSelected,
				});
			},
			accessor: "id",
			cell: ({ row }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);

				return createRender(DataTableCheckbox, {
					checked: isSelected,
				});
			},
			plugins: {
				sort: {
					disable: true,
				},
				filter: {
					exclude: true,
				},
			},
		}),

		table.column({
			header: "User",
			accessor: "username",
			cell: ({ value }) => value.toLowerCase(),
			plugins: {
				filter: {
					getFilterValue(value) {
						return value.toLowerCase();
					},
				},
			},
		}),
		
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, flatColumns, pluginStates, rows } =
		table.createViewModel(columns);

	const { sortKeys } = pluginStates.sort;

	const { hiddenColumnIds } = pluginStates.hide;
	const ids = flatColumns.map((c) => c.id);
	let hideForId = Object.fromEntries(ids.map((id) => [id, true]));

	$: {
		$hiddenColumnIds = Object.entries(hideForId)
		.filter(([, hide]) => !hide)
		.map(([id]) => id);
}

	const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;
	const { filterValue } = pluginStates.filter;

	const { selectedDataIds } = pluginStates.select;

	const hideableCols = ["blocked", "user", "amount"];
	
	const selected = async () => {
		const indexes = Object.keys($selectedDataIds).map(i => users[i].id)
		return indexes
		}

	const unblock = async () => {
		const usersUnblock = await selected();
        try {
            const res = await fetch(`/api/settings/block`, {
                method: 'DELETE',
				body: JSON.stringify(usersUnblock),
            	headers: {
                'content-type': 'application/json',
            },
            });
			data = data.filter(u => !usersUnblock.includes(u.id))
			if (res.ok) {
				toast.success("Unblocked users succesfully")
			}
            if (!res.ok) {
                throw new Error(`Failed to unfollow user: ${await res.text()}`);
            }
        } catch (e) {
            console.error(e);
            toast.error(`Failed to block user`);
        }
    };

	const reload = async () => {
		data = users
	}
</script>

<div class="w-full">
	<div class="flex flex-row justify-between">
		<Input
			class="max-w-sm"
			placeholder="Filter users..."
			type="text"
			bind:value={$filterValue}
		/>
        <Button on:click={unblock}>
            Unblock
        </Button>
	</div>
	<div class="rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe
									attrs={cell.attrs()}
									let:attrs
									props={cell.props()}
									let:props
								>
									<Table.Head
										{...attrs}
										class={cn("[&:has([role=checkbox])]:pl-3")}
									>
										{#if cell.id === "username"}
											<Button variant="ghost" on:click={props.sort.toggle}>
												<Render of={cell.render()} />
												<ArrowUpDown
													class={cn(
														$sortKeys[0]?.id === cell.id &&
															"text-foreground",
														"ml-2 h-4 w-4"
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
						<Table.Row
							{...rowAttrs}
							data-state={$selectedDataIds[row.id] && "selected"}
						>
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs>
									<Table.Cell class="[&:has([role=checkbox])]:pl-3" {...attrs}>
											<Render of={cell.render()} />
									</Table.Cell>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 py-4">
		<div class="text-muted-foreground flex-1 text-sm">
			{Object.keys($selectedDataIds).length} of {$rows.length} row(s) selected.
		</div>
		<Button
			variant="outline"
			size="sm"
			on:click={() => ($pageIndex = $pageIndex - 1)}
			disabled={!$hasPreviousPage}>Previous</Button
		>
		<Button
			variant="outline"
			size="sm"
			disabled={!$hasNextPage}
			on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
		>
	</div>
</div>