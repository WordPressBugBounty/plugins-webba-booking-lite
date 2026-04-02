import classNames from 'classnames'
import { InputHTMLAttributes, useEffect, useMemo, useRef, useState } from 'react'
import './GenericFormField.scss'
import { Label } from '../Label/Label'
import { FormFieldMisc } from '../../types'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import { useForm } from '../../lib/FormProvider'
import { checkForConditionalDisable } from '../../utils/utils'

interface GenericFieldProps {
    value: any
    onChange: (value: any) => void
    errors?: string[] | readonly string[]
    label: string
    type: InputHTMLAttributes<HTMLInputElement>['type']
    id: string
    misc?: FormFieldMisc
}

export const GenericFormField = ({
    errors = [],
    label,
    type,
    id,
    value,
    onChange,
    misc,
}: GenericFieldProps) => {
    const [touched, setTouched] = useState(false)
    const isValid = !errors.length
    const showErrors = !isValid && touched
    const [firstError] = errors
    const { plan_map } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )

    const form = useForm()
    const [conditionallyDisabled, setConditionallyDisabled] = useState(false)
    const [hasEvaluated, setHasEvaluated] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const cursorPositionRef = useRef<number | null>(null)

    useEffect(() => {
        if (!misc?.disable_condition || !form.defaultValue) return

        setHasEvaluated(false)
        setConditionallyDisabled(false)
    }, [form.defaultValue])

    useEffect(() => {
        if (hasEvaluated || !misc?.disable_condition || !form.defaultValue)
            return

        const result = checkForConditionalDisable(form, misc.disable_condition)
        setConditionallyDisabled(result)
        setHasEvaluated(true)
    }, [form.defaultValue, misc?.disable_condition, hasEvaluated])

    const proDisableApplicable = useMemo(() => {
        if (!misc?.pro_version || !misc?.required_plan) return false

        if (typeof plan_map !== 'object') return false

        const haveEligiblePlan =
            plan_map[
                Object.keys(plan_map).find(
                    (planName) => planName === misc?.required_plan
                )
            ]

        return !haveEligiblePlan
    }, [plan_map, misc?.pro_version, misc?.required_plan])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target
        cursorPositionRef.current = input.selectionStart
        onChange(e.target.value)
    }

    useEffect(() => {
        if (cursorPositionRef.current !== null && inputRef.current) {
            const input = inputRef.current
            const position = cursorPositionRef.current
            input.setSelectionRange(position, position)
            cursorPositionRef.current = null
        }
    }, [value])

    return (
        <div
            className={classNames('wbk_genericFormField__field', {
                'wbk_genericFormField__field--invalid': showErrors,
            })}
        >
            <div className="wbk_genericFormField__inputContainer">
                <Label title={label} id={id} tooltip={misc?.tooltip} />
            </div>
            <div className="wbk_genericFormField__inputContainer">
                <input
                    ref={inputRef}
                    id={id}
                    className="wbk_genericFormField__input"
                    type={type}
                    value={value}
                    onChange={handleChange}
                    onBlur={() => setTouched(true)}
                    min={misc?.min}
                    max={misc?.max}
                    disabled={
                        misc?.disabled ||
                        proDisableApplicable ||
                        conditionallyDisabled
                    }
                />
            </div>
            {showErrors && (
                <div className="wbk_genericFormField__errorContainer">{firstError}</div>
            )}
        </div>
    )
}
