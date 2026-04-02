import classNames from 'classnames'
import './Select.scss'
import SelectComponent, { GroupBase, Props } from 'react-select'
import { useState } from 'react'
import { Label } from '../Label/Label'

export interface Option {
    value: string
    label: string
}

interface SelectProps<
    O extends Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<O> = GroupBase<O>,
> extends Props<O, IsMulti, Group> {
    errors?: string[]
    tooltip?: string
    label: string
    name: string
}

export const Select = function <
    O extends Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<O> = GroupBase<O>,
>({
    errors,
    tooltip,
    label,
    name,
    ...otherProps
}: SelectProps<O, IsMulti, Group>) {
    const [touched, setTouched] = useState(false)
    const isValid = !errors?.length
    const showErrors = !isValid && touched
    const [firstError] = errors ?? []

    return (
        <div
            className={classNames('wbk_select', {
                'wbk_select--invalid': showErrors,
            })}
        >
            <Label for={name} tooltip={tooltip}>
                {label}
            </Label>
            <div>
                <SelectComponent<O, IsMulti, Group>
                    {...otherProps}
                    classNames={{
                        control: () => 'wbk_select__selectInput',
                    }}
                    id={name}
                    onBlur={() => setTouched(true)}
                    isSearchable={false}
                />
                {showErrors && firstError && (
                    <div className="wbk_select__errorContainer">{firstError}</div>
                )}
            </div>
        </div>
    )
}
