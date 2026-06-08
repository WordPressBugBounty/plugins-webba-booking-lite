import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { __ } from '@wordpress/i18n'
import { useDispatch } from '@wordpress/data'
import { store_name } from '../../../store/frontend'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { Button } from '../Button/Button'
import closeIcon from '../../../../public/images/icon-close.svg'
import { RecurringBookingControls } from './RecurringBookingControls'
import { RecurringBookingList } from './RecurringBookingList'
import {
    IRecurringBookingPopupProps,
    IRecurringSlotApiItem,
    IRecurringSlotListItem,
    IRecurringTimeslotPayload,
    RecurringRepeatInterval,
} from './types'
import {
    applySlotOverride,
    clampRecurringCount,
    getActiveRecurringListItems,
    isRecurringListConfirmable,
    mapRecurringSlotsFromApi,
    normalizeAllowedIntervals,
    removeRecurringListItem,
    recurringSlotsToPlaces,
} from './utils'
import './RecurringBookingPopup.scss'

export const RecurringBookingPopup = ({
    isOpen,
    serviceId,
    serviceLabel,
    pendingSlot,
    serviceConfig,
    staffMemberId,
    locationId,
    offset,
    timezone,
    dateFormat,
    timeFormat,
    userTimezone,
    locale,
    existingPlacesCount,
    minSlots,
    maxSlots,
    onConfirm,
    onClose,
}: IRecurringBookingPopupProps) => {
    const { fetchRecurringBookingTimeSlots } = useDispatch(store_name)
    const { popupPortalElement } = useBookingContext()

    const allowedIntervals = useMemo(
        () => normalizeAllowedIntervals(serviceConfig.recurring_intervals),
        [serviceConfig.recurring_intervals]
    )

    const minCount = Math.max(1, serviceConfig.recurring_min_count ?? 2)
    const maxCount = Math.max(minCount, serviceConfig.recurring_max_count ?? 12)

    const [intervalStep, setIntervalStep] = useState(1)
    const [repeatInterval, setRepeatInterval] = useState<RecurringRepeatInterval>(
        allowedIntervals[0] ?? 'week'
    )
    const [count, setCount] = useState(minCount)
    const [listItems, setListItems] = useState<IRecurringSlotListItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen) return
        setIntervalStep(1)
        setRepeatInterval(allowedIntervals[0] ?? 'week')
        setCount(minCount)
        setListItems([])
        setError(null)
    }, [isOpen, allowedIntervals, minCount])

    useEffect(() => {
        if (!popupPortalElement) return
        if (isOpen) {
            popupPortalElement.classList.add(
                'wbk_booking_form__popup-portal--active'
            )
        } else {
            popupPortalElement.classList.remove(
                'wbk_booking_form__popup-portal--active'
            )
        }
        return () => {
            popupPortalElement.classList.remove(
                'wbk_booking_form__popup-portal--active'
            )
        }
    }, [isOpen, popupPortalElement])

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    const loadPreview = useCallback(async () => {
        if (!pendingSlot || !isOpen) return

        setIsLoading(true)
        setError(null)

        try {
            const response = (await fetchRecurringBookingTimeSlots({
                serviceId,
                timeSlot: pendingSlot.time,
                repeats: intervalStep,
                numberOfTimeslots: count,
                repeatInterval,
                staffMemberId,
                offset,
            })) as {
                time_slots?: IRecurringSlotApiItem[]
                error?: string
            }

            if (response?.error) {
                setError(String(response.error))
                setListItems([])
                return
            }

            const slots = Array.isArray(response?.time_slots)
                ? response.time_slots
                : []
            setListItems(mapRecurringSlotsFromApi(slots))
        } catch (err: unknown) {
            const message =
                err && typeof err === 'object' && 'message' in err
                    ? String((err as { message: string }).message)
                    : __('Failed to load recurring slots', 'webba-booking-lite')
            setError(message)
            setListItems([])
        } finally {
            setIsLoading(false)
        }
    }, [
        pendingSlot,
        isOpen,
        count,
        intervalStep,
        repeatInterval,
        serviceId,
        staffMemberId,
        offset,
        fetchRecurringBookingTimeSlots,
    ])

    useEffect(() => {
        if (!isOpen || !pendingSlot) return

        const timeoutId = setTimeout(() => {
            loadPreview()
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [isOpen, pendingSlot, count, intervalStep, repeatInterval, loadPreview])

    const handleCountChange = (value: number) => {
        setCount(clampRecurringCount(value, minCount, maxCount))
    }

    const handleItemOverride = (
        index: number,
        timeslot: IRecurringTimeslotPayload
    ) => {
        setListItems((prev) => applySlotOverride(prev, index, timeslot))
    }

    const handleItemRemove = (index: number) => {
        setListItems((prev) => removeRecurringListItem(prev, index))
    }

    const activeListItems = useMemo(
        () => getActiveRecurringListItems(listItems),
        [listItems]
    )

    const minSlotsLimit = minSlots && minSlots > 0 ? minSlots : 1
    const maxSlotsLimit =
        maxSlots && maxSlots > 0 ? maxSlots : Number.POSITIVE_INFINITY
    const singleSlotMode =
        minSlotsLimit === 1 && maxSlotsLimit === 1
    const seriesCount = activeListItems.length
    const wouldExceedMax =
        !singleSlotMode &&
        Number.isFinite(maxSlotsLimit) &&
        existingPlacesCount + seriesCount > maxSlotsLimit

    const canConfirm =
        isRecurringListConfirmable(listItems) &&
        !isLoading &&
        !error &&
        activeListItems.length > 0 &&
        !wouldExceedMax

    const handleConfirm = () => {
        if (!canConfirm || !pendingSlot) return
        const newPlaces = recurringSlotsToPlaces(
            activeListItems,
            timezone,
            pendingSlot.defaultStaffId
        )
        onConfirm(newPlaces)
    }

    if (!isOpen || !pendingSlot) {
        return null
    }

    if (!popupPortalElement) {
        return null
    }

    const popupContent = (
        <div
            className="wbk_recurring_booking_popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wbk_recurring_popup_title"
        >
            <div className="wbk_recurring_booking_popup__modal">
                <button
                    className="wbk_recurring_booking_popup__close"
                    onClick={onClose}
                    type="button"
                    aria-label={__('Close', 'webba-booking-lite')}
                >
                    <img src={closeIcon} alt="" />
                </button>
                <h2
                    id="wbk_recurring_popup_title"
                    className="wbk_recurring_booking_popup__title"
                >
                    {__('Recurring booking', 'webba-booking-lite')}
                </h2>
                <p className="wbk_recurring_booking_popup__subtitle">
                    {serviceLabel}
                </p>

                <RecurringBookingControls
                    intervalStep={intervalStep}
                    repeatInterval={repeatInterval}
                    count={count}
                    allowedIntervals={allowedIntervals}
                    minCount={minCount}
                    maxCount={maxCount}
                    disabled={isLoading}
                    onIntervalStepChange={setIntervalStep}
                    onRepeatIntervalChange={setRepeatInterval}
                    onCountChange={handleCountChange}
                />

                <div className="wbk_recurring_booking_popup__list-panel">
                    <RecurringBookingList
                        items={listItems}
                        baseTimeSlot={pendingSlot.time}
                        intervalStep={intervalStep}
                        repeatInterval={repeatInterval}
                        dateFormat={dateFormat}
                        timeFormat={timeFormat}
                        userTimezone={userTimezone}
                        locale={locale}
                        isLoading={isLoading}
                        error={error}
                        serviceId={serviceId}
                        staffMemberId={staffMemberId}
                        locationId={locationId}
                        offset={offset}
                        onItemOverride={handleItemOverride}
                        onItemRemove={handleItemRemove}
                    />
                </div>

                {wouldExceedMax && (
                    <p className="wbk_recurring_booking_popup__hint">
                        {__(
                            'This series exceeds the maximum number of slots allowed for this service.',
                            'webba-booking-lite'
                        )}
                    </p>
                )}

                <div className="wbk_recurring_booking_popup__actions">
                    <Button type="secondary" onClick={onClose}>
                        {__('Cancel', 'webba-booking-lite')}
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        tooltip={
                            !canConfirm && !wouldExceedMax
                                ? __(
                                      'Resolve unavailable slots before confirming',
                                      'webba-booking-lite'
                                  )
                                : undefined
                        }
                    >
                        {__('Confirm', 'webba-booking-lite')}
                    </Button>
                </div>
            </div>
        </div>
    )

    return createPortal(popupContent, popupPortalElement)
}
