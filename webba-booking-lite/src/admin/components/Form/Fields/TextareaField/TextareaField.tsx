import { useState } from 'react'
import { FormFieldProps } from '../../types'
import { Label } from '../Label/Label'
import classNames from 'classnames'
import './TextareaField.scss'
import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'

export const createTextareaField: FormComponentConstructor<any> = ({
    field,
}) => {
    return ({ name, label, misc }: FormFieldProps) => {
        const { value, setValue, errors } = useField(field)
        const [touched, setTouched] = useState(false)

        return (
            <div className={classNames({ invalid: touched && errors })}>
                <Label id={name} title={label} tooltip={misc?.tooltip} />
                <textarea
                    className="wbk_textareaField__textarea"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value)
                    }}
                    onBlur={() => setTouched(true)}
                ></textarea>
                {touched && errors && (
                    <p className="wbk_textareaField__error">{errors[0]}</p>
                )}
            </div>
        )
    }
}
