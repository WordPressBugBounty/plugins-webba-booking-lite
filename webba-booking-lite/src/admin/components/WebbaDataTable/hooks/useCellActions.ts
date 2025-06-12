import { useCell } from '../context/CellProvider'
import { useTable } from '../context/TableProvider'
import { getCellActions } from '../helpers/getCellActions'

export const useCellActions = (collectionName: string) => {
    const cell = useCell()

    return getCellActions({
        cell,
        collectionName,
    })
}
