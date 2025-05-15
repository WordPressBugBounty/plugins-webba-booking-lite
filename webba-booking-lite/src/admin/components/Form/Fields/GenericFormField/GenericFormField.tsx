import classNames from 'classnames'
import { InputHTMLAttributes, useEffect, useState } from 'react'
import styles from './GenericFormField.module.scss'
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
    const { is_pro } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )

    const form = useForm()
    const [conditionallyDisabled, setConditionallyDisabled] = useState(false)
    const [hasEvaluated, setHasEvaluated] = useState(false)

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

    return (
        <div
            className={classNames(styles.field, {
                [styles.invalid]: showErrors,
            })}
        >
            <div className={styles.inputContainer}>
                <Label title={label} id={id} tooltip={misc?.tooltip} />
            </div>
            <div className={styles.inputContainer}>
                <input
                    id={id}
                    className={styles.input}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={() => setTouched(true)}
                    min={misc?.min}
                    max={misc?.max}
                    disabled={
                        misc?.disabled ||
                        (misc?.pro_version && !is_pro) ||
                        conditionallyDisabled
                    }
                />
            </div>
            {showErrors && (
                <div className={styles.errorContainer}>{firstError}</div>
            )}
        </div>
    )
}
