import { useEffect, useState } from 'react'
import { useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { useField } from '../../lib/hooks/useField'
import { Label } from '../Label/Label'
import { ValidatorFn } from '../../utils/validation'
import { store_name } from '../../../../../store/backend'
import { convertToJSFormat } from '../../utils/dateTime'
import { DateTimeRangeRow } from './DateTimeRangeRow'
import { DateTimeRangeItem } from './types'
import {
    createDefaultTimeSlot,
    parseRangesFromValue,
    serializeRanges,
    validateDateTimeRangesValue,
} from './utils'
import plusIcon from '../../../../../../public/images/icon-plus-green.svg'
import './DateTimeRangesField.scss'

const dateTimeRangesValidator: ValidatorFn<string | undefined> = (value) =>
    validateDateTimeRangesValue(value)

export const createDateTimeRangesField: FormComponentConstructor<any> = ({
    field,
}) => {
    field.setValidators([dateTimeRangesValidator])

    return ({ name, label, misc }: FormFieldProps) => {
        const { settings } = useSelect(
            // @ts-ignore
            (select) => select(store_name).getPreset(),
            []
        )
        const { value, setValue, errors } = useField(field)
        const [touched, setTouched] = useState(false)
        const [ranges, setRanges] = useState<DateTimeRangeItem[]>([])
        const [initialized, setInitialized] = useState(false)

        const displayFormat =
            (settings?.date_format && convertToJSFormat(settings.date_format)) ||
            'dd.MM.yyyy'

        useEffect(() => {
            if (initialized) {
                return
            }
            setRanges(parseRangesFromValue(value))
            setInitialized(true)
        }, [initialized, value])

        useEffect(() => {
            if (!initialized) {
                return
            }

            const nextSerialized = serializeRanges(ranges)
            const currentValue =
                typeof value === 'string' ? value.trim() : String(value ?? '').trim()

            if (nextSerialized !== currentValue) {
                setValue(nextSerialized)
            }
        }, [initialized, ranges, setValue, value])

        const handleRangeChange = (index: number, next: DateTimeRangeItem) => {
            setRanges((prev) =>
                prev.map((item, itemIndex) =>
                    itemIndex === index ? next : item
                )
            )
            setTouched(true)
        }

        const handleRemoveRange = (index: number) => {
            setRanges((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
            setTouched(true)
        }

        const handleAddRange = () => {
            setRanges((prev) => [
                ...prev,
                {
                    startDate: null,
                    endDate: null,
                    timeSlots: [createDefaultTimeSlot()],
                },
            ])
            setTouched(true)
        }

        return (
            <div className="wbk_dateTimeRangesField__fieldWrapper">
                <Label title={label} id={name} tooltip={misc?.tooltip} />
                {misc?.description && (
                    <div className="wbk_dateTimeRangesField__description">
                        {misc.description}
                    </div>
                )}

                {ranges.length > 0 && (
                    <div className="wbk_dateTimeRangesField__rangesList">
                        {ranges.map((item, index) => (
                            <DateTimeRangeRow
                                key={index}
                                item={item}
                                displayFormat={displayFormat}
                                onChange={(next) => handleRangeChange(index, next)}
                                onRemove={() => handleRemoveRange(index)}
                            />
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    className="wbk_dateTimeRangesField__addButton"
                    onClick={handleAddRange}
                >
                    <img
                        src={plusIcon}
                        alt=""
                        className="wbk_dateTimeRangesField__plusIcon"
                    />
                    <span>{__('Add date range', 'webba-booking-lite')}</span>
                </button>

                {errors.length > 0 && touched && (
                    <div className="wbk_dateTimeRangesField__error">
                        {errors[0]}
                    </div>
                )}
            </div>
        )
    }
}
