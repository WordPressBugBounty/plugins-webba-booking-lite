import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { InputHTMLAttributes, useState } from 'react'
import CloseIcon from '../../../../../public/images/close-icon-medium.png'
import MoreIcon from '../../../../../public/images/more-icon.png'
import { capitalize } from '../../../utils/capitalize'
import { Input } from '../../Input/Input'
import { Option, Select } from '../../Select/Select'
import { FieldType } from '../types'
import { CheckboxField } from './CheckboxField/Checkbox'
import { OptionsField } from './OptionsField/OptionsField'

import { Label } from '../../Label/Label'
import { useSortableItem } from '../../SortableList/SortableList'
import { Toggle } from '../../Toggle/Toggle'
import { getGroupStateValue, useGroup } from '../hooks/useGroup'
import { getBuilderFieldsByType } from '../utils/createBuilderField'
import './Field.scss'
import { FieldComponent } from './types'

interface FieldProps {
    groupId: number
    onDelete: () => void
}

const mapInputType = (
    type: FieldType
): InputHTMLAttributes<HTMLInputElement>['type'] => {
    switch (type) {
        case FieldType.Phone:
            return 'tel'
        case FieldType.Description:
            return 'text'
        default:
            return type
    }
}

const typeToFieldMap: Record<string, FieldComponent> = {
    checkbox: CheckboxField,
    dropdown: OptionsField,
    radio: OptionsField,
    file: () => null,
}

const options: Option[] = Object.values(FieldType).map((type) => ({
    value: type,
    label: capitalize(type),
}))

export const Field = ({ groupId, onDelete }: FieldProps) => {
    const { handleRef } = useSortableItem()
    const group = useGroup(groupId)
    const {
        values: { type, slug, required, placeholder, width, defaultValue },
        errors,
    } = getGroupStateValue(group.state)
    const [collapsed, setCollapsed] = useState(!!group.meta.collapsed)
    const disabled = !!group.meta.disabled
    const inputType = mapInputType(type) as string

    const DefaultValueField = typeToFieldMap[inputType]

    return (
        <div
            className={classNames('wbk_formBuilderField__fieldsContainer', {
                'wbk_formBuilderField__fieldsContainer--containerCollapsed': collapsed,
            })}
        >
            <div className="wbk_formBuilderField__fieldSummary">
                <div>
                    <button
                        type="button"
                        ref={handleRef}
                        className="wbk_formBuilderField__handle"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                        </svg>
                    </button>
                </div>
                <div className="wbk_formBuilderField__slugInput">
                    <Input
                        readOnly={disabled}
                        value={slug}
                        onChange={(value) => {
                            group.update('slug', value)
                        }}
                        placeholder={__('xx', 'webba-booking-lite')}
                        id={`slug-field-${group.id}`}
                        type="text"
                        errors={errors.slug as string[]}
                    />
                </div>
                <div>
                    <button
                        type="button"
                        className={classNames('wbk_formBuilderField__menuBtn', {
                            'wbk_formBuilderField__menuBtn--open': !collapsed,
                        })}
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <img src={MoreIcon} className="wbk_formBuilderField__moreIcon" />
                    </button>
                </div>
                <div>
                    <div className="wbk_formBuilderField__requiredToggleWrapper">
                        <div className="wbk_formBuilderField__requiredToggleHoverArea">
                            <Toggle
                                disabled={disabled}
                                className="wbk_formBuilderField__requiredField"
                                value={!!required}
                                onChange={(required) => {
                                    group.update('required', required)
                                }}
                            />
                            {disabled && (
                                <span className="wbk_formBuilderField__requiredTooltip">
                                    {__(
                                        "Default - can't be changed",
                                        'webba-booking-lite'
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        {required
                            ? __('Required', 'webba-booking-lite')
                            : __('Optional', 'webba-booking-lite')}
                    </div>
                </div>
                {!disabled && (
                    <div>
                        <button
                            type="button"
                            onClick={onDelete}
                            className="wbk_formBuilderField__menuBtn"
                        >
                            <img
                                src={CloseIcon}
                                className="wbk_formBuilderField__deleteIcon"
                            />
                        </button>
                    </div>
                )}
            </div>
            <div
                className={classNames('wbk_formBuilderField__fields', {
                    'wbk_formBuilderField__fields--collapsed': collapsed,
                })}
            >
                <div>
                    <Select
                        isDisabled={disabled}
                        name="type"
                        value={options.find((option) => option.value === type)}
                        options={options}
                        label={__('Field type', 'webba-booking-lite')}
                        onChange={(type) => {
                            group.setGroup({
                                fields: getBuilderFieldsByType({
                                    type: type?.value as FieldType,
                                    required,
                                    slug,
                                }),
                                meta: group.meta,
                            })
                        }}
                    />
                </div>
                {placeholder !== undefined && (
                    <div>
                        <Input
                            id={`placeholder-field-${group.id}`}
                            type="text"
                            label={__('Placeholder text', 'webba-booking-lite')}
                            value={placeholder}
                            placeholder={__(
                                'Input placeholder',
                                'webba-booking-lite'
                            )}
                            onChange={(placeholder) => {
                                group.update('placeholder', placeholder)
                            }}
                        />
                    </div>
                )}
                {DefaultValueField ? (
                    <DefaultValueField
                        group={group}
                        type={inputType}
                        label={__('Default value', 'webba-booking-lite')}
                        placeholder={__(
                            'Enter default value',
                            'webba-booking-lite'
                        )}
                    />
                ) : (
                    <Input
                        id={`default-value-field-${group.id}`}
                        label={__('Default value', 'webba-booking-lite')}
                        placeholder={__(
                            'Enter default value',
                            'webba-booking-lite'
                        )}
                        type={inputType}
                        value={defaultValue as string}
                        onChange={(value) => {
                            group.update('defaultValue', value)
                        }}
                    />
                )}
                {!!width && (
                    <div className="wbk_formBuilderField__widthField">
                        <Toggle
                            name="width"
                            value={width === 'full-width'}
                            onChange={(value) =>
                                group.update(
                                    'width',
                                    value ? 'full-width' : 'half-width'
                                )
                            }
                        />
                        <div>
                            {width === 'full-width'
                                ? __('Full width', 'webba-booking-lite')
                                : __('Half width', 'webba-booking-lite')}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
