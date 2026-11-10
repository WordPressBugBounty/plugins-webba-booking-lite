import { CellContext } from '@tanstack/react-table'
import './ServiceTitleCell.scss'

export const ServiceTitleCell = ({ row }: CellContext<any, any>) => {
    const name = row.original?.name
    const title = typeof name === 'string' ? name : ''

    return (
        <span className="wbk_serviceTitleCell" translate="no">
            {title}
        </span>
    )
}
