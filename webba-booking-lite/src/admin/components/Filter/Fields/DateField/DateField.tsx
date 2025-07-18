import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './DateField.module.scss'
import { IFilterFieldProps } from '../../types'
import { useFilterField } from '../../hooks/useFilterField'
import { formatWbkDate } from '../../utils'
import { Label } from '../../../Form/Fields/Label/Label'

export const DateField = ({
    name,
    label,
    placeholder,
    misc,
}: IFilterFieldProps) => {
    const { setFilter } = useFilterField(name)
    const [date, setDate] = useState<Date>(new Date())
    const [open, setOpen] = useState(false)

    useEffect(() => setFilter((date && formatWbkDate(date)) || ''), [date])

    return (
        <div className={styles.inputWrapper}>
            {label && <Label title={label} id={name} />}
            <DatePicker
                className={styles.dateInput}
                calendarClassName={styles.calendar}
                dayClassName={() => styles.day}
                isClearable={true}
                closeOnScroll={true}
                dateFormat={'MMM d, yyyy'}
                selected={date}
                onChange={(date: any) => {
                    setOpen(false)
                    setDate(date)
                }}
                open={open}
                onClickOutside={() => setOpen(false)}
                onInputClick={() => setOpen(true)}
                placeholderText={placeholder}
            />
        </div>
    )
}
