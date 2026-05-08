import { CellContext } from '@tanstack/react-table'
import { wbkFormat } from '../../../Form/utils/dateTime'
import '../../Table.scss'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import { getUnixTime } from 'date-fns'

export const BookingTime = ({ cell }: CellContext<any, any>) => {
    const { settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const date = wbkFormat(
        cell.row.original?.time && Number(cell.row.original.time) || getUnixTime(new Date()),
        `${settings ? settings.date_format : 'dd/mm'}`,
        settings ? settings.timezone : 'UTC'
    )
    const time = wbkFormat(
        cell.row.original?.time && Number(cell.row.original.time) || getUnixTime(new Date()),
        `${settings ? settings.time_format : 'HH:mm'}`,
        settings ? settings.timezone : 'UTC'
    )

    return (
        <div className="wbk_table__noWrapContainer">
            <p className="wbk_table__rowItemTitle">{date}</p>
            {
                Number(cell.row.original?.service_id) > 0 && (
                    <p className="wbk_table__rowItemContent">{time}</p>
                )
            }
        </div>
    )
}
