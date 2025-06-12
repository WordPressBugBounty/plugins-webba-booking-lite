import { CellContext } from '@tanstack/react-table'
import styles from '../../Table.module.scss'

export const CustomerName = ({ row }: CellContext<any, any>) => {
    return (
        <div style={{ maxWidth: 300 }}>
            <p className={styles.rowItemTitle}>{row.original.name}</p>
            <p className={styles.rowItemContent}>{row.original.email}</p>
        </div>
    )
}
