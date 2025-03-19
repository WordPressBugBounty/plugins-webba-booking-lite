import { useCallback, useEffect, useMemo } from 'react'
import { Button } from '../../../Button/Button'
import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { validateIntersection, ValidatorFn } from '../../utils/validation'
import { Label } from '../Label/Label'
import { BusinessDay as BusinessDayComponent } from './BusinessDay'
import styles from './BusinessHours.module.scss'
import { BusinessDay } from './types'
import { __ } from '@wordpress/i18n'

const businessHoursValidator: ValidatorFn<
    BusinessDay[] | string | undefined
> = (days) => {
    let daysObj = days

    try {
        daysObj = JSON.parse(days as string)
    } catch (e) {}

    if (!daysObj) return null

    const isValid = validateIntersection(daysObj as BusinessDay[])

    if (!isValid) {
        return __('Business hours overlapped', 'webba-booking-lite')
    }

    return null
}

export const createBusinessHoursField: FormComponentConstructor<any> = ({
    field,
    fieldConfig,
}) => {
    field.setValidators([businessHoursValidator])

    return ({ name, label }) => {
        const newDay = {
            day_of_week: '1',
            start: 32400,
            end: 64800,
            status: 'active',
        }

        const formField = useField(field)

        const { value, setValue, errors } = formField

        const valueObj: BusinessDay[] = useMemo(() => {
            try {
                return JSON.parse(value)
            } catch (e) {
                return value
            }
        }, [value])

        const addBusinessDay = useCallback(
            (day: BusinessDay) => {
                const oldValue = Array.isArray(valueObj) ? [...valueObj] : []

                oldValue.push({
                    ...day,
                    day_of_week:
                        (parseInt(
                            (oldValue[oldValue.length - 1]
                                ?.day_of_week as string) || '0'
                        ) %
                            7) +
                        1,
                    start: oldValue[oldValue.length - 1]?.start || 32400,
                    end: oldValue[oldValue.length - 1]?.end || 64800,
                })

                setValue(oldValue)
            },
            [valueObj]
        )

        useEffect(() => {
            if (Array.isArray(valueObj)) {
                return
            }

            let mockDays = []

            for (let i = 1; i <= 5; i++) {
                mockDays.push({ ...newDay, day_of_week: i.toString() })
                setValue(mockDays)
            }
        }, [])

        return (
            <div>
                <Label
                    title={label}
                    id={name}
                    tooltip={fieldConfig.misc?.tooltip}
                />
                <div className={styles.daysWrapper}>
                    {valueObj &&
                        valueObj.map((day, index) => (
                            <BusinessDayComponent
                                index={index}
                                field={formField}
                            />
                        ))}
                </div>
                <div className={styles.buttonGroup}>
                    <Button
                        type="secondary"
                        onClick={() => addBusinessDay(newDay)}
                    >
                        {__('Add time interval', 'webba-booking-lite')}
                    </Button>
                </div>
                {!!errors.length && (
                    <div className={styles.error}>{errors[0]}</div>
                )}
            </div>
        )
    }
}
