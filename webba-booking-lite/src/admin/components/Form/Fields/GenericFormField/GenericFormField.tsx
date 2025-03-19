import classNames from 'classnames'
import { InputHTMLAttributes, useState } from 'react'
import styles from './GenericFormField.module.css'
import { Label } from '../Label/Label'
import { FormFieldMisc } from '../../types'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'

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
                    disabled={misc?.disabled || (misc?.pro_version && !is_pro)}
                />
            </div>
            {showErrors && (
                <div className={styles.errorContainer}>{firstError}</div>
            )}
        </div>
    )
}
