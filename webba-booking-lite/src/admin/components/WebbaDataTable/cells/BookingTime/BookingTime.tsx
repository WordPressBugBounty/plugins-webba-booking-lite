import { CellContext } from '@tanstack/react-table'
import { wbkFormat } from '../../../Form/utils/dateTime'
import styles from '../../Table.module.scss'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'

export const BookingTime = ({ cell }: CellContext<any, any>) => {
    const { settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const date = wbkFormat(
        cell.row.original.time,
        `${settings ? settings.date_format : 'dd/mm'}`,
        settings ? settings.timezone : 'UTC'
    )
    const time = wbkFormat(
        cell.row.original.time,
        `${settings ? settings.time_format : 'HH:mm'}`,
        settings ? settings.timezone : 'UTC'
    )

    return (
        <div className={styles.noWrapContainer}>
            <p className={styles.rowItemTitle}>{date}</p>
            <p className={styles.rowItemContent}>{time}</p>
        </div>
    )
}
