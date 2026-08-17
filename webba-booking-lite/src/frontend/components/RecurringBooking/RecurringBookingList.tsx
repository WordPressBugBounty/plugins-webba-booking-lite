import { __ } from '@wordpress/i18n'
import { RecurringBookingListItem } from './RecurringBookingListItem'
import { IRecurringBookingListProps } from './types'
import './RecurringBookingList.scss'
import { useWording } from '../../hooks/useWording'

export const RecurringBookingList = ({
    items,
    baseTimeSlot,
    intervalStep,
    repeatInterval,
    dateFormat,
    timeFormat,
    userTimezone,
    locale,
    isLoading,
    error,
    serviceId,
    staffMemberId,
    locationId,
    offset,
    onItemOverride,
    onItemRemove,
}: IRecurringBookingListProps) => {
    const wording = useWording()

    if (isLoading) {
        return (
            <div className="wbk_recurring_list wbk_recurring_list--loading">
                {wording.loading_appointments || __('Loading appointments...', 'webba-booking-lite')}
            </div>
        )
    }

    if (error) {
        return (
            <div className="wbk_recurring_list wbk_recurring_list--error">
                {error}
            </div>
        )
    }

    const visibleItems = items.filter((item) => !item.removed)

    if (visibleItems.length === 0) {
        return (
            <div className="wbk_recurring_list wbk_recurring_list--empty">
                {wording.no_appointments_selected || __(
                    'No appointments selected. Add slots using the controls above or close the popup.',
                    'webba-booking-lite'
                )}
            </div>
        )
    }

    return (
        <ol className="wbk_recurring_list">
            {visibleItems.map((item, idx) => (
                <RecurringBookingListItem
                    key={`${item.index}-${item.timeslot.start_time}`}
                    item={item}
                    rowNumber={idx + 1}
                    baseTimeSlot={baseTimeSlot}
                    intervalStep={intervalStep}
                    repeatInterval={repeatInterval}
                    dateFormat={dateFormat}
                    timeFormat={timeFormat}
                    userTimezone={userTimezone}
                    locale={locale}
                    serviceId={serviceId}
                    staffMemberId={staffMemberId}
                    locationId={locationId}
                    offset={offset}
                    onOverride={(timeslot) =>
                        onItemOverride(item.index, timeslot)
                    }
                    onRemove={() => onItemRemove(item.index)}
                />
            ))}
        </ol>
    )
}
