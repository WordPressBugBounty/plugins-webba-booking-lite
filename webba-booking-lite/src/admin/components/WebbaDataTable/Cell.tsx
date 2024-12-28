import { Cell } from '@tanstack/react-table'
import styles from './Table.module.css'

interface Props {
    cell: Cell<any, any>
}

export const WebbaDataCell = ({ cell }: Props) => {
    return (
        <div className={styles.tableCellContentWrapper}>
            <div className={styles.tableCellContent}>{cell.getValue()}</div>
        </div>
    )
}
