import { useEffect, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
import { __ } from '@wordpress/i18n'
import { TimeSlot } from '../BusinessHoursField/TimeSlot'
import { DateTimeRangeItem, DateTimeRangeSlot } from './types'
import {
    createDefaultTimeSlot,
    hasOverlappingTimeSlots,
} from './utils'
import calendarIcon from '../../../../../../public/images/icon-calendar.svg'
import trashIcon from '../../../../../../public/images/icon-trash.svg'
import plusIcon from '../../../../../../public/images/icon-plus-green.svg'
import 'react-datepicker/dist/react-datepicker.css'

type DateTimeRangeRowProps = {
    item: DateTimeRangeItem
    displayFormat: string
    onChange: (next: DateTimeRangeItem) => void
    onRemove: () => void
}

export const DateTimeRangeRow = ({
    item,
    displayFormat,
    onChange,
    onRemove,
}: DateTimeRangeRowProps) => {
    const [calendarOpen, setCalendarOpen] = useState(false)
    const [calendarRange, setCalendarRange] = useState<[Date | null, Date | null]>([
        item.startDate,
        item.endDate,
    ])
    const wrapperRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setCalendarRange([item.startDate, item.endDate])
    }, [item.startDate, item.endDate])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setCalendarOpen(false)
            }
        }

        if (calendarOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [calendarOpen])

    const formatRangeForDisplay = () => {
        const start = item.startDate ? format(item.startDate, displayFormat) : ''
        const end = item.endDate ? format(item.endDate, displayFormat) : ''
        if (start && end) {
            return `${start} - ${end}`
        }
        return start || end || ''
    }

    const handleRangeChange = (newRange: [Date | null, Date | null]) => {
        setCalendarRange(newRange)
        onChange({
            ...item,
            startDate: newRange[0],
            endDate: newRange[1],
        })
        if (newRange[0] && newRange[1]) {
            setCalendarOpen(false)
        }
    }

    const updateTimeSlot = (
        slotIndex: number,
        updates: Partial<Pick<DateTimeRangeSlot, 'start' | 'end' | 'status'>>
    ) => {
        const slots = [...item.timeSlots]
        slots[slotIndex] = { ...slots[slotIndex], ...updates }
        onChange({ ...item, timeSlots: slots })
    }

    const addTimeSlot = () => {
        const slots = item.timeSlots.filter(
            (slot) => !(slot.start === 0 && slot.end === 0)
        )
        const lastSlot = slots[slots.length - 1]
        const newSlot: DateTimeRangeSlot = lastSlot
            ? {
                  start: lastSlot.end,
                  end: lastSlot.end + 10800,
                  status: 'active',
              }
            : createDefaultTimeSlot()

        onChange({
            ...item,
            timeSlots: [...slots, newSlot],
        })
    }

    const removeTimeSlot = (slotIndex: number) => {
        onChange({
            ...item,
            timeSlots: item.timeSlots.filter((_, index) => index !== slotIndex),
        })
    }

    const visibleSlots = item.timeSlots.filter(
        (slot) => !(slot.start === 0 && slot.end === 0)
    )

    return (
        <div className="wbk_dateTimeRangesField__rangeBlock" ref={wrapperRef}>
            <div className="wbk_dateTimeRangesField__rangeHeader">
                <div className="wbk_dateTimeRangesField__dateRow">
                    <div className="wbk_dateTimeRangesField__inputContainer">
                        <div className="wbk_dateTimeRangesField__inputWrapper">
                            <input
                                ref={inputRef}
                                type="text"
                                className="wbk_dateTimeRangesField__dateInput"
                                value={formatRangeForDisplay()}
                                readOnly
                                placeholder="dd.mm.yyyy - dd.mm.yyyy"
                                onFocus={() => {
                                    setCalendarOpen(true)
                                    setCalendarRange([item.startDate, item.endDate])
                                }}
                            />
                            {calendarOpen && (
                                <div className="wbk_dateTimeRangesField__calendarWrapper">
                                    <DatePicker
                                        selected={calendarRange[0]}
                                        onChange={(range: [Date | null, Date | null]) =>
                                            handleRangeChange(range)
                                        }
                                        startDate={calendarRange[0]}
                                        endDate={calendarRange[1]}
                                        selectsRange
                                        inline
                                        calendarClassName="wbk_dateTimeRangesField__calendar"
                                        dayClassName={() =>
                                            'wbk_dateTimeRangesField__day wbk_dateTimeRangesField__day--dayNotSelected'
                                        }
                                    />
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            className="wbk_dateTimeRangesField__calendarButton"
                            onClick={() => {
                                setCalendarOpen(true)
                                setCalendarRange([item.startDate, item.endDate])
                            }}
                            aria-label={__('Edit date range', 'webba-booking-lite')}
                        >
                            <img
                                src={calendarIcon}
                                alt=""
                                className="wbk_dateTimeRangesField__calendarIcon"
                            />
                        </button>
                    </div>
                </div>
                <button
                    type="button"
                    className="wbk_dateTimeRangesField__deleteRangeButton"
                    onClick={onRemove}
                    aria-label={__('Remove date range', 'webba-booking-lite')}
                >
                    <img
                        src={trashIcon}
                        alt=""
                        className="wbk_dateTimeRangesField__deleteIcon"
                    />
                </button>
            </div>

            <div className="wbk_dateTimeRangesField__timesSection">
                <div className="wbk_dateTimeRangesField__timesHeader">
                    <span className="wbk_dateTimeRangesField__timesLabel">
                        {__('Time slots', 'webba-booking-lite')}
                    </span>
                    <button
                        type="button"
                        className="wbk_dateTimeRangesField__addTimeSlotButton"
                        onClick={addTimeSlot}
                    >
                        <img
                            src={plusIcon}
                            alt=""
                            className="wbk_dateTimeRangesField__plusIcon"
                        />
                        {__('Add time slot', 'webba-booking-lite')}
                    </button>
                </div>

                <div className="wbk_dateTimeRangesField__timeSlotsContainer">
                    {visibleSlots.length === 0 ? (
                        <div className="wbk_dateTimeRangesField__noTimeSlots">
                            {__('No time slots set', 'webba-booking-lite')}
                        </div>
                    ) : (
                        visibleSlots.map((slot, slotIndex) => (
                            <TimeSlot
                                key={slotIndex}
                                start={slot.start}
                                end={slot.end}
                                status={slot.status || 'active'}
                                onStartChange={(start) =>
                                    updateTimeSlot(slotIndex, { start })
                                }
                                onEndChange={(end) =>
                                    updateTimeSlot(slotIndex, { end })
                                }
                                onStatusChange={(status) =>
                                    updateTimeSlot(slotIndex, { status })
                                }
                                onRemove={() => removeTimeSlot(slotIndex)}
                            />
                        ))
                    )}
                </div>

                {hasOverlappingTimeSlots(item.timeSlots) && (
                    <div className="wbk_dateTimeRangesField__overlapError">
                        {__(
                            'Time slots cannot overlap within this date range.',
                            'webba-booking-lite'
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
