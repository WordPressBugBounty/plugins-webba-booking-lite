import classNames from 'classnames'
import { InputHTMLAttributes, useState } from 'react'
import styles from './SearchField.module.scss'
import { IFilterField, IFilterFieldProps, ISearchFieldProps } from '../../types'
import { useFilter } from '../../FilterProvider'
import { useFilterField } from '../../hooks/useFilterField'

export const SearchField = ({ name, label, onChange }: ISearchFieldProps) => {

    return (
        <div className={styles.field}>
            <div className={styles.inputContainer}>
                <input
                    id={name}
                    className={styles.input}
                    type="text"
                    onChange={(e: any) => onChange(e.target.value)}
                    placeholder={label}
                />
            </div>
        </div>
    )
}
