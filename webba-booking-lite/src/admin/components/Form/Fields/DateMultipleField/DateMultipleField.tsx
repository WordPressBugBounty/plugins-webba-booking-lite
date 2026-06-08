import { useLayoutEffect, useMemo, useState, useRef, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { FormFieldProps } from '../../types'
import 'react-datepicker/dist/react-datepicker.css'
import { Label } from '../Label/Label'
import { FormComponentConstructor } from '../../lib/types'
import { useField } from '../../lib/hooks/useField'
import { format, fromUnixTime } from 'date-fns'
import './DateMultipleField.scss'
import {
    fetchConnectedOptions,
    isConnectedField,
} from '../GenericSelectField/utils'
import { getFormState } from '../../lib/utils'
import { useForm } from '../../lib/FormProvider'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import classNames from 'classnames'
import {
    convertToJSFormat,
    formatCalendarDateString,
    isCalendarDateString,
    parseCalendarDateString,
    toLocalCalendarDate,
} from '../../utils/dateTime'
import calendarIcon from '../../../../../../public/images/icon-calendar.svg'
import trashIcon from '../../../../../../public/images/icon-trash.svg'
import plusIcon from '../../../../../../public/images/icon-plus-green.svg'

const parseDateMultipleToken = (token: string): Date | null => {
    const trimmed = token.trim()
    if (!trimmed) {
        return null
    }
    if (isCalendarDateString(trimmed)) {
        return parseCalendarDateString(trimmed)
    }
    if (!isNaN(Number(trimmed))) {
        return toLocalCalendarDate(fromUnixTime(Number(trimmed)))
    }
    const parsed = new Date(trimmed)
    return toLocalCalendarDate(parsed)
}

const serializeDateMultipleValue = (dates: Date[]): string =>
    dates.map((date) => formatCalendarDateString(date)).join(',')

export const createDateMultipleField: FormComponentConstructor<any> = ({
    field,
    fieldConfig,
}) => {
    return ({ name, label, misc }: FormFieldProps) => {
        const { settings } = useSelect(
            // @ts-ignore
            (select) => select(store_name).getPreset(),
            []
        )
        const { value, setValue, errors } = useField(field)
        const [touched, setTouched] = useState(false)
        const [selectedDates, setSelectedDates] = useState<Date[]>([])
        const [calendarOpen, setCalendarOpen] = useState(false)
        const [editingIndex, setEditingIndex] = useState<number | null>(null)
        const [calendarDate, setCalendarDate] = useState<Date | null>(new Date())
        const [activeInputRef, setActiveInputRef] = useState<HTMLInputElement | null>(null)
        const form = useMemo(() => useForm(), [])
        const [initialized, setInitialized] = useState(false)
        const datePickerRef = useRef<any>(null)
        const wrapperRef = useRef<HTMLDivElement>(null)
        const inputRefs = useRef<(HTMLInputElement | null)[]>([])
        const emptyInputRef = useRef<HTMLInputElement | null>(null)

        // Parse value to array of dates
        useEffect(() => {
            if (!initialized) {
                try {
                    let dates: Date[] = []
                    
                    if (value && typeof value === 'string' && value.trim() !== '') {
                        if (value.includes(',')) {
                            dates = value
                                .split(',')
                                .map((dateStr) => parseDateMultipleToken(dateStr))
                                .filter(
                                    (d: Date | null): d is Date =>
                                        d !== null && !isNaN(d.getTime())
                                )
                        } else if (value.trim().startsWith('[')) {
                            const parsed = JSON.parse(value)
                            if (Array.isArray(parsed)) {
                                dates = parsed
                                    .map((dateStr: string) =>
                                        parseDateMultipleToken(String(dateStr))
                                    )
                                    .filter(
                                        (d: Date | null): d is Date =>
                                            d !== null && !isNaN(d.getTime())
                                    )
                            }
                        } else {
                            const parsed = parseDateMultipleToken(String(value))
                            if (parsed) {
                                dates = [parsed]
                            }
                        }
                    }
                    
                    setSelectedDates(dates)
                    if (dates.length > 0) {
                        setCalendarDate(dates[dates.length - 1])
                    }
                } catch (e) {
                    console.error('Error parsing date multiple value:', e)
                } finally {
                    setInitialized(true)
                }
            }
        }, [value, initialized])

        useEffect(() => {
            if (!initialized) {
                return
            }

            const nextValue =
                selectedDates.length === 0
                    ? ''
                    : serializeDateMultipleValue(selectedDates)
            const currentValue =
                typeof value === 'string' ? value.trim() : String(value ?? '').trim()

            if (nextValue !== currentValue) {
                setValue(nextValue)
            }

            if (isConnectedField(fieldConfig?.modelName as string, name)) {
                fetchConnectedOptions(
                    fieldConfig?.modelName as string,
                    name,
                    {
                        ...getFormState(form).values,
                        id: form.defaultValue.id,
                    }
                )
            }
        }, [selectedDates, initialized, value, setValue, name, fieldConfig, form])

        const isDateSelected = (date: Date) => {
            const dateKey = formatCalendarDateString(date)
            return selectedDates.some(
                (selectedDate) =>
                    formatCalendarDateString(selectedDate) === dateKey
            )
        }

        const handleDateSelect = (date: Date | null) => {
            if (!date) return

            if (editingIndex !== null) {
                const calendarDate = toLocalCalendarDate(date) ?? date
                setSelectedDates((prev) => {
                    const newDates = [...prev]
                    newDates[editingIndex] = calendarDate
                    return newDates
                })
                setEditingIndex(null)
            } else {
                // Add new date or toggle selection
                setSelectedDates((prev) => {
                    const calendarDate =
                        toLocalCalendarDate(date) ?? date
                    const dateStr = formatCalendarDateString(calendarDate)
                    const isSelected = prev.some(
                        (d) => formatCalendarDateString(d) === dateStr
                    )

                    if (isSelected) {
                        return prev.filter(
                            (d) => formatCalendarDateString(d) !== dateStr
                        )
                    } else {
                        return [...prev, calendarDate]
                    }
                })
            }
            setCalendarOpen(false)
        }

        const handleDeleteDate = (indexToDelete: number) => {
            setSelectedDates((prev) =>
                prev.filter((_, index) => index !== indexToDelete)
            )
        }

        const handleAddHolidayClick = () => {
            const today = toLocalCalendarDate(new Date()) ?? new Date()
            setSelectedDates((prev) => {
                const newDates = [...prev, today]
                const newIndex = newDates.length - 1
                setEditingIndex(newIndex)
                setCalendarDate(today)
                
                setTimeout(() => {
                    setActiveInputRef(inputRefs.current[newIndex])
                    setCalendarOpen(true)
                }, 0)
                
                return newDates
            })
        }

        const handleEditDateClick = (index: number) => {
            setEditingIndex(index)
            setCalendarDate(selectedDates[index])
            const inputElement = inputRefs.current[index]
            if (inputElement) {
                setActiveInputRef(inputElement)
                setCalendarOpen(true)
            }
        }

        const handleInputFocus = (index: number) => {
            setEditingIndex(index)
            setCalendarDate(selectedDates[index])
            const inputElement = inputRefs.current[index]
            if (inputElement) {
                setActiveInputRef(inputElement)
                setCalendarOpen(true)
            }
        }

        const handleCalendarButtonClick = () => {
            setEditingIndex(null)
            if (emptyInputRef.current) {
                setActiveInputRef(emptyInputRef.current)
                setCalendarOpen(!calendarOpen)
            }
        }

        const handleEmptyInputFocus = () => {
            setEditingIndex(null)
            if (emptyInputRef.current) {
                setActiveInputRef(emptyInputRef.current)
                setCalendarOpen(true)
            }
        }

        const getDisplayFormat = () => {
            return (settings?.date_format &&
                convertToJSFormat(settings?.date_format)) ||
                'dd.MM.yyyy'
        }

        const formatDateForDisplay = (date: Date) => {
            return format(date, getDisplayFormat())
        }

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

        return (
            <div className={"wbk_dateMultipleField__fieldWrapper"} ref={wrapperRef}>
                <Label title={label} id={name} tooltip={misc?.tooltip} />
                {misc?.description && (
                    <div className={"wbk_dateMultipleField__description"}>{misc.description}</div>
                )}
                
                {selectedDates.length > 0 && (
                    <div className={"wbk_dateMultipleField__datesList"}>
                        {selectedDates.map((date, index) => (
                            <div key={index} className={"wbk_dateMultipleField__dateItem"}>
                                <div className={"wbk_dateMultipleField__inputContainer"}>
                                    <div className={"wbk_dateMultipleField__inputWrapper"}>
                                        <input
                                            ref={(el) => {
                                                inputRefs.current[index] = el
                                            }}
                                            type="text"
                                            className={"wbk_dateMultipleField__dateInput"}
                                            value={formatDateForDisplay(date)}
                                            readOnly
                                            placeholder="dd.mm.yyyy"
                                            onFocus={() => handleInputFocus(index)}
                                        />
                                        {calendarOpen && activeInputRef === inputRefs.current[index] && (
                                            <div className={"wbk_dateMultipleField__calendarWrapper"}>
                                                <DatePicker
                                                    ref={datePickerRef}
                                                    selected={calendarDate}
                                                    onChange={handleDateSelect}
                                                    inline
                                                    calendarClassName={"wbk_dateMultipleField__calendar"}
                                                    dayClassName={(date: Date) => {
                                                        const baseClass = 'wbk_dateMultipleField__day'
                                                        const isSelected = editingIndex !== null
                                                            ? formatCalendarDateString(selectedDates[editingIndex]) === formatCalendarDateString(date)
                                                            : isDateSelected(date)
                                                        const selectedClass = isSelected
                                                            ? ' wbk_dateMultipleField__day--daySelected'
                                                            : ' wbk_dateMultipleField__day--dayNotSelected'
                                                        return `${baseClass}${selectedClass}`
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className="wbk_dateMultipleField__calendarButton"
                                        onClick={() => handleEditDateClick(index)}
                                        aria-label="Edit date"
                                    >
                                        <img
                                            src={calendarIcon}
                                            alt="Calendar"
                                            className="wbk_dateMultipleField__calendarIcon"
                                        />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    className={"wbk_dateMultipleField__deleteButton"}
                                    onClick={() => handleDeleteDate(index)}
                                    aria-label="Delete date"
                                >
                                    <img
                                        src={trashIcon}
                                        alt="Delete"
                                        className={"wbk_dateMultipleField__deleteIcon"}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {selectedDates.length === 0 && (
                    <div className={"wbk_dateMultipleField__inputContainer"}>
                        <div className={"wbk_dateMultipleField__inputWrapper"}>
                            <input
                                ref={emptyInputRef}
                                type="text"
                                className={"wbk_dateMultipleField__dateInput"}
                                placeholder="dd.mm.yyyy"
                                readOnly
                                onFocus={handleEmptyInputFocus}
                            />
                            {calendarOpen && activeInputRef === emptyInputRef.current && (
                                <div className={"wbk_dateMultipleField__calendarWrapper"}>
                                    <DatePicker
                                        ref={datePickerRef}
                                        selected={calendarDate}
                                        onChange={handleDateSelect}
                                        inline
                                        calendarClassName={"wbk_dateMultipleField__calendar"}
                                        dayClassName={(date: Date) => {
                                            const baseClass = 'wbk_dateMultipleField__day'
                                            const isSelected = editingIndex !== null
                                                ? formatCalendarDateString(selectedDates[editingIndex]) === formatCalendarDateString(date)
                                                : isDateSelected(date)
                                            const selectedClass = isSelected
                                                ? ' wbk_dateMultipleField__day--daySelected'
                                                : ' wbk_dateMultipleField__day--dayNotSelected'
                                            return `${baseClass}${selectedClass}`
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            className="wbk_dateMultipleField__calendarButton"
                            onClick={handleCalendarButtonClick}
                            aria-label="Open calendar"
                        >
                            <img
                                src={calendarIcon}
                                alt="Calendar"
                                className="wbk_dateMultipleField__calendarIcon"
                            />
                        </button>
                    </div>
                )}

                <button
                    type="button"
                    className={"wbk_dateMultipleField__addButton"}
                    onClick={handleAddHolidayClick}
                >
                    <img
                        src={plusIcon}
                        alt="Add"
                        className={"wbk_dateMultipleField__plusIcon"}
                    />
                    <span>Add holiday</span>
                </button>

                {errors.length > 0 && touched && (
                    <div className={"wbk_dateMultipleField__error"}>{errors[0]}</div>
                )}
            </div>
        )
    }
}
