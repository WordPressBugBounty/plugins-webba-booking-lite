import { CellContext } from '@tanstack/react-table'
import { useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { store } from '../../../../../store/backend'
import './CalendarName.scss'
import warningIcon from '../../../../../../public/images/warning.svg'

export const CalendarName = ({ cell }: CellContext<any, any>) => {
    const { row } = cell
    
    const { isAuthenticated, calendars } = useSelect(
        (select) => {
            return select(store).getGgAuthData(row.original.id)
        },
        [row.original.id]
    )

    if (!isAuthenticated || !calendars || !calendars[cell.getValue()]) {
        return (
            <div className="wbk_calendarName__calendarNotSet">
                <img src={warningIcon} />
                <span>
                    {__(
                        'Calendar is not set. Set it by pressing "Edit" icon.',
                        'webba-booking-lite'
                    )}
                </span>
            </div>
        )
    }

    return <div>{calendars[cell.getValue()]}</div>
}
