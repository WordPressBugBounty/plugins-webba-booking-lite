import { useLayoutEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'
import { FormFieldProps } from '../../types'
import 'react-datepicker/dist/react-datepicker.css'
import { Label } from '../Label/Label'
import { FormComponentConstructor } from '../../lib/types'
import { useField } from '../../lib/hooks/useField'
import { format, fromUnixTime } from 'date-fns'

import './DateField.scss'
import {
    fetchConnectedOptions,
    isConnectedField,
} from '../GenericSelectField/utils'
import { getFormState } from '../../lib/utils'
import { useForm } from '../../lib/FormProvider'
import { toZonedTime } from 'date-fns-tz'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import classNames from 'classnames'
import { convertToJSFormat } from '../../utils/dateTime'

export const createDateField: FormComponentConstructor<any> = ({
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
        const [date, setDate] = useState<Date | null>(new Date())
        const [open, setOpen] = useState(false)
        const form = useMemo(() => useForm(), [date])
        const [initialized, setInitialized] = useState(false)

        useLayoutEffect(() => {
            if (value && !isNaN(value) && !initialized) {
                setInitialized(true)
                setDate(toZonedTime(fromUnixTime(value), settings?.timezone))
            } else if (
                value &&
                isNaN(value) &&
                typeof value === 'string' &&
                !initialized
            ) {
                setInitialized(true)
                setDate(toZonedTime(new Date(value), settings?.timezone))
            }
        }, [value])

        useLayoutEffect(() => {
            if (date && typeof date === 'object') {
                setValue(format(date, 'yyyy-MM-dd'))
            }

            if (isConnectedField(fieldConfig?.modelName as string, name)) {
                fetchConnectedOptions(fieldConfig?.modelName as string, name, {
                    ...getFormState(form).values,
                    id: form.defaultValue.id,
                })
            }
        }, [date])

        return (
            <div
                className={classNames('wbk_formDateField__inputWrapper', {
                    'wbk_formDateField__inputWrapper--open': open,
                })}
            >
                <Label title={label} id={name} tooltip={misc?.tooltip} />
                <DatePicker
                    className={classNames('wbk_formDateField__dateInput', {
                        'wbk_formDateField__dateInput--focused': open,
                    })}
                    calendarClassName="wbk_formDateField__calendar"
                    dayClassName={() => 'wbk_formDateField__day'}
                    isClearable={true}
                    closeOnScroll={true}
                    dateFormat={
                        (settings?.date_format &&
                            convertToJSFormat(settings?.date_format)) ||
                        'MMM d, yyyy'
                    }
                    selected={date}
                    onChange={(dateParam: any) => {
                        setOpen(false)
                        setDate(dateParam)
                    }}
                    onBlur={() => setTouched(true)}
                    open={open}
                    onClickOutside={() => setOpen(false)}
                    onInputClick={() => setOpen(true)}
                />
                {errors.length > 0 && touched && (
                    <div className="wbk_formDateField__error">{errors[0]}</div>
                )}
            </div>
        )
    }
}
