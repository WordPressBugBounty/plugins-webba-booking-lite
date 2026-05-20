import { Cell, Table } from '@tanstack/react-table'
import { dispatch, select } from '@wordpress/data'
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

        if (collectionName === 'services' && update.categories !== undefined) {
            await syncConnectedTables(
                cell.row.original.id,
                update.categories,
                'service_categories',
                'list'
            )
        }

        const serviceExtras =
            update.extras !== undefined ? update.extras : update.service_extras
        if (collectionName === 'services' && serviceExtras !== undefined) {
            await syncConnectedTables(
                cell.row.original.id,
                serviceExtras,
                'extras',
                'services'
            )
        }

        if (collectionName === 'service_categories' && update.list !== undefined) {
            await syncConnectedTables(
                cell.row.original.id,
                update.list,
                'services',
                'categories'
            )
        }

        const extraServiceIds =
            update.services !== undefined ? update.services : update.extra_services
        if (collectionName === 'extras' && extraServiceIds !== undefined) {
            await syncConnectedTables(
                cell.row.original.id,
                extraServiceIds,
                'services',
                'extras'
            )
        }

        const extraUnitIds =
            update.units !== undefined ? update.units : update.extra_units
        if (collectionName === 'extras' && extraUnitIds !== undefined) {
            await syncConnectedTables(
                cell.row.original.id,
                extraUnitIds,
                'units',
                'extras'
            )
        }

        const unitExtras =
            update.extras !== undefined ? update.extras : update.unit_extras
        if (collectionName === 'units' && unitExtras !== undefined) {
            await syncConnectedTables(
                cell.row.original.id,
                unitExtras,
                'extras',
                'units'
            )
        }
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



const normalizeArrayField = (value: any): any[] => {
    if (typeof value === 'string') {
        try {
            value = JSON.parse(value)
        } catch {
            return []
        }
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return []
        }
        
        const keys = Object.keys(value)
        const isIndexed = keys.every((key, index) => key === index.toString())
        
        if (!isIndexed) {
            return Object.values(value)
        }
        
        return value
    }

    return []
}

export const syncConnectedTables = async (childId: number, valuesToEmbed: any[], connectedModel: string, connectedColumn: string) => {
    const { setItem } = dispatch(store)
    const connectedItems = select(store).getItems(connectedModel)
    
    if (!Array.isArray(connectedItems)) {
        return
    }

    const normalizedValuesToEmbed = normalizeArrayField(valuesToEmbed)
    const valuesToEmbedIds = normalizedValuesToEmbed.map((v: any) => String(v))

    for (const parentItem of connectedItems) {
        const currentParentValue = normalizeArrayField(parentItem[connectedColumn])
        const parentId = String(parentItem.id)
        
        const shouldHaveChildId = valuesToEmbedIds.includes(parentId)
        const hasChildId = currentParentValue.includes(String(childId)) || currentParentValue.includes(Number(childId))

        if (shouldHaveChildId && !hasChildId) {
            const updatedValue = [...currentParentValue, String(childId)]
            
            await setItem(connectedModel, {
                ...parentItem,
                [connectedColumn]: updatedValue,
            })
        } else if (!shouldHaveChildId && hasChildId) {
            const updatedValue = currentParentValue.filter(
                (v: any) => String(v) !== String(childId) && Number(v) !== Number(childId)
            ).map((v: any) => String(v))

            await setItem(connectedModel, {
                ...parentItem,
                [connectedColumn]: updatedValue,
            })
        }
    }
}