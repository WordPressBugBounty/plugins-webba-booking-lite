import { Cell } from '@tanstack/react-table'
import './Table.scss'

interface Props {
    cell: Cell<any, any>
}

export const WebbaDataCell = ({ cell }: Props) => {
    return (
        <div className="wbk_table__tableCellContentWrapper">
            <div className="wbk_table__tableCellContent">{cell.getValue()}</div>
        </div>
    )
}
