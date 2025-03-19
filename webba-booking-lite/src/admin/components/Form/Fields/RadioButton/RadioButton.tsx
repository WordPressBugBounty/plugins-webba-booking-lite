import React, { useState } from 'react'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps, IOption } from '../../types'
import { useField } from '../../lib/hooks/useField'
import { Label } from '../Label/Label'
import styles from './RadioButton.module.scss'
import classNames from 'classnames'
import { formatOptions } from '../GenericSelectField/utils'

export const createRadioButton: FormComponentConstructor<any> = ({ field }) => {
    return ({ name, label, misc }: FormFieldProps) => {
        const { value, setValue, errors } = useField(field)
        const [touched, setTouched] = useState(false)
        const options: IOption[] = typeof misc?.options === 'object'
            ? formatOptions(misc?.options as Record<string, string>)
            : []

        return (
            <div>
                <Label title={label} id={name} tooltip={misc?.tooltip} />
                <div className={styles.buttons}>
                    {options.map(({ label, value: optionValue }: IOption) => (
                        <div
                            key={optionValue}
                            className={classNames(styles.item, {
                                [styles.checked]: optionValue === value,
                            })}
                            onClick={() => {
                                setValue(optionValue)
                                setTouched(true)
                            }}
                        >
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
                {errors && touched && <div>{errors}</div>}
            </div>
        )
    }
}
