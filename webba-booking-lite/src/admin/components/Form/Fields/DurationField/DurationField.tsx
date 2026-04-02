import { useEffect, useRef, useState } from 'react'
import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { Label } from '../Label/Label'
import './DurationField.scss'
import classNames from 'classnames'

export const createDurationField: FormComponentConstructor<number> = ({
    field,
    fieldConfig,
}) => {
    return ({ name, label, misc }: FormFieldProps) => {
        const { value, setValue, errors } = useField(field)
        const totalMinutes = value || 0

        // Convert total minutes to hours and minutes
        const [hours, setHours] = useState<number | ''>(totalMinutes === 0 ? '' : Math.floor(totalMinutes / 60))
        const [minutes, setMinutes] = useState<number | ''>(totalMinutes === 0 ? '' : totalMinutes % 60)
        const hoursInputRef = useRef<HTMLInputElement>(null)
        const minutesInputRef = useRef<HTMLInputElement>(null)
        const [hoursFocused, setHoursFocused] = useState(false)
        const [minutesFocused, setMinutesFocused] = useState(false)
        // Update local state when value changes externally
        useEffect(() => {
            if (totalMinutes === 0) {
                setHours('')
                setMinutes('')
            } else {
                const newHours = Math.floor(totalMinutes / 60)
                const newMinutes = totalMinutes % 60
                setHours(newHours)
                setMinutes(newMinutes)
            }
        }, [totalMinutes])

        const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value
            if (inputValue === '') {
                setHours('')
                const currentMinutes = minutes === '' ? 0 : minutes
                setValue(currentMinutes as number)
                return
            }
            const newHours = Math.max(0, parseInt(inputValue) || 0)
            setHours(newHours)
            // Convert to total minutes
            const currentMinutes = minutes === '' ? 0 : minutes
            const totalMins = newHours * 60 + (currentMinutes as number)
            setValue(totalMins)
        }

        const handleMinutesChange = (
            e: React.ChangeEvent<HTMLInputElement>
        ) => {
            const inputValue = e.target.value
            if (inputValue === '') {
                setMinutes('')
                const currentHours = hours === '' ? 0 : hours
                setValue((currentHours as number) * 60)
                return
            }
            const newMinutes = parseInt(inputValue) || 0
            // Ensure minutes are between 0 and 59
            const clampedMinutes = Math.max(0, Math.min(59, newMinutes))
            setMinutes(clampedMinutes)
            // Convert to total minutes
            const currentHours = hours === '' ? 0 : hours
            const totalMins = (currentHours as number) * 60 + clampedMinutes
            setValue(totalMins)
        }

        const handleHoursFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            if (hours === 0) {
                setHours('')
            }
            setHoursFocused(true)
        }

        const handleHoursBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            if (hours === '') {
                setHours(0)
                const currentMinutes = minutes === '' ? 0 : minutes
                setValue(currentMinutes as number)
            }
            setHoursFocused(false)
        }

        const handleMinutesFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            if (minutes === 0) {
                setMinutes('')
            }
            setMinutesFocused(true)
        }

        const handleMinutesBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            if (minutes === '') {
                setMinutes(0)
                const currentHours = hours === '' ? 0 : hours
                setValue((currentHours as number) * 60)
            }
            setMinutesFocused(false)
        }

        return (
            <div className={classNames('wbk_durationField', { 'wbk_durationField--invalid': errors && errors.length > 0 })}>
                <Label title={label} id={name} tooltip={misc?.tooltip} />
                <div className="wbk_durationField__inputsContainer">
                    <div className={classNames('wbk_durationField__inputWrapper', {
                        'wbk_durationField__inputWrapper--focused': hoursFocused,
                    })}>
                        <input
                            type="number"
                            className="wbk_durationField__input"
                            value={hours}
                            onChange={handleHoursChange}
                            onFocus={handleHoursFocus}
                            onBlur={handleHoursBlur}
                            min={0}
                            id={`${name}-hours`}
                            ref={hoursInputRef}
                        />
                        <span className="wbk_durationField__label">hours</span>
                    </div>
                    <div className={classNames('wbk_durationField__inputWrapper', {
                        'wbk_durationField__inputWrapper--focused': minutesFocused,
                    })}>
                        <input
                            type="number"
                            className="wbk_durationField__input"
                            value={minutes}
                            onChange={handleMinutesChange}
                            onFocus={handleMinutesFocus}
                            onBlur={handleMinutesBlur}
                            min={0}
                            max={59}
                            id={`${name}-minutes`}
                            ref={minutesInputRef}
                        />
                        <span className="wbk_durationField__label">mins</span>
                    </div>
                </div>
                {errors && errors.length > 0 && (
                    <div className="wbk_durationField__errorContainer">{errors[0]}</div>
                )}
            </div>
        )
    }
}

