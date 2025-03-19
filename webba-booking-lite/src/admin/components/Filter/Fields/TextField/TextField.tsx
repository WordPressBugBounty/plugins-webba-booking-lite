import classNames from 'classnames'
import { InputHTMLAttributes, useState } from 'react'
import styles from './TextField.module.scss'
import { IFilterField, IFilterFieldProps } from '../../types'
import { useFilter } from '../../FilterProvider'
import { useFilterField } from '../../hooks/useFilterField'

export const TextField = ({ name, label, misc }: IFilterFieldProps) => {
    const { value, setFilter } = useFilterField(name)

    return (
        <div className={styles.field}>
            <div className={styles.inputContainer}>
                <input
                    id={name}
                    className={styles.input}
                    type="text"
                    value={value}
                    onChange={(e) => setFilter(e.target.value)}
                    min={misc?.min}
                    max={misc?.max}
                />
            </div>
        </div>
    )
}
