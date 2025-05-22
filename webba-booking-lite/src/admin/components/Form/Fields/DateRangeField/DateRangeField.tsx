import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import { FormFieldProps } from '../../types'
import 'react-datepicker/dist/react-datepicker.css'
import { Label } from '../Label/Label'
import { Validators } from '../../utils/validation'
import { FormComponentConstructor } from '../../lib/types'
import { useField } from '../../lib/hooks/useField'

import styles from './DateRangeField.module.scss'
import { formatWbkDate } from '../../utils/dateTime'

type DateRange = Date[] | null[]

export const createDateRangeField: FormComponentConstructor<any> = ({
    field,
}) => {
    field.setValidators([Validators.dateRange])

    return ({ name, label, misc }) => {
        const { value, setValue, errors } = useField(field)
        const [range, setRange] = useState<DateRange>([null, null])
        const [touched, setTouched] = useState(false)
        const [open, setOpen] = useState(false)

        const splitDates = useCallback((dates: string) => {
            return [
                new Date(dates.split(' - ')[0]),
                new Date(dates.split(' - ')[1]),
            ]
        }, [])

        useEffect(() => {
            if (!range[0] && !range[1] && value) {
                setRange(splitDates(value))
            }
        }, [])

        useEffect(() => {
            if (range[0] && range[1]) {
                setValue(
                    formatWbkDate(range[0]) + ' - ' + formatWbkDate(range[1])
                )
            } else {
                setValue('')
            }
        }, [range])

        return (
            <div className={styles.inputWrapper}>
                <Label title={label} id={name} tooltip={misc?.tooltip} />
                <DatePicker
                    className={styles.dateInput}
                    calendarClassName={styles.calendar}
                    dayClassName={() => styles.day}
                    startDate={range[0]}
                    endDate={range[1]}
                    selectsRange={true}
                    isClearable={true}
                    closeOnScroll={true}
                    dateFormat={'MMM d, yyyy'}
                    onChange={(range: any) => {
                        if (range[0] && range[1]) {
                            setOpen(false)
                        }

                        setRange(range)
                    }}
                    onBlur={() => setTouched(true)}
                    open={open}
                    onClickOutside={() => setOpen(false)}
                    onInputClick={() => setOpen(true)}
                />
                {errors.length > 0 && touched && (
                    <div className={styles.error}>{errors[0]}</div>
                )}
            </div>
        )
    }
}
