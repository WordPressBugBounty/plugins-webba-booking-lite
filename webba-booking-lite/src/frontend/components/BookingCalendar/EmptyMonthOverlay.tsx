import { __, sprintf } from '@wordpress/i18n'
import { Button } from '../Button/Button'
import { ReactComponent as ArrowRightIcon } from '../../../../public/images/icon-arrow-right.svg'
import { IEmptyMonthOverlayProps } from './types'
import './EmptyMonthOverlay.scss'

export const EmptyMonthOverlay = ({
    monthName,
    onNextMonth,
}: IEmptyMonthOverlayProps) => {
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
                title={__('View next month', 'webba-booking-lite')}
                svgIcon={ArrowRightIcon}
                iconLocation="right"
            />
        </div>
    )
}
