import { __, sprintf } from '@wordpress/i18n'
import { Button } from '../Button/Button'
import { ReactComponent as ArrowRightIcon } from '../../../../public/images/icon-arrow-right.svg'
import { IEmptyMonthOverlayProps } from './types'
import './EmptyMonthOverlay.scss'
import { useWording } from '../../hooks/useWording'

export const EmptyMonthOverlay = ({
    monthName,
    onNextMonth,
}: IEmptyMonthOverlayProps) => {
    const wording = useWording();

    return (
        <div className="wbk_booking_calendar__empty-month" role="status">
            <p className="wbk_booking_calendar__empty-month-message">
                {sprintf(
                    __('No times in %s', 'webba-booking-lite'),
                    monthName
                )}
            </p>
            <Button
                type="primary"
                classes="wbk_booking_calendar__empty-month-button"
                onClick={onNextMonth}
                title={wording?.view_next_month || __('View next month', 'webba-booking-lite')}
                svgIcon={ArrowRightIcon}
                iconLocation="right"
            />
        </div>
    )
}
