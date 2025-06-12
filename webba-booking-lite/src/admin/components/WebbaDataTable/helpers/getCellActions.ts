import { Cell, Table } from '@tanstack/react-table'
import { dispatch } from '@wordpress/data'
import { store } from '../../../../store/backend'

interface CellActionsParams {
    cell: Cell<any, any>
    collectionName: string
}

export const getCellActions = ({ cell, collectionName }: CellActionsParams) => {
    const { deleteItems, setItem, addItem, toggleBusy } = dispatch(store)

    const onDelete = async () => {
        await deleteItems(collectionName, [cell.row.original.id])
    }

    const onDuplicate = async () => {
        const update = {
            ...cell.row.original,
            name: `Copy of ${cell.row.original.name}`,
        }
        await addItem(collectionName, update)
    }

    const onSubmit = async (update: any) => {
        await setItem(collectionName, {
            ...update,
            id: cell.row.original.id,
        })
    }

    const onCancel = async () => {
        setItem('appointments', {
            ...cell.row.original,
            status: 'cancelled',
        })
    }

    return {
        onDelete,
        onDuplicate,
        onSubmit,
        onCancel,
    }
}
