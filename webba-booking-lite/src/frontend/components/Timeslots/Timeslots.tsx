import { useMemo } from 'react'
import { ITimeslotsProps } from './types'
import './Timeslots.scss'
import classNames from 'classnames'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { useWording } from '../../hooks/useWording'
import { useLocale } from '../../hooks/useLocale'
import { __ } from '@wordpress/i18n'
import { wbkFormat } from '../../../admin/components/Form/utils/dateTime'
import { getDateFnsLocale } from '../../../utilities/timezones'

export const Timeslots = ({
    timeslots,
    selectedSlots,
    setSlot,
    onPlaceStaffSelect,
    quantity,
    max_quantity,
    serviceId,
    min_slots,
    max_slots,
    consecutive_timeslots,
    places,
    selectedDate,
    limited_timeslot,
    showStaffSelector,
}: ITimeslotsProps) => {
    const { loading, preset, timeFormat, userTimezone } = useBookingContext()
    const { locale } = useLocale()
    const dateFnsLocale = useMemo(
        () => getDateFnsLocale(locale || 'en'),
        [locale]
    )
    const isLoading =
        (serviceId !== undefined && loading?.serviceTimeslots?.[serviceId]) ||
        loading?.serviceAvailability?.[Number(serviceId)]
    const wording = useWording()

    // Enable min/max slot logic only if limited_timeslot is true or min/max values are set
    const enableSlotLimits = !!limited_timeslot || !!min_slots || !!max_slots

    // Calculate slot requirements using TOTAL selected slots across all days
    const minSlots = enableSlotLimits ? min_slots || 0 : 0
    const maxSlots = enableSlotLimits ? max_slots : undefined
    const totalSelectedCount = places.length // Use global count from places
    const selectedCount = selectedSlots.length // Keep for consecutive logic
    const canSelectMore =
        !enableSlotLimits ||
        maxSlots === undefined ||
        maxSlots <= 0 ||
        totalSelectedCount < maxSlots
    const hasMinimumSlots = !enableSlotLimits || totalSelectedCount >= minSlots

    // Strict contiguous block logic for consecutive_timeslots with enforced min/max slots (default min 1, max unlimited)
    const minSlotsLimit = enableSlotLimits
        ? min_slots && min_slots > 0
            ? min_slots
            : 1
        : 1
    const maxSlotsLimit = enableSlotLimits
        ? max_slots && max_slots > 0
            ? max_slots
            : Infinity
        : Infinity

    let allowedConsecutiveSlots: Set<number> | null = null
    if (consecutive_timeslots && selectedSlots.length > 0) {
        // Find indices of selected slots in the timeslots array
        const selectedIndices = timeslots
            .map((slot, idx) =>
                selectedSlots.includes(Number(slot.start_time)) ? idx : -1
            )
            .filter((idx) => idx !== -1)
            .sort((a, b) => a - b)
        const maxSlotsReached = totalSelectedCount >= maxSlotsLimit // Use total count
        if (maxSlotsLimit === 1) {
            // Always allow neighbors to be selectable
            const idx = selectedIndices[0]
            allowedConsecutiveSlots = new Set([
                Number(timeslots[idx].start_time),
                ...(timeslots[idx - 1]
                    ? [Number(timeslots[idx - 1].start_time)]
                    : []),
                ...(timeslots[idx + 1]
                    ? [Number(timeslots[idx + 1].start_time)]
                    : []),
            ])
        } else if (selectedIndices.length === 1) {
            const idx = selectedIndices[0]
            allowedConsecutiveSlots = new Set([
                Number(timeslots[idx].start_time),
                ...(!maxSlotsReached && timeslots[idx - 1]
                    ? [Number(timeslots[idx - 1].start_time)]
                    : []),
                ...(!maxSlotsReached && timeslots[idx + 1]
                    ? [Number(timeslots[idx + 1].start_time)]
                    : []),
            ])
        } else {
            // Check if selected indices are contiguous
            const isContiguous = selectedIndices.every(
                (idx, i, arr) => i === 0 || idx === arr[i - 1] + 1
            )
            if (!isContiguous) {
                // Only allow deselection
                allowedConsecutiveSlots = new Set(
                    selectedIndices.map((idx) =>
                        Number(timeslots[idx].start_time)
                    )
                )
            } else {
                // Only allow expanding before the first or after the last if max not reached
                const minIdx = selectedIndices[0]
                const maxIdx = selectedIndices[selectedIndices.length - 1]
                allowedConsecutiveSlots = new Set([
                    ...selectedIndices.map((idx) =>
                        Number(timeslots[idx].start_time)
                    ),
                    ...(!maxSlotsReached && timeslots[minIdx - 1]
                        ? [Number(timeslots[minIdx - 1].start_time)]
                        : []),
                    ...(!maxSlotsReached && timeslots[maxIdx + 1]
                        ? [Number(timeslots[maxIdx + 1].start_time)]
                        : []),
                ])
            }
        }
    }

    if (isLoading) {
        // Simple skeleton loader, replace with a library if you have one
        return (
            <div className={'wbk_timeslots'}>
                {[...Array(9)].map((_, i) => (
                    <div key={i} className={'wbk_timeslots__skeleton-slot'} />
                ))}
            </div>
        )
    }

    return (
        <div
            className={classNames('wbk_timeslots', {
                'wbk_timeslots--noitems': !timeslots || timeslots.length === 0,
            })}
        >
            {timeslots.map(
                ({ start_time, free_places }, index) => {
                    const slotNum = Number(start_time)
                    const isSelected = selectedSlots.includes(slotNum)
                    const isDisabled =
                        free_places === 0 || quantity > free_places
                    const isMaxReached =
                        enableSlotLimits &&
                        maxSlots &&
                        maxSlots > 0 &&
                        totalSelectedCount >= maxSlots && // Use total count
                        !isSelected
                    // Consecutive logic: if enabled, only allow selecting next/prev to current selection
                    let isConsecutiveDisabled = false
                    if (
                        consecutive_timeslots &&
                        selectedSlots.length > 0 &&
                        !isSelected
                    ) {
                        // Only allow selection if slot is adjacent to the current block
                        isConsecutiveDisabled =
                            !allowedConsecutiveSlots!.has(slotNum)
                    }
                    // Prevent selection of non-adjacent slots when consecutive_timeslots is true
                    const shouldPreventClick =
                        isDisabled || isMaxReached || isConsecutiveDisabled

                    if (
                        preset?.settings?.show_booked_slots === false &&
                        isDisabled
                    ) {
                        return null
                    }

                    return (
                        <div
                            className={classNames(
                                'wbk_timeslots__item',
                                'wbk_timeslots__slot-appear',
                                {
                                    'wbk_timeslots__item--selected': isSelected,
                                    'wbk_timeslots__item--disabled':
                                        isDisabled || isConsecutiveDisabled,
                                    'wbk_timeslots__item--max-reached':
                                        isMaxReached,
                                }
                            )}
                            style={{ animationDelay: `${index * 80}ms` }}
                            onClick={() =>
                                !shouldPreventClick &&
                                (maxSlotsLimit === 1
                                    ? setSlot(Number(start_time)) // Replace selection if min/max is 1
                                    : setSlot(Number(start_time)))
                            }
                            title={
                                isMaxReached
                                    ? `Maximum ${maxSlots} slots reached`
                                    : undefined
                            }
                        >
                            {wbkFormat(start_time, timeFormat, userTimezone, {
                                locale: dateFnsLocale,
                            })}
                            {max_quantity > 1 && (
                                <div className={'wbk_timeslots__free-places'}>
                                    {free_places}{' '}
                                    {wording?.slots ||
                                        __('slots', 'webba-booking-lite')}
                                </div>
                            )}
                            {showStaffSelector &&
                                isSelected &&
                                Array.isArray(
                                    (timeslots[index] as any).staff_member_ids
                                ) &&
                                (timeslots[index] as any).staff_member_ids
                                    .length > 0 && (
                                    <div
                                        className={
                                            'wbk_timeslots__staff-members'
                                        }
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                    >
                                        {(timeslots[index] as any).staff_member_ids.map(
                                            (staffId: string | number) => {
                                                const staff = (
                                                    preset?.staff_members || []
                                                ).find(
                                                    (s: any) =>
                                                        String(s.id) ===
                                                        String(staffId)
                                                )
                                                const selectedPlace =
                                                    places?.find(
                                                        (p) =>
                                                            p.timeslot === slotNum &&
                                                            (!selectedDate ||
                                                                (p.date?.getDate() ===
                                                                    selectedDate.getDate() &&
                                                                    p.date?.getMonth() ===
                                                                        selectedDate.getMonth() &&
                                                                    p.date?.getFullYear() ===
                                                                        selectedDate.getFullYear()))
                                                    )
                                                const isStaffSelected =
                                                    String(
                                                        selectedPlace?.staff_member_id ||
                                                            ''
                                                    ) === String(staffId)
                                                const initials = String(
                                                    staff?.label || ''
                                                )
                                                    .split(/\s+/)
                                                    .map((w) => w[0])
                                                    .join('')
                                                    .slice(0, 2)
                                                    .toUpperCase()
                                                const staffLabel =
                                                    staff?.label ||
                                                    String(staffId)

                                                return (
                                                    <div
                                                        key={String(staffId)}
                                                        className={
                                                            'wbk_timeslots__staff-member-wrapper'
                                                        }
                                                    >
                                                        <button
                                                            type="button"
                                                            className={classNames(
                                                                'wbk_timeslots__staff-member',
                                                                {
                                                                    'wbk_timeslots__staff-member--selected':
                                                                        isStaffSelected,
                                                                }
                                                            )}
                                                            title={staffLabel}
                                                            aria-label={staffLabel}
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                onPlaceStaffSelect(
                                                                    slotNum,
                                                                    String(staffId)
                                                                )
                                                            }}
                                                        >
                                                            {staff?.photo ? (
                                                                <img
                                                                    src={
                                                                        staff.photo
                                                                    }
                                                                    alt={
                                                                        staff.label
                                                                    }
                                                                />
                                                            ) : (
                                                                <span>
                                                                    {initials}
                                                                </span>
                                                            )}
                                                        </button>
                                                        <span
                                                            className={
                                                                'wbk_timeslots__staff-tooltip'
                                                            }
                                                        >
                                                            {staffLabel}
                                                        </span>
                                                    </div>
                                                )
                                            }
                                        )}
                                    </div>
                                )}
                        </div>
                    )
                }
            )}
        </div>
    )
}
