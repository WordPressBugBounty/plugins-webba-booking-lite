import { flexRender, Row } from '@tanstack/react-table'

interface Props {
    row: Row<any>
}

export const ExpandedData = ({ row }: Props) => {
    const expandable = row.getAllCells().find((cell) => {
        const meta = cell.column.columnDef.meta as any
        return meta?.expandable
    })

    if (!expandable) return null

    return flexRender(expandable.column.columnDef.cell, expandable.getContext())
}
