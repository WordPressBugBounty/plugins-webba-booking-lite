import { useEffect, useMemo, useState } from 'react'
import styles from './SelectField.module.scss'
import Select from 'react-select'
import classNames from 'classnames'
import { IOption } from '../../../Form/types'
import { isModelOptions, useOptions } from './utils'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import { useFilterField } from '../../hooks/useFilterField'
import { IFilterFieldProps, TFilterSelectOptions } from '../../types'

export const SelectField = ({ name, label, misc }: IFilterFieldProps) => {
    const { value, setFilter, model, field } = useFilterField(name)
    const multiple = misc?.multiple
    const [isInitiated, setIsInitiated] = useState(false)

    const options: IOption[] = useOptions({
        options: field?.options as TFilterSelectOptions,
        nullValue: field.null_value,
    })

    const valueObject = useMemo(() => {
        if (isInitiated || !multiple) {
            return options.filter((option: IOption) => {
                if (multiple && value) {
                    return value.includes(option.value)
                } else if (!multiple && value) {
                    return value.toString() === option.value
                }
            }) as IOption[]
        }

        return options as IOption[]
    }, [value, options])

    const handleChange = (selectedOptions: any) => {
        setIsInitiated(true)

        if (multiple && selectedOptions && selectedOptions[0]?.value) {
            setFilter(selectedOptions.map((option: IOption) => option.value))
        } else if (!multiple && selectedOptions.value) {
            setFilter(selectedOptions?.value as string)
        } else {
            setFilter([])
        }
    }

    const isLoading = useSelect((select) => {
        if (isModelOptions(field.options as any)) {
            // @ts-ignore
            return select(store_name).getModelFieldLoading(field.options)
        } else {
            // @ts-ignore
            return select(store_name).getFieldLoading(model as string, name)
        }
    }, [])

    return (
        <div className={classNames(styles.selectField)}>
            <div>
                <Select
                    value={valueObject}
                    options={options}
                    onChange={(selectedOptions: IOption[] | unknown) =>
                        handleChange(selectedOptions as IOption[])
                    }
                    classNames={{
                        control: (state) =>
                            classNames(styles.selectInput, {
                                [styles.preventOverlap]: misc?.preventOverlap,
                            }),
                    }}
                    id={name}
                    isMulti={multiple}
                    isSearchable={false}
                    isDisabled={isLoading}
                    isLoading={isLoading}
                    placeholder={label}
                />
            </div>
        </div>
    )
}
