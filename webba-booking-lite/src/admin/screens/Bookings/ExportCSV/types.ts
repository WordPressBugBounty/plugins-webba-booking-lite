import { IFilterField } from '../../../components/Filter/types'

export interface ExportCSVProps {
    selectedIds: number[]
    filterFields: IFilterField[]
    onClose?: () => void
}
