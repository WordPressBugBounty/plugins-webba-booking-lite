import classNames from 'classnames'
import { InputHTMLAttributes, useState } from 'react'
import styles from './TextField.module.scss'
import { IFilterField, IFilterFieldProps } from '../../types'
import { useFilter } from '../../FilterProvider'
import { useFilterField } from '../../hooks/useFilterField'
import { Label } from '../../../Form/Fields/Label/Label'

export const TextField = ({
    name,
    label,
    placeholder,
    misc,
}: IFilterFieldProps) => {
    const { value, setFilter } = useFilterField(name)

    return (
        <div className={styles.field}>
            {label && <Label title={label} id={name} />}
            <div className={styles.inputContainer}>
                <input
                    id={name}
                    className={styles.input}
                    type="text"
                    value={value}
                    onChange={(e) => setFilter(e.target.value)}
                    min={misc?.min}
                    max={misc?.max}
                    placeholder={placeholder}
                />
            </div>
        </div>
    )
}
