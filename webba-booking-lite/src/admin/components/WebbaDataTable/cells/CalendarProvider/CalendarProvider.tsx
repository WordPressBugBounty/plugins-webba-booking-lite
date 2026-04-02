import { CellContext } from '@tanstack/react-table'
import { __ } from '@wordpress/i18n'
import iconGoogle from '../../../../../../public/images/icon-google.svg'
import iconMicrosoft from '../../../../../../public/images/icon-microsoft.svg'
import './CalendarProvider.scss'

export const CalendarProvider = ({ cell }: CellContext<any, any>) => {
    const value = cell.getValue() as string
    const isOutlook = value === 'outlook'
    const icon = isOutlook ? iconMicrosoft : iconGoogle
    const label = isOutlook
        ? __('Outlook', 'webba-booking-lite')
        : value === 'google'
          ? __('Google', 'webba-booking-lite')
          : value

    return (
        <div className="wbk_calendarProvider__wrapper">
            <img src={icon} alt={label} className="wbk_calendarProvider__icon" />
            <span className="wbk_calendarProvider__label">{label}</span>
        </div>
    )
}
