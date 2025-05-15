import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import styles from './DateRangeField.module.scss'
import { IFilterFieldProps } from '../../types'
import { useFilterField } from '../../hooks/useFilterField'
import { formatWbkDate } from '../../utils'
import { Label } from '../../../Form/Fields/Label/Label'

type DateRange = Date[] | null[]

export const DateRangeField = ({
    name,
    label,
    placeholder,
    misc,
}: IFilterFieldProps) => {
    const { value, setFilter } = useFilterField(name)
    const isInitiated = useRef(false)
    const [open, setOpen] = useState(false)
    const isFirstRender = useRef(true)

    const splitDates = useCallback((dates: string) => {
        return [
            new Date(dates.split(' - ')[0]),
            new Date(dates.split(' - ')[1]),
        ]
    }, [])

    const initialValue = useMemo(
        () => (value && value.length && splitDates(value)) || [null, null],
        [value]
    )
    const [range, setRange] = useState<DateRange>(initialValue)
    const [isManually, setIsManually] = useState(false)

    useLayoutEffect(() => {
        if (!isInitiated.current) {
            isInitiated.current = true
            return
        }

        if (range[0] && range[1]) {
            setFilter(
                formatWbkDate(range[0]) + ' - ' + formatWbkDate(range[1]),
                isManually
            )
        } else {
            setFilter('', isManually)
        }

        setIsManually(false)
    }, [range])

    useLayoutEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        if (value && isInitiated.current) {
            setRange(splitDates(value))
        }
    }, [value])

    return (
        <div className={styles.inputWrapper}>
            {label && <Label title={label} id={name} />}
            <DatePicker
                className={styles.dateInput}
                calendarClassName={styles.calendar}
                dayClassName={() => styles.day}
                startDate={range[0]}
                endDate={range[1]}
                selectsRange={true}
                dateFormat={'MMM d, yyyy'}
                onChange={(range: any, e) => {
                    if (range[0] && range[1]) {
                        setOpen(false)
                    }

                    setRange(range)
                    setIsManually(true)
                }}
                closeOnScroll={true}
                shouldCloseOnSelect={true}
                open={open}
                onClickOutside={() => setOpen(false)}
                onInputClick={() => setOpen(true)}
                placeholderText={placeholder}
            />
        </div>
    )
}
