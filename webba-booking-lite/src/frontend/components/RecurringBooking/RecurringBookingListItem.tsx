import { useCallback, useMemo, useState } from 'react'
import { __ } from '@wordpress/i18n'
import { useDispatch, useSelect } from '@wordpress/data'
import { store_name } from '../../../store/frontend'
import { wbkFormat } from '../../../admin/components/Form/utils/dateTime'
import { getDateFnsLocale } from '../../../utilities/timezones'
import { wbkBackendDate } from '../../providers/BookingFormProvider/utils'
import { getExpectedStartTime } from './utils'
import {
    IRecurringBookingListItemProps,
    IRecurringTimeslotPayload,
} from './types'
import { ReactComponent as CloseIcon } from '../../../../public/images/icon-close.svg'
import './RecurringBookingListItem.scss'

export const RecurringBookingListItem = ({
    item,
    rowNumber,
    baseTimeSlot,
    intervalStep,
    repeatInterval,
    dateFormat,
    timeFormat,
    userTimezone,
    locale,
    serviceId,
    staffMemberId,
    locationId,
    offset,
    onOverride,
    onRemove,
}: IRecurringBookingListItemProps) => {
    const [pickerOpen, setPickerOpen] = useState(false)
    const { fetchServiceTimeslots } = useDispatch(store_name)

    const dateFnsLocale = useMemo(
        () => getDateFnsLocale(locale || 'en'),
        [locale]
    )

    const formatOptions = useMemo(
        () => ({ locale: dateFnsLocale }),
        [dateFnsLocale]
    )

    const startTime = Number(item.timeslot.start_time)
    const dateLabel = wbkFormat(
        startTime,
        dateFormat,
        userTimezone,
        formatOptions
    )
    const timeLabel = wbkFormat(
        startTime,
        timeFormat,
        userTimezone,
        formatOptions
    )

    const expectedTimeLabel = wbkFormat(
        getExpectedStartTime(
            baseTimeSlot,
            item.index,
            intervalStep,
            repeatInterval
        ),
        timeFormat,
        userTimezone,
        formatOptions
    )

    const backendDate = wbkBackendDate(new Date(startTime * 1000))
    const daySlots = useSelect(
        (select: any) =>
            pickerOpen
                ? select(store_name).getServiceTimeslots(serviceId, backendDate)
                : [],
        [pickerOpen, serviceId, backendDate]
    )

    const freeSlots = useMemo(
        () =>
            (daySlots || []).filter(
                (slot: { free_places: number }) => slot.free_places > 0
            ),
        [daySlots]
    )

    const handleOpenPicker = useCallback(() => {
        setPickerOpen(true)
        fetchServiceTimeslots(
            backendDate,
            serviceId,
            offset,
            locationId,
            staffMemberId
        )
    }, [
        backendDate,
        serviceId,
        offset,
        locationId,
        staffMemberId,
        fetchServiceTimeslots,
    ])

    const handleSelectAlternative = (slot: {
        start_time: number
        end_time?: number
        free_places: number
        staff_member_ids?: (string | number)[]
    }) => {
        const payload: IRecurringTimeslotPayload = {
            start_time: Number(slot.start_time),
            end_time: Number(slot.end_time ?? slot.start_time),
            free_places: slot.free_places,
            staff_member_ids: slot.staff_member_ids,
        }
        onOverride(payload)
        setPickerOpen(false)
    }

    const isUnavailable = item.status === 'unavailable' && !item.userOverride
    const isAdjusted = item.status === 'adjusted' && !item.userOverride
    const statusClass = isUnavailable
        ? 'wbk_recurring_list_item--unavailable'
        : isAdjusted
          ? 'wbk_recurring_list_item--adjusted'
          : 'wbk_recurring_list_item--available'

    return (
        <li className={`wbk_recurring_list_item ${statusClass}`}>
            <span className="wbk_recurring_list_item__number">{rowNumber}.</span>
            <div className="wbk_recurring_list_item__content">
                {isUnavailable ? (
                    <>
                        <div className="wbk_recurring_list_item__datetime">
                            <span className="wbk_recurring_list_item__date">
                                {dateLabel}
                            </span>
                        </div>
                        <span className="wbk_recurring_list_item__status">
                            {__('unavailable', 'webba-booking-lite')}
                        </span>
                        {!pickerOpen ? (
                            <button
                                type="button"
                                className="wbk_recurring_list_item__choose-link"
                                onClick={handleOpenPicker}
                            >
                                {__(
                                    'Choose another time',
                                    'webba-booking-lite'
                                )}
                            </button>
                        ) : (
                            <select
                                className="wbk_recurring_list_item__alt-select"
                                defaultValue=""
                                onChange={(e) => {
                                    const val = e.target.value
                                    if (!val) return
                                    const slot = freeSlots.find(
                                        (s: { start_time: number }) =>
                                            String(s.start_time) === val
                                    )
                                    if (slot) handleSelectAlternative(slot)
                                }}
                            >
                                <option value="">
                                    {__(
                                        'Select a time',
                                        'webba-booking-lite'
                                    )}
                                </option>
                                {freeSlots.map(
                                    (slot: {
                                        start_time: number
                                        end_time?: number
                                        free_places: number
                                        staff_member_ids?: (
                                            | string
                                            | number
                                        )[]
                                    }) => (
                                        <option
                                            key={slot.start_time}
                                            value={slot.start_time}
                                        >
                                            {wbkFormat(
                                                slot.start_time,
                                                timeFormat,
                                                userTimezone,
                                                formatOptions
                                            )}
                                        </option>
                                    )
                                )}
                            </select>
                        )}
                    </>
                ) : (
                    <>
                        <div className="wbk_recurring_list_item__datetime">
                            <span className="wbk_recurring_list_item__date">
                                {dateLabel}
                            </span>
                            <span className="wbk_recurring_list_item__time">
                                {timeLabel}
                            </span>
                        </div>
                        {isAdjusted && (
                            <span className="wbk_recurring_list_item__badge">
                                {__('adjusted', 'webba-booking-lite')},{' '}
                                {expectedTimeLabel}{' '}
                                {__('unavailable', 'webba-booking-lite')}
                            </span>
                        )}
                    </>
                )}
            </div>
            <button
                type="button"
                className="wbk_recurring_list_item__remove"
                onClick={onRemove}
                aria-label={__('Remove appointment', 'webba-booking-lite')}
            >
                <CloseIcon />
            </button>
        </li>
    )
}
