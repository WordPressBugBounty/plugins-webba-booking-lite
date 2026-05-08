import { useEffect, useMemo, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
import { useSelect } from '@wordpress/data'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { useField } from '../../lib/hooks/useField'
import { Label } from '../Label/Label'
import { convertToJSFormat } from '../../utils/dateTime'
import { Validators } from '../../utils/validation'
import { store_name } from '../../../../../store/backend'
import calendarIcon from '../../../../../../public/images/icon-calendar.svg'
import trashIcon from '../../../../../../public/images/icon-trash.svg'
import plusIcon from '../../../../../../public/images/icon-plus-green.svg'
import './AvailabilityRangesField.scss'
import 'react-datepicker/dist/react-datepicker.css'
import { __ } from '@wordpress/i18n'

type DateRangeItem = {
    startDate: Date | null
    endDate: Date | null
}

const parseDate = (raw: unknown): Date | null => {
    if (!raw || typeof raw !== 'string') return null
    const date = /^\d{4}-\d{2}-\d{2}$/.test(raw)
        ? new Date(`${raw}T00:00:00`)
        : new Date(raw)
    return Number.isNaN(date.getTime()) ? null : date
}

const parseRangesFromValue = (value: unknown): DateRangeItem[] => {
    if (!value) return []
    let parsed: any = value

    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) return []
        try {
            parsed = JSON.parse(trimmed)
            if (typeof parsed === 'string') {
                parsed = JSON.parse(parsed)
            }
        } catch {
            return []
        }
    }

    const rows = Array.isArray(parsed?.availability_ranges)
        ? parsed.availability_ranges
        : Array.isArray(parsed)
          ? parsed
          : []

    return rows.map((row: any) => ({
        startDate: parseDate(row?.start_date),
        endDate: parseDate(row?.end_date),
    }))
}

const serializeRanges = (ranges: DateRangeItem[]) => {
    const payload = {
        availability_ranges: ranges
            .filter((item) => item.startDate && item.endDate)
            .map((item) => ({
                start_date: format(item.startDate as Date, 'yyyy-MM-dd'),
                end_date: format(item.endDate as Date, 'yyyy-MM-dd'),
            })),
    }
    return JSON.stringify(payload)
}

export const createAvailabilityRangesField: FormComponentConstructor<any> = ({
    field,
}) => {
    field.setValidators([Validators.availabilityRangesNoIntersection])

    return ({ name, label, misc }: FormFieldProps) => {
        const { settings } = useSelect(
            // @ts-ignore
            (select) => select(store_name).getPreset(),
            []
        )
        const { value, setValue, errors } = useField(field)
        const [touched, setTouched] = useState(false)
        const [ranges, setRanges] = useState<DateRangeItem[]>([])
        const [initialized, setInitialized] = useState(false)
        const [calendarOpen, setCalendarOpen] = useState(false)
        const [editingIndex, setEditingIndex] = useState<number | null>(null)
        const [calendarRange, setCalendarRange] = useState<[Date | null, Date | null]>([
            null,
            null,
        ])
        const [activeInputRef, setActiveInputRef] = useState<HTMLInputElement | null>(
            null
        )
        const wrapperRef = useRef<HTMLDivElement>(null)
        const inputRefs = useRef<(HTMLInputElement | null)[]>([])
        const emptyInputRef = useRef<HTMLInputElement | null>(null)

        const displayFormat =
            (settings?.date_format && convertToJSFormat(settings.date_format)) ||
            'dd.MM.yyyy'

        useEffect(() => {
            if (initialized) return
            setRanges(parseRangesFromValue(value))
            setInitialized(true)
        }, [initialized, value])

        useEffect(() => {
            if (!initialized) return
            setValue(serializeRanges(ranges))
        }, [initialized, ranges, setValue])

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

        const formatRangeForDisplay = (item: DateRangeItem) => {
            const start = item.startDate ? format(item.startDate, displayFormat) : ''
            const end = item.endDate ? format(item.endDate, displayFormat) : ''
            if (start && end) return `${start} - ${end}`
            return start || end || ''
        }

        const handleRangeChange = (newRange: [Date | null, Date | null]) => {
            setCalendarRange(newRange)
            if (editingIndex === null) return
            setRanges((prev) =>
                prev.map((item, index) =>
                    index === editingIndex
                        ? { startDate: newRange[0], endDate: newRange[1] }
                        : item
                )
            )
            if (newRange[0] && newRange[1]) {
                setCalendarOpen(false)
                setTouched(true)
            }
        }

        const handleDeleteRange = (indexToDelete: number) => {
            setRanges((prev) => prev.filter((_, index) => index !== indexToDelete))
            setTouched(true)
        }

        const openEditor = (index: number) => {
            setEditingIndex(index)
            const selected = ranges[index] || { startDate: null, endDate: null }
            setCalendarRange([selected.startDate, selected.endDate])
            const input = inputRefs.current[index]
            if (input) {
                setActiveInputRef(input)
                setCalendarOpen(true)
            }
        }

        const handleAddRange = () => {
            setRanges((prev) => {
                const next = [...prev, { startDate: null, endDate: null }]
                const nextIndex = next.length - 1
                setTimeout(() => openEditor(nextIndex), 0)
                return next
            })
        }

        const handleEmptyInputFocus = () => {
            setEditingIndex(null)
            if (emptyInputRef.current) {
                setActiveInputRef(emptyInputRef.current)
                setCalendarOpen(true)
                setCalendarRange([null, null])
            }
        }

        const handleCreateFromCalendar = (newRange: [Date | null, Date | null]) => {
            setCalendarRange(newRange)
            if (!newRange[0] || !newRange[1]) return
            setRanges((prev) => [...prev, { startDate: newRange[0], endDate: newRange[1] }])
            setCalendarOpen(false)
            setTouched(true)
        }

        return (
            <div className="wbk_availabilityRangesField__fieldWrapper" ref={wrapperRef}>
                <Label title={label} id={name} tooltip={misc?.tooltip} />

                {ranges.length > 0 && (
                    <div className="wbk_availabilityRangesField__datesList">
                        {ranges.map((item, index) => (
                            <div key={index} className="wbk_availabilityRangesField__dateItem">
                                <div className="wbk_availabilityRangesField__inputContainer">
                                    <div className="wbk_availabilityRangesField__inputWrapper">
                                        <input
                                            ref={(el) => {
                                                inputRefs.current[index] = el
                                            }}
                                            type="text"
                                            className="wbk_availabilityRangesField__dateInput"
                                            value={formatRangeForDisplay(item)}
                                            readOnly
                                            placeholder="dd.mm.yyyy - dd.mm.yyyy"
                                            onFocus={() => openEditor(index)}
                                        />
                                        {calendarOpen &&
                                            activeInputRef === inputRefs.current[index] && (
                                                <div className="wbk_availabilityRangesField__calendarWrapper">
                                                    <DatePicker
                                                        selected={calendarRange[0]}
                                                        onChange={(r: [Date | null, Date | null]) =>
                                                            handleRangeChange(r)
                                                        }
                                                        startDate={calendarRange[0]}
                                                        endDate={calendarRange[1]}
                                                        selectsRange
                                                        inline
                                                        calendarClassName="wbk_availabilityRangesField__calendar"
                                                        dayClassName={() => 'wbk_availabilityRangesField__day wbk_availabilityRangesField__day--dayNotSelected'}
                                                    />
                                                </div>
                                            )}
                                    </div>
                                    <button
                                        type="button"
                                        className="wbk_availabilityRangesField__calendarButton"
                                        onClick={() => openEditor(index)}
                                    >
                                        <img
                                            src={calendarIcon}
                                            alt="Calendar"
                                            className="wbk_availabilityRangesField__calendarIcon"
                                        />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    className="wbk_availabilityRangesField__deleteButton"
                                    onClick={() => handleDeleteRange(index)}
                                >
                                    <img
                                        src={trashIcon}
                                        alt="Delete"
                                        className="wbk_availabilityRangesField__deleteIcon"
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {ranges.length === 0 && (
                    <div className="wbk_availabilityRangesField__inputContainer">
                        <div className="wbk_availabilityRangesField__inputWrapper">
                            <input
                                ref={emptyInputRef}
                                type="text"
                                className="wbk_availabilityRangesField__dateInput"
                                placeholder="dd.mm.yyyy - dd.mm.yyyy"
                                readOnly
                                onFocus={handleEmptyInputFocus}
                            />
                            {calendarOpen && activeInputRef === emptyInputRef.current && (
                                <div className="wbk_availabilityRangesField__calendarWrapper">
                                    <DatePicker
                                        selected={calendarRange[0]}
                                        onChange={(r: [Date | null, Date | null]) =>
                                            handleCreateFromCalendar(r)
                                        }
                                        startDate={calendarRange[0]}
                                        endDate={calendarRange[1]}
                                        selectsRange
                                        inline
                                        calendarClassName="wbk_availabilityRangesField__calendar"
                                        dayClassName={() => 'wbk_availabilityRangesField__day wbk_availabilityRangesField__day--dayNotSelected'}
                                    />
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            className="wbk_availabilityRangesField__calendarButton"
                            onClick={handleEmptyInputFocus}
                        >
                            <img
                                src={calendarIcon}
                                alt="Calendar"
                                className="wbk_availabilityRangesField__calendarIcon"
                            />
                        </button>
                    </div>
                )}

                <button
                    type="button"
                    className="wbk_availabilityRangesField__addButton"
                    onClick={handleAddRange}
                >
                    <img
                        src={plusIcon}
                        alt="Add"
                        className="wbk_availabilityRangesField__plusIcon"
                    />
                    <span>{__('Add range', 'webba-booking-lite')}</span>
                </button>

                {errors.length > 0 && touched && (
                    <div className="wbk_availabilityRangesField__error">{errors[0]}</div>
                )}
            </div>
        )
    }
}
