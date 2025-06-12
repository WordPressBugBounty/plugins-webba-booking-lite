import { type Table } from '@tanstack/react-table'

export interface IBulkActionsProps {
    onDeleteSelected?: () => void
    collectionName?: string
}

export interface ITableMobileProps {
    table: Table<any>
}
