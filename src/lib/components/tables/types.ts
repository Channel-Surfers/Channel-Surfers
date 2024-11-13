import type { Icon } from 'lucide-svelte';
import type { ComponentType } from 'svelte';

export type TableAction<Row> = {
    icon: ComponentType<Icon> | null;
    enabled: () => boolean;
    action: (row: Row) => void;
};

export type ActionTableProps<Key extends string, Row extends Record<Key, any>> = {
    columns: Key[];
    data: Row[];
    actions?: TableAction<Row>[];
    selectable?: boolean;
    sortable?: boolean;
};

/**
 * Create props for `ActionTable` component. This
 * wrapper function allows for type inference and correctness
 * of column data
 */
export const createActionTableProps = <T extends string, V extends Record<T, any>>(
    props: ActionTableProps<T, V>
) => props;
