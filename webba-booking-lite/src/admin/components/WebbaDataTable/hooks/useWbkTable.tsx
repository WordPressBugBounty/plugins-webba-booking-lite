import {
    CellContext,
    ColumnDefTemplate,
    getCoreRowModel,
    getExpandedRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    Table,
    TableOptions,
    useReactTable,
} from '@tanstack/react-table'
import styles from '../Table.module.scss'
import { getColumnVisibility } from '../utils'

interface WebbaDataTableOptions<T>
    extends Omit<TableOptions<T>, 'getCoreRowModel' | 'getSortedRowModel'> {
    selectable?: boolean
    renderMenu?: ColumnDefTemplate<CellContext<T, any>>
    renderExpandableRow?: ColumnDefTemplate<CellContext<T, any>>
    isAdmin?: boolean
}

const createColumns = function <T>(tableOptions: WebbaDataTableOptions<T>) {
    const columns = [...tableOptions.columns]

    if (tableOptions.selectable && tableOptions?.isAdmin) {
        columns.unshift({
            id: 'select',
            cell: ({ row }) => (
                <input
                    className={styles.selectRowCheckbox}
                    type="checkbox"
                    onChange={row.getToggleSelectedHandler()}
                    checked={row.getIsSelected()}
                />
            ),
            header: ({ table }) => (
                <input
                    className={styles.selectAllCheckbox}
                    type="checkbox"
                    onChange={table.getToggleAllRowsSelectedHandler()}
                    checked={table.getIsAllRowsSelected()}
                />
            ),
        })
    }

    if (tableOptions.renderExpandableRow) {
        columns.push({
            id: 'expandable',
            cell: tableOptions.renderExpandableRow,
            meta: {
                expandable: true,
            },
        })
    }

    if (tableOptions.renderMenu) {
        columns.push({
            id: 'menu',
            cell: tableOptions.renderMenu,
        })
    }

    return columns
}

export const useWbkTable = function <T>(
    options: WebbaDataTableOptions<T>
): Table<T> {
    const columns = createColumns(options)
    const columnVisibility = getColumnVisibility(columns)
    const tableOptions: TableOptions<T> = {
        ...options,
        columns,
        initialState: {
            columnVisibility,
        },
        autoResetPageIndex: false,
        getRowCanExpand: () => !!options.renderExpandableRow,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    }

    return useReactTable(tableOptions)
}
