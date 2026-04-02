import React, { useLayoutEffect, useMemo, useState } from 'react'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps, IOption } from '../../types'
import { useField } from '../../lib/hooks/useField'
import { Label } from '../Label/Label'
import './RadioButton.scss'
import classNames from 'classnames'
import { fetchConnectedOptions, formatOptions, isConnectedField } from '../GenericSelectField/utils'
import { getFormState } from '../../lib/utils'
import { useForm } from '../../lib/FormProvider'
import { useSelect } from '@wordpress/data'
import { store } from '../../../../../store/backend'
import { processUpgradeMessage } from '../../../../../utilities/planHelper'
import { __, sprintf } from '@wordpress/i18n'
import lockedIcon from '../../../../../../public/images/icon-lock.png'

interface IconOption {
    value: string
    label: string
    icon: string
    required_plan?: string
}

interface DotsOption {
    value: string
    label: string
    description?: string
}

function getOptions(misc: FormFieldProps['misc']): (IOption | IconOption | DotsOption)[] {
    if (!misc?.options) return []
    if (misc.radio_type === 'icon' && Array.isArray(misc.options)) {
        return (misc.options as { value: string; title: string; icon: string; required_plan?: string }[]).map(
            (o) => ({ value: o.value, label: o.title, icon: o.icon, required_plan: o.required_plan })
        )
    }
    if (misc.radio_type === 'dots' && typeof misc.options === 'object' && !Array.isArray(misc.options)) {
        const opts = misc.options as Record<string, { title: string; description?: string }>
        return Object.entries(opts).map(([val, o]) => ({
            value: val,
            label: o.title,
            description: o.description,
        }))
    }
    if (typeof misc.options === 'object' && !Array.isArray(misc.options)) {
        return formatOptions(misc.options as Record<string, string>)
    }
    return []
}

export const createRadioButton: FormComponentConstructor<any> = ({ field, fieldConfig }) => {
    return ({ name, label, misc }: FormFieldProps) => {
        const { value, setValue, errors } = useField(field)
        const [touched, setTouched] = useState(false)
        const options = getOptions(misc)
        const isIconType = misc?.radio_type === 'icon'
        const isDotsType = misc?.radio_type === 'dots'
        const form = useMemo(() => useForm(), [value])
        const { plan_map, admin_url, wording, plugin_url } = useSelect(
            (select: any) => select(store).getPreset(),
            []
        )

        useLayoutEffect(() => {
            if (isConnectedField(fieldConfig?.modelName as string, name)) {
                fetchConnectedOptions(fieldConfig?.modelName as string, name, {
                    ...getFormState(form).values,
                    id: form.defaultValue.id,
                })
            }
        }, [value])

        const requiredMessage =
            wording?.plan_required_message || __('Available in #plan', 'webba-booking-lite')

        return (
            <div>
                <Label title={label} id={name} tooltip={misc?.tooltip} />
                <div
                    className={classNames(
                        'wbk_radioButton__buttons',
                        isIconType && 'wbk_radioButton__buttons--buttonsIcon',
                        isDotsType && 'wbk_radioButton__buttons--buttonsDots'
                    )}
                >
                    {options.map((option) => {
                        const optionValue = option.value
                        const optionLabel = option.label
                        const iconUrl = 'icon' in option ? plugin_url + '/public/images/' + option.icon : null
                        const requiredPlan = 'required_plan' in option ? option.required_plan : undefined
                        const description = 'description' in option ? option.description : undefined
                        const isLocked =
                            requiredPlan != null &&
                            (!plan_map || plan_map[requiredPlan] !== true)
                        const isChecked = optionValue === value && !isLocked

                        if (isDotsType) {
                            return (
                                <label
                                    key={optionValue}
                                    className={classNames('wbk_radioButton__itemDots', {
                                        'wbk_radioButton__itemDots--locked': isLocked,
                                    })}
                                >
                                    <span className={classNames('wbk_radioButton__dot', { 'wbk_radioButton__dot--checked': isChecked })} />
                                    <input
                                        type="radio"
                                        name={name}
                                        value={optionValue}
                                        checked={isChecked}
                                        disabled={isLocked}
                                        onChange={() => {
                                            if (isLocked) return
                                            setValue(optionValue)
                                            setTouched(true)
                                        }}
                                        className="wbk_radioButton__radioInput"
                                    />
                                    <span className="wbk_radioButton__dotsContent">
                                        <span className="wbk_radioButton__dotsLabel">{optionLabel}</span>
                                        {description && (
                                            <span className="wbk_radioButton__dotsDescription">{description}</span>
                                        )}
                                    </span>
                                </label>
                            )
                        }

                        return (
                            <div
                                key={optionValue}
                                className={classNames(
                                    isIconType ? 'wbk_radioButton__itemIcon' : 'wbk_radioButton__item',
                                    {
                                        'wbk_radioButton__item--checked': !isIconType && isChecked,
                                        'wbk_radioButton__itemIcon--checked': isIconType && isChecked,
                                        'wbk_radioButton__item--itemLocked': !isIconType && isLocked,
                                        'wbk_radioButton__itemIcon--itemLocked': isIconType && isLocked,
                                    }
                                )}
                                onClick={() => {
                                    if (isLocked) return
                                    setValue(optionValue)
                                    setTouched(true)
                                }}
                            >
                                {isIconType && iconUrl && (
                                    <span className="wbk_radioButton__icon">
                                        <img src={iconUrl} alt="" aria-hidden />
                                    </span>
                                )}
                                <span className="wbk_radioButton__label">{optionLabel}</span>
                                {isLocked && (
                                    <a
                                        href={sprintf('%sadmin.php?page=wbk-main-pricing', admin_url)}
                                        className="wbk_radioButton__upgradeLink"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <img
                                            src={lockedIcon}
                                            alt={__('Locked', 'webba-booking-lite')}
                                            className="wbk_radioButton__upgradeLockIcon"
                                        />
                                        <span className="wbk_radioButton__upgradeText">
                                            {processUpgradeMessage(
                                                [requiredPlan!],
                                                plan_map || {},
                                                requiredMessage
                                            )}
                                        </span>
                                    </a>
                                )}
                            </div>
                        )
                    })}
                </div>
                {errors && touched && <div>{errors}</div>}
            </div>
        )
    }
}
