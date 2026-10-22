import { CellContext } from '@tanstack/react-table'
import { __ } from '@wordpress/i18n'
import iconGoogle from '../../../../../../public/images/icon-google.svg'
import iconMicrosoft from '../../../../../../public/images/icon-microsoft.svg'
import iconApple from '../../../../../../public/images/icon-brand-apple.svg'
import './CalendarProvider.scss'

export const CalendarProvider = ({ cell }: CellContext<any, any>) => {
    const value = cell.getValue() as string
    const icon =
        value === 'outlook'
            ? iconMicrosoft
            : value === 'icloud'
              ? iconApple
              : iconGoogle
    const label =
        value === 'outlook'
            ? __('Outlook', 'webba-booking-lite')
            : value === 'icloud'
              ? __('iCloud Calendar', 'webba-booking-lite')
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
