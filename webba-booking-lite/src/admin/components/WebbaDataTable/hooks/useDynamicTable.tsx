import {
    CellContext,
    ColumnDefTemplate,
    TableOptions,
    useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { getColumnVisibility } from '../utils'

interface DynamicTableOptions<T> {
    selectable?: boolean
    renderMenu?: ColumnDefTemplate<CellContext<T, any>>
    renderExpandableRow?: ColumnDefTemplate<CellContext<T, any>>
}

type WebbaDataTableOptions<T> = TableOptions<T> & DynamicTableOptions<T>

const createColumns = function <T>(tableOptions: WebbaDataTableOptions<T>) {
    const columns = [...tableOptions.columns]

    if (tableOptions.selectable) {
        columns.unshift({
            id: 'select',
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    onChange={row.getToggleSelectedHandler()}
                    checked={row.getIsSelected()}
                />
            ),
            header: ({ table }) => (
                <input
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

export const useDynamicTable = function <T>(
    options: TableOptions<T> & DynamicTableOptions<T>
) {
    const [rows, setRows] = useState(options.data)
    const columns = createColumns(options)
    const columnVisibility = getColumnVisibility(columns)

    const table = useReactTable({
        ...options,
        columns,
        data: rows,
        initialState: {
            columnVisibility,
        },
    })

    const addRow = (row: T) => {
        setRows((oldRows) => [...oldRows, row])
    }

    const updateRow = (id: number, update: Partial<T>) => {
        setRows((oldRows) =>
            oldRows.map((row, index) => {
                if (index === id) {
                    return {
                        ...row,
                        ...update,
                    }
                }

                return row
            })
        )
    }

    const deleteRow = (id: number) => {
        setRows((oldRows) => oldRows.filter((_, index) => index !== id))
    }

    return {
        table,
        addRow,
        updateRow,
        deleteRow,
    }
}
