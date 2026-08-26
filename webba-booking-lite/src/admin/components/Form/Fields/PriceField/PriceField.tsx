import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { Validators } from '../../utils/validation'
import { Label } from '../Label/Label'
import { usePreset } from '../../../../hooks/usePreset'
import { useForm, useShowValidation } from '../../lib/FormProvider'
import { checkForConditionalDisable } from '../../utils/utils'
import { CurrencySymbolPosition, PriceCurrencyConfig } from './types'
import './PriceField.scss'

const resolveCurrencyConfig = (settings: {
    currency_symbol?: string
    currency_symbol_position?: string
}): PriceCurrencyConfig => {
    const symbol =
        typeof settings?.currency_symbol === 'string' &&
        settings.currency_symbol.trim()
            ? settings.currency_symbol.trim()
            : '$'
    const position: CurrencySymbolPosition =
        settings?.currency_symbol_position === 'after' ? 'after' : 'before'

    return { symbol, position }
}

const isFloatText = (value: string) => /^\d*(\.\d*)?$/.test(value)

export const createPriceField: FormComponentConstructor<string> = ({
    field,
    fieldConfig,
}) => {
    field.setValidators([Validators.noneNegativeFloat])

    return ({ name, label, misc }: FormFieldProps) => {
        const { value, setValue, errors } = useField(field)
        const { settings } = usePreset()
        const form = useForm()
        const showValidation = useShowValidation()
        const [touched, setTouched] = useState(false)
        const [conditionallyDisabled, setConditionallyDisabled] = useState(false)
        const [hasEvaluated, setHasEvaluated] = useState(false)
        const [symbolInset, setSymbolInset] = useState(36)
        const inputRef = useRef<HTMLInputElement>(null)
        const currencyRef = useRef<HTMLSpanElement>(null)
        const cursorPositionRef = useRef<number | null>(null)

        const currency = useMemo(
            () =>
                resolveCurrencyConfig({
                    currency_symbol: settings?.currency_symbol,
                    currency_symbol_position: settings?.currency_symbol_position,
                }),
            [settings?.currency_symbol, settings?.currency_symbol_position]
        )

        const isValid = !errors.length
        const showErrors = !isValid && (touched || showValidation)
        const [firstError] = errors ?? []

        useLayoutEffect(() => {
            const symbolWidth = currencyRef.current?.offsetWidth ?? 12
            setSymbolInset(Math.max(36, Math.ceil(symbolWidth) + 28))
        }, [currency.symbol])

        useEffect(() => {
            if (!misc?.disable_condition || !form.defaultValue) {
                return
            }

            setHasEvaluated(false)
            setConditionallyDisabled(false)
        }, [form.defaultValue, misc?.disable_condition])

        useEffect(() => {
            if (hasEvaluated || !misc?.disable_condition || !form.defaultValue) {
                return
            }

            setConditionallyDisabled(
                checkForConditionalDisable(form, misc.disable_condition)
            )
            setHasEvaluated(true)
        }, [form.defaultValue, misc?.disable_condition, hasEvaluated, form])

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const nextValue = e.target.value
            if (nextValue !== '' && !isFloatText(nextValue)) {
                return
            }
            cursorPositionRef.current = e.target.selectionStart
            setValue(nextValue)
        }

        useEffect(() => {
            if (cursorPositionRef.current !== null && inputRef.current) {
                const position = cursorPositionRef.current
                inputRef.current.setSelectionRange(position, position)
                cursorPositionRef.current = null
            }
        }, [value])

        const inputInsetStyle = {
            ['--wbk-price-symbol-inset' as string]: `${symbolInset}px`,
        }

        return (
            <div
                className={classNames('wbk_priceField', {
                    'wbk_priceField--invalid': showErrors,
                })}
            >
                <Label
                    title={label}
                    id={name}
                    tooltip={misc?.tooltip ?? fieldConfig.misc?.tooltip}
                />
                <div
                    className="wbk_priceField__inputWrapper"
                    style={inputInsetStyle}
                >
                    <input
                        ref={inputRef}
                        id={name}
                        className={classNames('wbk_priceField__input', {
                            'wbk_priceField__input--currencyBefore':
                                currency.position === 'before',
                            'wbk_priceField__input--currencyAfter':
                                currency.position === 'after',
                        })}
                        type="text"
                        inputMode="decimal"
                        value={value ?? ''}
                        onChange={handleChange}
                        onBlur={() => setTouched(true)}
                        disabled={
                            Boolean(misc?.disabled) || conditionallyDisabled
                        }
                        min={misc?.min}
                        max={misc?.max}
                    />
                    <span
                        ref={currencyRef}
                        className={classNames('wbk_priceField__currency', {
                            'wbk_priceField__currency--before':
                                currency.position === 'before',
                            'wbk_priceField__currency--after':
                                currency.position === 'after',
                        })}
                        aria-hidden="true"
                    >
                        {currency.symbol}
                    </span>
                </div>
                {showErrors && firstError && (
                    <div className="wbk_priceField__error">{firstError}</div>
                )}
            </div>
        )
    }
}
