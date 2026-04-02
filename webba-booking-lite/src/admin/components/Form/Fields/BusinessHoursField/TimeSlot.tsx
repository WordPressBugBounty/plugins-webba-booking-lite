import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import './BusinessHours.scss'
import clockIcon from '../../../../../../public/images/icon-clock.svg'
import trashIcon from '../../../../../../public/images/icon-trash.svg'
import { Toggle } from '../../../Toggle/Toggle'
import { BusinessDayStatus } from './types'

interface TimeSlotProps {
    start: number
    end: number
    status: BusinessDayStatus
    onStartChange: (start: number) => void
    onEndChange: (end: number) => void
    onStatusChange: (status: BusinessDayStatus) => void
    onRemove: () => void
}

export const TimeSlot = ({
    start,
    end,
    status,
    onStartChange,
    onEndChange,
    onStatusChange,
    onRemove,
}: TimeSlotProps) => {
    const isActive = status === 'active'
    const { settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )

    const timeFormat = settings?.time_format || '12-hour'
    const is24Hour = timeFormat === '24-hour'

    // Convert seconds to hours and minutes
    const startHours = Math.floor(start / 3600)
    const startMinutes = Math.floor((start % 3600) / 60)
    const endHours = Math.floor(end / 3600)
    const endMinutes = Math.floor((end % 3600) / 60)

    // For 12-hour format, convert to 12-hour and track AM/PM
    // 86400 seconds = 24:00 = midnight (end of day) → display as 12:00 AM, not 12:00 PM
    const get12HourTime = useCallback((hours: number, minutes: number) => {
        if (is24Hour) {
            return { hour: hours, minute: minutes, period: '' }
        }
        if (hours === 24) {
            return { hour: 12, minute: minutes, period: 'AM' }
        }
        const period = hours >= 12 ? 'PM' : 'AM'
        const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
        return { hour: hour12, minute: minutes, period }
    }, [is24Hour])

    const startTime12 = useMemo(() => get12HourTime(startHours, startMinutes), [startHours, startMinutes, get12HourTime])
    const endTime12 = useMemo(() => get12HourTime(endHours, endMinutes), [endHours, endMinutes, get12HourTime])

    // Display values
    const startDisplayHour = is24Hour ? startHours : startTime12.hour
    const startDisplayMinute = startMinutes
    const startDisplayPeriod = startTime12.period
    const endDisplayHour = is24Hour ? endHours : endTime12.hour
    const endDisplayMinute = endMinutes
    const endDisplayPeriod = endTime12.period

    // Format display time
    const formatDisplayTime = useCallback((hour: number, minute: number, period: string) => {
        const minStr = minute.toString().padStart(2, '0')
        if (is24Hour) {
            const hourStr = hour.toString().padStart(2, '0')
            return `${hourStr}:${minStr}`
        }
        const hourStr = hour.toString().padStart(2, '0')
        return `${hourStr}:${minStr}`
    }, [is24Hour])

    const [showStartDropdown, setShowStartDropdown] = useState(false)
    const [showEndDropdown, setShowEndDropdown] = useState(false)
    const startDropdownRef = useRef<HTMLDivElement>(null)
    const endDropdownRef = useRef<HTMLDivElement>(null)
    const startInputRef = useRef<HTMLDivElement>(null)
    const endInputRef = useRef<HTMLDivElement>(null)
    
    // Drag state for columns
    const dragStateRef = useRef<{
        isDragging: boolean
        column: HTMLElement | null
        startY: number
        startScrollTop: number
        lastY: number
        hasMoved: boolean
    }>({
        isDragging: false,
        column: null,
        startY: 0,
        startScrollTop: 0,
        lastY: 0,
        hasMoved: false,
    })

    // Generate hour options: 12 AM, 1 AM ... 11 AM, 12 PM, 1 PM ... 11 PM
    const hourOptions = useMemo(() => {
        if (is24Hour) {
            return Array.from({ length: 24 }, (_, i) => ({
                value: i,
                label: i.toString().padStart(2, '0'),
                period: '',
            }))
        } else {
            const hours: { value: number; label: string; period: string }[] = []
            hours.push({ value: 12, label: '12', period: 'AM' })
            for (let i = 1; i <= 11; i++) {
                hours.push({ value: i, label: i.toString().padStart(2, '0'), period: 'AM' })
            }
            hours.push({ value: 12, label: '12', period: 'PM' })
            for (let i = 1; i <= 11; i++) {
                hours.push({ value: i, label: i.toString().padStart(2, '0'), period: 'PM' })
            }
            return hours
        }
    }, [is24Hour])

    // Generate minute options (every minute)
    const minuteOptions = useMemo(() => {
        return Array.from({ length: 60 }, (_, i) => ({
            value: i,
            label: i.toString().padStart(2, '0'),
        }))
    }, [])

    // Convert 12-hour to 24-hour. For end time, 12:00 AM means midnight (24:00 = 86400).
    const to24Hour = useCallback((hour: number, period: string, isEndTime = false) => {
        if (is24Hour) return hour === 24 ? (isEndTime ? 24 : 0) : hour
        if (period === 'AM') {
            if (hour === 12) return isEndTime ? 24 : 0
            return hour
        } else {
            return hour === 12 ? 12 : hour + 12
        }
    }, [is24Hour])

    // Convert to seconds
    const toSeconds = useCallback((hour: number, minute: number) => {
        return hour * 3600 + minute * 60
    }, [])

    const handleStartHourSelect = useCallback((hour: number, period?: string) => {
        const hour24 = is24Hour ? hour : to24Hour(hour, period || startDisplayPeriod)
        const seconds = toSeconds(hour24, startDisplayMinute)
        onStartChange(seconds)
        // Don't close dropdown - allow minute selection
    }, [is24Hour, startDisplayPeriod, startDisplayMinute, to24Hour, toSeconds, onStartChange])

    const handleStartMinuteSelect = useCallback((minute: number) => {
        const hour24 = is24Hour ? startDisplayHour : to24Hour(startDisplayHour, startDisplayPeriod)
        const seconds = toSeconds(hour24, minute)
        onStartChange(seconds)
        setShowStartDropdown(false)
    }, [is24Hour, startDisplayHour, startDisplayPeriod, to24Hour, toSeconds, onStartChange])

    const handleEndHourSelect = useCallback((hour: number, period?: string) => {
        const hour24 = is24Hour ? hour : to24Hour(hour, period || endDisplayPeriod, true)
        const seconds = toSeconds(hour24, endDisplayMinute)
        onEndChange(seconds)
        // Don't close dropdown - allow minute selection
    }, [is24Hour, endDisplayPeriod, endDisplayMinute, to24Hour, toSeconds, onEndChange])

    const handleEndMinuteSelect = useCallback((minute: number) => {
        const hour24 = is24Hour ? endDisplayHour : to24Hour(endDisplayHour, endDisplayPeriod, true)
        const seconds = toSeconds(hour24, minute)
        onEndChange(seconds)
        setShowEndDropdown(false)
    }, [is24Hour, endDisplayHour, endDisplayPeriod, to24Hour, toSeconds, onEndChange])

    // Handle drag for time columns
    const handleColumnMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, column: HTMLElement) => {
        dragStateRef.current = {
            isDragging: false,
            column,
            startY: e.clientY,
            startScrollTop: column.scrollTop,
            lastY: e.clientY,
            hasMoved: false,
        }
    }, [])

    const handleColumnMouseMove = useCallback((e: MouseEvent) => {
        const state = dragStateRef.current
        if (state.column) {
            const deltaY = Math.abs(e.clientY - state.startY)
            
            // Start dragging if moved more than 3 pixels
            if (deltaY > 3 && !state.isDragging) {
                state.isDragging = true
                state.hasMoved = true
                if (state.column) {
                    state.column.style.cursor = 'grabbing'
                    state.column.style.userSelect = 'none'
                }
            }
            
            if (state.isDragging && state.column) {
                const scrollDelta = e.clientY - state.startY
                state.column.scrollTop = state.startScrollTop - scrollDelta
                state.lastY = e.clientY
            }
        }
    }, [])

    const handleColumnMouseUp = useCallback(() => {
        const state = dragStateRef.current
        if (state.column) {
            state.column.style.cursor = 'grab'
            state.column.style.userSelect = ''
        }
        const wasDragging = state.isDragging
        dragStateRef.current = {
            isDragging: false,
            column: null,
            startY: 0,
            startScrollTop: 0,
            lastY: 0,
            hasMoved: false,
        }
        return wasDragging
    }, [])

    // Set up global mouse event listeners for dragging
    useEffect(() => {
        if (showStartDropdown || showEndDropdown) {
            document.addEventListener('mousemove', handleColumnMouseMove)
            document.addEventListener('mouseup', handleColumnMouseUp)
            document.addEventListener('mouseleave', handleColumnMouseUp)
            return () => {
                document.removeEventListener('mousemove', handleColumnMouseMove)
                document.removeEventListener('mouseup', handleColumnMouseUp)
                document.removeEventListener('mouseleave', handleColumnMouseUp)
            }
        }
    }, [showStartDropdown, showEndDropdown, handleColumnMouseMove, handleColumnMouseUp])

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Don't close if we're dragging
            if (dragStateRef.current.isDragging) {
                return
            }
            
            if (
                startDropdownRef.current &&
                !startDropdownRef.current.contains(event.target as Node) &&
                startInputRef.current &&
                !startInputRef.current.contains(event.target as Node)
            ) {
                setShowStartDropdown(false)
            }
            if (
                endDropdownRef.current &&
                !endDropdownRef.current.contains(event.target as Node) &&
                endInputRef.current &&
                !endInputRef.current.contains(event.target as Node)
            ) {
                setShowEndDropdown(false)
            }
        }

        if (showStartDropdown || showEndDropdown) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }
    }, [showStartDropdown, showEndDropdown])

    // Scroll to selected hour/minute in dropdown
    useEffect(() => {
        if (showStartDropdown && startDropdownRef.current) {
            const hourCol = startDropdownRef.current.querySelector('.wbk_businessHours__hourColumn') as HTMLElement
            const minuteCol = startDropdownRef.current.querySelector('.wbk_businessHours__minuteColumn') as HTMLElement
            if (hourCol) {
                const selectedHour = hourCol.querySelector(`[data-hour="${startDisplayHour}"][data-period="${startDisplayPeriod || ''}"]`) as HTMLElement
                if (selectedHour) {
                    hourCol.scrollTop = selectedHour.offsetTop - hourCol.offsetHeight / 2 + selectedHour.offsetHeight / 2
                }
            }
            if (minuteCol) {
                const selectedMinute = minuteCol.querySelector(`[data-minute="${startDisplayMinute}"]`) as HTMLElement
                if (selectedMinute) {
                    minuteCol.scrollTop = selectedMinute.offsetTop - minuteCol.offsetHeight / 2 + selectedMinute.offsetHeight / 2
                }
            }
        }
    }, [showStartDropdown, startDisplayHour, startDisplayMinute, startDisplayPeriod])

    useEffect(() => {
        if (showEndDropdown && endDropdownRef.current) {
            const hourCol = endDropdownRef.current.querySelector('.wbk_businessHours__hourColumn') as HTMLElement
            const minuteCol = endDropdownRef.current.querySelector('.wbk_businessHours__minuteColumn') as HTMLElement
            if (hourCol) {
                const selectedHour = hourCol.querySelector(`[data-hour="${endDisplayHour}"][data-period="${endDisplayPeriod || ''}"]`) as HTMLElement
                if (selectedHour) {
                    hourCol.scrollTop = selectedHour.offsetTop - hourCol.offsetHeight / 2 + selectedHour.offsetHeight / 2
                }
            }
            if (minuteCol) {
                const selectedMinute = minuteCol.querySelector(`[data-minute="${endDisplayMinute}"]`) as HTMLElement
                if (selectedMinute) {
                    minuteCol.scrollTop = selectedMinute.offsetTop - minuteCol.offsetHeight / 2 + selectedMinute.offsetHeight / 2
                }
            }
        }
    }, [showEndDropdown, endDisplayHour, endDisplayMinute, endDisplayPeriod])

    return (
        <div className="wbk_businessHours__timeSlotRow">
            <Toggle
                value={isActive}
                onChange={(enabled) =>
                    onStatusChange(enabled ? 'active' : 'inactive')
                }
                className="wbk_businessHours__slotToggle"
            />
            <div
                ref={startInputRef}
                className={`wbk_businessHours__timeInputWrapper ${
                    !isActive ? 'wbk_businessHours__timeInputWrapper--disabled' : ''
                }`}
                onClick={() => {
                    if (isActive) {
                        setShowStartDropdown(true)
                        setShowEndDropdown(false)
                    }
                }}
            >
                <div className="wbk_businessHours__timeDisplay">
                    {formatDisplayTime(startDisplayHour, startDisplayMinute, startDisplayPeriod)}
                    {!is24Hour && <span className="wbk_businessHours__periodLabel">{startDisplayPeriod}</span>}
                </div>
                <img src={clockIcon} alt="clock" className="wbk_businessHours__clockIcon" />
                {showStartDropdown && (
                    <div
                        ref={startDropdownRef}
                        className="wbk_businessHours__timeDropdown"
                    >
                        <div className="wbk_businessHours__timeSelectorColumns">
                            <div
                                className="wbk_businessHours__hourColumn"
                                onMouseDown={(e) => {
                                    const column = e.currentTarget
                                    handleColumnMouseDown(e, column)
                                }}
                            >
                                {hourOptions.map((option, idx) => {
                                    const isSelected = is24Hour
                                        ? option.value === startDisplayHour
                                        : option.value === startDisplayHour && option.period === startDisplayPeriod
                                    return (
                                        <div
                                            key={is24Hour ? option.value : `${option.value}-${option.period}-${idx}`}
                                            className={`wbk_businessHours__timeOption ${isSelected ? 'wbk_businessHours__timeOption--selected' : ''}`}
                                            data-hour={option.value}
                                            data-period={option.period || ''}
                                            onMouseUp={(e) => {
                                                // Only handle click if not dragging
                                                if (!dragStateRef.current.hasMoved && !dragStateRef.current.isDragging) {
                                                    handleStartHourSelect(option.value, option.period)
                                                }
                                                // Reset flag after a short delay
                                                setTimeout(() => {
                                                    dragStateRef.current.hasMoved = false
                                                }, 100)
                                            }}
                                        >
                                            {option.label}
                                            {!is24Hour && <span className="wbk_businessHours__periodLabel">{option.period}</span>}
                                        </div>
                                    )
                                })}
                            </div>
                            <div
                                className="wbk_businessHours__minuteColumn"
                                onMouseDown={(e) => {
                                    const column = e.currentTarget
                                    handleColumnMouseDown(e, column)
                                }}
                            >
                                {minuteOptions.map((option) => {
                                    const isSelected = option.value === startDisplayMinute
                                    return (
                                        <div
                                            key={option.value}
                                            className={`wbk_businessHours__timeOption ${isSelected ? 'wbk_businessHours__timeOption--selected' : ''}`}
                                            data-minute={option.value}
                                            onMouseUp={(e) => {
                                                // Only handle click if not dragging
                                                if (!dragStateRef.current.hasMoved && !dragStateRef.current.isDragging) {
                                                    handleStartMinuteSelect(option.value)
                                                }
                                                // Reset flag after a short delay
                                                setTimeout(() => {
                                                    dragStateRef.current.hasMoved = false
                                                }, 100)
                                            }}
                                        >
                                            {option.label}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <span className="wbk_businessHours__timeSeparator">-</span>
            <div
                ref={endInputRef}
                className={`wbk_businessHours__timeInputWrapper ${
                    !isActive ? 'wbk_businessHours__timeInputWrapper--disabled' : ''
                }`}
                onClick={() => {
                    if (isActive) {
                        setShowEndDropdown(true)
                        setShowStartDropdown(false)
                    }
                }}
            >
                <div className="wbk_businessHours__timeDisplay">
                    {formatDisplayTime(endDisplayHour, endDisplayMinute, endDisplayPeriod)}
                    {!is24Hour && <span className="wbk_businessHours__periodLabel">{endDisplayPeriod}</span>}
                </div>
                <img src={clockIcon} alt="clock" className="wbk_businessHours__clockIcon" />
                {showEndDropdown && (
                    <div
                        ref={endDropdownRef}
                        className="wbk_businessHours__timeDropdown"
                    >
                        <div className="wbk_businessHours__timeSelectorColumns">
                            <div
                                className="wbk_businessHours__hourColumn"
                                onMouseDown={(e) => {
                                    const column = e.currentTarget
                                    handleColumnMouseDown(e, column)
                                }}
                            >
                                {hourOptions.map((option, idx) => {
                                    const isSelected = is24Hour
                                        ? option.value === endDisplayHour
                                        : option.value === endDisplayHour && option.period === endDisplayPeriod
                                    return (
                                        <div
                                            key={is24Hour ? option.value : `${option.value}-${option.period}-${idx}`}
                                            className={`wbk_businessHours__timeOption ${isSelected ? 'wbk_businessHours__timeOption--selected' : ''}`}
                                            data-hour={option.value}
                                            data-period={option.period || ''}
                                            onMouseUp={(e) => {
                                                // Only handle click if not dragging
                                                if (!dragStateRef.current.hasMoved && !dragStateRef.current.isDragging) {
                                                    handleEndHourSelect(option.value, option.period)
                                                }
                                                // Reset flag after a short delay
                                                setTimeout(() => {
                                                    dragStateRef.current.hasMoved = false
                                                }, 100)
                                            }}
                                        >
                                            {option.label}
                                            {!is24Hour && <span className="wbk_businessHours__periodLabel">{option.period}</span>}
                                        </div>
                                    )
                                })}
                            </div>
                            <div
                                className="wbk_businessHours__minuteColumn"
                                onMouseDown={(e) => {
                                    const column = e.currentTarget
                                    handleColumnMouseDown(e, column)
                                }}
                            >
                                {minuteOptions.map((option) => {
                                    const isSelected = option.value === endDisplayMinute
                                    return (
                                        <div
                                            key={option.value}
                                            className={`wbk_businessHours__timeOption ${isSelected ? 'wbk_businessHours__timeOption--selected' : ''}`}
                                            data-minute={option.value}
                                            onMouseUp={(e) => {
                                                // Only handle click if not dragging
                                                if (!dragStateRef.current.hasMoved && !dragStateRef.current.isDragging) {
                                                    handleEndMinuteSelect(option.value)
                                                }
                                                // Reset flag after a short delay
                                                setTimeout(() => {
                                                    dragStateRef.current.hasMoved = false
                                                }, 100)
                                            }}
                                        >
                                            {option.label}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <button
                type="button"
                className="wbk_businessHours__removeButton"
                onClick={onRemove}
                disabled={!isActive}
            >
                <img src={trashIcon} alt="remove" />
            </button>
        </div>
    )
}
