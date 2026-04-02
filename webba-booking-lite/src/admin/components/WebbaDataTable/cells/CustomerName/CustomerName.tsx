import { CellContext } from '@tanstack/react-table'
import '../../Table.scss'

export const CustomerName = ({ row }: CellContext<any, any>) => {
    return (
        <div style={{ maxWidth: 300 }}>
            <p className="wbk_table__rowItemTitle">{row.original.name}</p>
            <p className="wbk_table__rowItemContent">{row.original.email}</p>
        </div>
    )
}
