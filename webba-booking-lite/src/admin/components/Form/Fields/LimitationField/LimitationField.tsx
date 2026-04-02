import { useEffect, useRef, useState } from 'react'
import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { Label } from '../Label/Label'
import './LimitationField.scss'
import { useForm } from '../../lib/FormProvider'
import { useSnapshot } from 'valtio'
import classNames from 'classnames'
import { Validators } from '../../utils/validation'

export const createLimitationField: FormComponentConstructor<number> = ({
    field,
    fieldConfig,
}) => {
    return ({ name, label, misc }: FormFieldProps) => {
        const form = useForm()
        const { errors } = useField(field)
        
        const minFieldName = misc?.min_field || 'min_quantity'
        const maxFieldName = misc?.max_field || 'quantity'
        
        const minField = form.fields[minFieldName]
        const maxField = form.fields[maxFieldName]
        
        const minValueSnapshot = minField ? useSnapshot(minField.value) : { value: 0 }
        const maxValueSnapshot = maxField ? useSnapshot(maxField.value) : { value: 0 }
        
        const minValue = Number(minValueSnapshot.value) || 0
        const maxValue = Number(maxValueSnapshot.value) || 0
        
        const [min, setMin] = useState<number | ''>(minValue === 0 ? '' : minValue)
        const [max, setMax] = useState<number | ''>(maxValue === 0 ? '' : maxValue)
        const minInputRef = useRef<HTMLInputElement>(null)
        const maxInputRef = useRef<HTMLInputElement>(null)
        const [minFocused, setMinFocused] = useState(false)
        const [maxFocused, setMaxFocused] = useState(false)
        const minMaxValidatorAddedRef = useRef<WeakSet<object>>(new WeakSet())

        // Add validator: min cannot be greater than max
        useEffect(() => {
            if (!minField || !maxField) return
            if (minMaxValidatorAddedRef.current.has(minField as object)) return
            minMaxValidatorAddedRef.current.add(minField as object)
            minField.addValidator(
                Validators.minNotGreaterThanMax(maxField.value)
            )
        }, [minField, maxField])

        useEffect(() => {
            const currentMin = minValue
            const currentMax = maxValue
            
            if (currentMin === 0) {
                setMin('')
            } else {
                setMin(currentMin)
            }
            
            if (currentMax === 0) {
                setMax('')
            } else {
                setMax(currentMax)
            }
        }, [minValue, maxValue])
        
        const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value
            if (inputValue === '') {
                setMin('')
                if (minField) {
                    minField.setValue(0)
                }
                return
            }
            const newMin = Math.max(0, parseInt(inputValue) || 0)
            setMin(newMin)
            if (minField) {
                minField.setValue(String(newMin))
            }
            setMinFocused(false)
        }
        
        const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value
            if (inputValue === '') {
                setMax('')
                if (maxField) {
                    maxField.setValue(0)
                }
                return
            }
            const newMax = Math.max(0, parseInt(inputValue) || 0)
            setMax(newMax)
            if (maxField) {
                maxField.setValue(newMax)
            }
        }
        
        const handleMinFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            if (min === 0) {
                setMin('')
            }
            setMinFocused(true)
        }
        
        const handleMinBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            if (min === '') {
                setMin(0)
                if (minField) {
                    minField.setValue(0)
                }
            }
            setMinFocused(false)
        }
        
        const handleMaxFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            if (max === 0) {
                setMax('')
            }
            setMaxFocused(true)
        }
        
        const handleMaxBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            if (max === '') {
                setMax(0)
                if (maxField) {
                    maxField.setValue(0)
                }
            }
            setMaxFocused(false)
        }
        
        const [touched, setTouched] = useState(false)
        const isValid = !errors.length
        const showErrors = !isValid && touched
        const [firstError] = errors
        
        return (
            <div
                className={`wbk_limitationField__field ${showErrors ? 'wbk_limitationField__field--invalid' : ''}`}
            >
                <Label title={label} id={name} tooltip={misc?.tooltip} />
                <div className="wbk_limitationField__inputsContainer">
                    <div className={classNames('wbk_limitationField__inputWrapper', {
                        'wbk_limitationField__inputWrapper--focused': minFocused,
                    })}>
                        <input
                            type="number"
                            className="wbk_limitationField__input"
                            value={min}
                            onChange={handleMinChange}
                            onFocus={handleMinFocus}
                            onBlur={(e) => {
                                handleMinBlur(e)
                                setTouched(true)
                            }}
                            min={0}
                            id={`${name}-min`}
                            disabled={misc?.disabled}
                            ref={minInputRef}
                        />
                        <span className="wbk_limitationField__label">Min</span>
                    </div>
                    <div className={classNames('wbk_limitationField__inputWrapper', {
                        'wbk_limitationField__inputWrapper--focused': maxFocused,
                    })}>
                        <input
                            type="number"
                            className="wbk_limitationField__input"
                            value={max}
                            onChange={handleMaxChange}
                            onFocus={handleMaxFocus}
                            onBlur={(e) => {
                                handleMaxBlur(e)
                                setTouched(true)
                            }}
                            min={0}
                            id={`${name}-max`}
                            disabled={misc?.disabled}
                            ref={maxInputRef}
                        />
                        <span className="wbk_limitationField__label">Max</span>
                    </div>
                </div>
                {showErrors && firstError && (
                    <div className="wbk_limitationField__errorContainer">{firstError}</div>
                )}
            </div>
        )
    }
}
