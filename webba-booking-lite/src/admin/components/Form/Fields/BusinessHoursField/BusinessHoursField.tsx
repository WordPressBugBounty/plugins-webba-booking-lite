import { useCallback, useEffect, useMemo, useState } from 'react'
import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { ValidatorFn } from '../../utils/validation'
import { Label } from '../Label/Label'
import { TimeSlot } from './TimeSlot'
import './BusinessHours.scss'
import { BusinessDaySlot } from './types'
import { __ } from '@wordpress/i18n'
import { daysOfWeek, weekDaysSlugs } from '../../utils/dateTime'
import plusIcon from '../../../../../../public/images/icon-plus-green.svg'
import { usePreset } from '../../../../hooks/usePreset'

const businessHoursValidator: ValidatorFn<
    BusinessDaySlot[] | string | undefined
> = (days) => {
    let daysObj = days

    try {
        daysObj = JSON.parse(days as string)
    } catch (e) {}

    if (!daysObj || !Array.isArray(daysObj)) return null

    // Validate that time slots don't overlap within each day
    const slotsByDay = new Map<string, BusinessDaySlot[]>()

    for (const slot of daysObj as BusinessDaySlot[]) {
        if (slot.status === 'inactive') continue
        const dayOfWeek = slot.day_of_week
        if (!slotsByDay.has(dayOfWeek)) {
            slotsByDay.set(dayOfWeek, [])
        }
        slotsByDay.get(dayOfWeek)!.push(slot)
    }

    for (const [dayOfWeek, slots] of slotsByDay.entries()) {
        for (let i = 0; i < slots.length; i++) {
            for (let j = i + 1; j < slots.length; j++) {
                const slot1 = slots[i]
                const slot2 = slots[j]
                if (
                    (slot1.start < slot2.end && slot1.end > slot2.start) ||
                    (slot2.start < slot1.end && slot2.end > slot1.start)
                ) {
                    return __('Business hours overlapped', 'webba-booking-lite')
                }
            }
        }
    }

    return null
}

export const createBusinessHoursField: FormComponentConstructor<any> = ({
    field,
    fieldConfig,
}) => {
    field.setValidators([businessHoursValidator])

    return ({ name, label }) => {
        const formField = useField(field)
        const { value, setValue, errors } = formField
        const { settings } = usePreset()
        const startOfWeek = settings?.week_start
            ? String(settings?.week_start)
            : 'monday'
        const startOfWeekNumber = weekDaysSlugs[startOfWeek] ?? 1

        // Create ordered days array: backend uses 1–7 (1=Monday, 7=Sunday)
        // Honor week_start (e.g. Saturday first): map 0–6 (Sun–Sat) to first day 1–7, then order 7 days
        const orderedDays = useMemo(() => {
            const firstDayBackend = startOfWeekNumber === 0 ? 7 : startOfWeekNumber
            return Array.from({ length: 7 }, (_, i) =>
                String(((firstDayBackend + i - 1) % 7) + 1)
            )
        }, [startOfWeekNumber])

        const valueObj: BusinessDaySlot[] = useMemo(() => {
            try {
                const parsed = JSON.parse(value as string)
                if (Array.isArray(parsed)) {
                    // Normalize day_of_week to string format and ensure consistent structure
                    return parsed.map((slot) => ({
                        ...slot,
                        day_of_week: String(slot.day_of_week),
                    }))
                }
                return []
            } catch (e) {
                if (Array.isArray(value)) {
                    // Normalize day_of_week to string format
                    return value.map((slot) => ({
                        ...slot,
                        day_of_week: String(slot.day_of_week),
                    }))
                }
                return []
            }
        }, [value])

        // Initialize with default time slots for Mon-Fri if empty
        const [initialized, setInitialized] = useState(false)
        useEffect(() => {
            if (!initialized && valueObj.length === 0) {
                const defaultSlots: BusinessDaySlot[] = []
                for (let i = 1; i <= 5; i++) {
                    defaultSlots.push(
                        {
                            start: 32400,
                            end: 43200,
                            day_of_week: i.toString(),
                            status: 'active',
                        },
                        {
                            start: 46800,
                            end: 64800,
                            day_of_week: i.toString(),
                            status: 'active',
                        }
                    )
                }
                setValue(defaultSlots)
                setInitialized(true)
            } else if (valueObj.length > 0) {
                setInitialized(true)
            }
        }, [valueObj.length, initialized, setValue])

        // Get slots for a specific day (excluding placeholder slots with start: 0, end: 0)
        const getDaySlots = useCallback(
            (dayOfWeek: string) => {
                return valueObj.filter(
                    (slot) =>
                        slot.day_of_week === dayOfWeek &&
                        !(slot.start === 0 && slot.end === 0)
                )
            },
            [valueObj]
        )

        // Check if a day has overlapping time slots
        const hasOverlappingSlots = useCallback(
            (dayOfWeek: string) => {
                const slots = getDaySlots(dayOfWeek)
                const activeSlots = slots.filter(
                    (slot) => slot.status === 'active'
                )

                for (let i = 0; i < activeSlots.length; i++) {
                    for (let j = i + 1; j < activeSlots.length; j++) {
                        const slot1 = activeSlots[i]
                        const slot2 = activeSlots[j]
                        if (
                            (slot1.start < slot2.end &&
                                slot1.end > slot2.start) ||
                            (slot2.start < slot1.end && slot2.end > slot1.start)
                        ) {
                            return true
                        }
                    }
                }
                return false
            },
            [getDaySlots]
        )

        // Add time slot to day
        const addTimeSlot = useCallback(
            (dayOfWeek: string) => {
                const slots = getDaySlots(dayOfWeek)
                const lastSlot = slots[slots.length - 1]

                // Remove any placeholder slots for this day
                const valueWithoutPlaceholders = valueObj.filter(
                    (slot) =>
                        !(
                            String(slot.day_of_week) === dayOfWeek &&
                            slot.start === 0 &&
                            slot.end === 0
                        )
                )

                const newSlot: BusinessDaySlot = lastSlot
                    ? {
                          start: lastSlot.end,
                          end: lastSlot.end + 10800, // Add 3 hours
                          day_of_week: dayOfWeek,
                          status: 'active',
                      }
                    : {
                          start: 32400,
                          end: 43200,
                          day_of_week: dayOfWeek,
                          status: 'active',
                      }

                setValue([...valueWithoutPlaceholders, newSlot])
            },
            [valueObj, getDaySlots, setValue]
        )

        // Remove time slot
        const removeTimeSlot = useCallback(
            (dayOfWeek: string, slotIndex: number) => {
                const slots = getDaySlots(dayOfWeek)
                const slotToRemove = slots[slotIndex]
                const newValue = valueObj.filter(
                    (slot) => slot !== slotToRemove
                )
                setValue(newValue)
            },
            [valueObj, getDaySlots, setValue]
        )

        // Update time slot
        const updateTimeSlot = useCallback(
            (
                dayOfWeek: string,
                slotIndex: number,
                updates: Partial<
                    Pick<BusinessDaySlot, 'start' | 'end' | 'status'>
                >
            ) => {
                const slots = getDaySlots(dayOfWeek)
                const slotToUpdate = slots[slotIndex]

                // Create the updated slot
                const updatedSlot: BusinessDaySlot = {
                    ...slotToUpdate,
                    ...updates,
                }

                const newValue = valueObj.map((slot) =>
                    slot === slotToUpdate ? updatedSlot : slot
                )
                setValue(newValue)
            },
            [valueObj, getDaySlots, setValue]
        )

        // Apply to all days
        const applyToAllDays = useCallback(
            (dayOfWeek: string) => {
                const sourceSlots = getDaySlots(dayOfWeek)
                const newValue: BusinessDaySlot[] = []

                // Keep slots for other days, replace slots for all days with source day slots
                for (let i = 1; i <= 7; i++) {
                    const targetDayOfWeek = i.toString()
                    const existingSlots = valueObj.filter(
                        (slot) => String(slot.day_of_week) === targetDayOfWeek
                    )

                    if (targetDayOfWeek === dayOfWeek) {
                        // Keep original slots for source day
                        newValue.push(...existingSlots)
                    } else {
                        // Remove existing slots for target day
                        // Add copies of source slots with active status
                        sourceSlots.forEach((sourceSlot) => {
                            newValue.push({
                                start: sourceSlot.start,
                                end: sourceSlot.end,
                                day_of_week: targetDayOfWeek,
                                status: 'active',
                            })
                        })
                    }
                }

                setValue(newValue)
            },
            [valueObj, getDaySlots, setValue]
        )

        return (
            <div>
                <Label
                    title={label}
                    id={name}
                    tooltip={fieldConfig.misc?.tooltip}
                />
                <div className="wbk_businessHours__daysWrapper">
                    {orderedDays.map((dayOfWeek) => {
                        const daySlots = getDaySlots(dayOfWeek)
                        const dayName = daysOfWeek[dayOfWeek]

                        return (
                            <div key={dayOfWeek} className="wbk_businessHours__dayRow">
                                <div className="wbk_businessHours__dayHeader">
                                    <div className="wbk_businessHours__dayHeaderLeft">
                                        <span className="wbk_businessHours__dayName">
                                            {dayName}
                                        </span>
                                    </div>
                                    <div className="wbk_businessHours__dayHeaderRight">
                                        <a
                                            href="#"
                                            className="wbk_businessHours__addTimeSlotButton"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                addTimeSlot(dayOfWeek)
                                            }}
                                        >
                                            <img
                                                src={plusIcon}
                                                alt="add"
                                                className="wbk_businessHours__plusIcon"
                                            />
                                            {__(
                                                'Add Time Slot',
                                                'webba-booking-lite'
                                            )}
                                        </a>
                                        {daySlots.length > 0 && (
                                            <a
                                                href="#"
                                                className={
                                                    "wbk_businessHours__applyToAllButton"
                                                }
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    applyToAllDays(dayOfWeek)
                                                }}
                                            >
                                                {__(
                                                    'Apply to all days',
                                                    'webba-booking-lite'
                                                )}
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="wbk_businessHours__timeSlotsContainer">
                                    {daySlots.length === 0 ? (
                                        <div className="wbk_businessHours__noTimeSlots">
                                            {__(
                                                'No time slots set',
                                                'webba-booking-lite'
                                            )}
                                        </div>
                                    ) : (
                                        daySlots.map((slot, slotIndex) => (
                                            <TimeSlot
                                                key={slotIndex}
                                                start={slot.start}
                                                end={slot.end}
                                                status={slot.status || 'active'}
                                                onStartChange={(start) =>
                                                    updateTimeSlot(
                                                        dayOfWeek,
                                                        slotIndex,
                                                        { start }
                                                    )
                                                }
                                                onEndChange={(end) =>
                                                    updateTimeSlot(
                                                        dayOfWeek,
                                                        slotIndex,
                                                        { end }
                                                    )
                                                }
                                                onStatusChange={(status) =>
                                                    updateTimeSlot(
                                                        dayOfWeek,
                                                        slotIndex,
                                                        { status }
                                                    )
                                                }
                                                onRemove={() =>
                                                    removeTimeSlot(
                                                        dayOfWeek,
                                                        slotIndex
                                                    )
                                                }
                                            />
                                        ))
                                    )}
                                </div>
                                {hasOverlappingSlots(dayOfWeek) && (
                                    <div className="wbk_businessHours__overlapError">
                                        {__(
                                            'Business hours overlapped',
                                            'webba-booking-lite'
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
                {!!errors.length && (
                    <div className="wbk_businessHours__error">{errors[0]}</div>
                )}
            </div>
        )
    }
}
