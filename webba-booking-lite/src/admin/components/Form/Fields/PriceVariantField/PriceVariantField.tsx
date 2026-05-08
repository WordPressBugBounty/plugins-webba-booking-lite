import { useEffect, useMemo, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { useField } from '../../lib/hooks/useField'
import { useForm } from '../../lib/FormProvider'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { Label } from '../Label/Label'
import { usePreset } from '../../../../hooks/usePreset'
import './PriceVariantField.scss'

type SimplePricing = {
    pricing: {
        weekday: number
        weekend_holiday: number
    }
}

type PerPersonPricing = {
    pricing: {
        weekday: {
            adult: number
            child: number
            infant: number
        }
        weekend_holiday: {
            adult: number
            child: number
            infant: number
        }
    }
}

const getParsedValue = (value: unknown): any => {
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) {
            return null
        }
        try {
            const parsed = JSON.parse(trimmed)
            if (typeof parsed === 'string') {
                try {
                    return JSON.parse(parsed)
                } catch {
                    return parsed
                }
            }
            return parsed
        } catch {
            return null
        }
    }

    return value
}

const toNonNegativeNumber = (value: unknown) => {
    const parsed = parseFloat(String(value))
    if (Number.isNaN(parsed) || parsed < 0) {
        return 0
    }
    return parsed
}

const isFloatText = (value: string) => /^\d*(\.\d*)?$/.test(value)

const getCurrencyConfig = (priceFormat?: string) => {
    const format = priceFormat || '$#price'
    const token = '#price'
    const tokenIndex = format.indexOf(token)
    if (tokenIndex === -1) {
        return { symbol: '$', position: 'before' as const }
    }

    const before = format.slice(0, tokenIndex).trim()
    const after = format.slice(tokenIndex + token.length).trim()
    if (before) {
        return { symbol: before, position: 'before' as const }
    }
    if (after) {
        return { symbol: after, position: 'after' as const }
    }
    return { symbol: '$', position: 'before' as const }
}

const isValidPricingValue = (value: unknown): boolean => {
    if (typeof value === 'number') {
        return Number.isFinite(value) && value >= 0
    }
    if (typeof value === 'string') {
        if (!isFloatText(value)) return false
        if (value === '') return true
        return parseFloat(value) >= 0
    }
    return false
}

const normalizeSimplePricing = (value: unknown): SimplePricing => {
    const parsed = getParsedValue(value)

    if (typeof parsed === 'number' || typeof parsed === 'string') {
        const price = toNonNegativeNumber(parsed)
        return {
            pricing: {
                weekday: price,
                weekend_holiday: price,
            },
        }
    }

    const weekdayRaw =
        parsed?.pricing?.weekday?.adult ??
        parsed?.pricing?.weekday ??
        0
    const weekendRaw =
        parsed?.pricing?.weekend_holiday?.adult ??
        parsed?.pricing?.weekend_holiday ??
        0

    return {
        pricing: {
            weekday: toNonNegativeNumber(weekdayRaw),
            weekend_holiday: toNonNegativeNumber(weekendRaw),
        },
    }
}

const normalizePerPersonPricing = (value: unknown): PerPersonPricing => {
    const parsed = getParsedValue(value)

    const weekdayDefault = toNonNegativeNumber(
        parsed?.pricing?.weekday ?? parsed?.pricing?.weekday?.adult ?? parsed ?? 0
    )
    const weekendDefault = toNonNegativeNumber(
        parsed?.pricing?.weekend_holiday ??
            parsed?.pricing?.weekend_holiday?.adult ??
            parsed ??
            0
    )

    return {
        pricing: {
            weekday: {
                adult: toNonNegativeNumber(parsed?.pricing?.weekday?.adult ?? weekdayDefault),
                child: toNonNegativeNumber(parsed?.pricing?.weekday?.child ?? 0),
                infant: toNonNegativeNumber(parsed?.pricing?.weekday?.infant ?? 0),
            },
            weekend_holiday: {
                adult: toNonNegativeNumber(
                    parsed?.pricing?.weekend_holiday?.adult ?? weekendDefault
                ),
                child: toNonNegativeNumber(parsed?.pricing?.weekend_holiday?.child ?? 0),
                infant: toNonNegativeNumber(parsed?.pricing?.weekend_holiday?.infant ?? 0),
            },
        },
    }
}

export const createPriceVariantField: FormComponentConstructor<any> = ({
    field,
}) => {
    return ({ name, label, misc }: FormFieldProps) => {
        const { value, setValue, errors } = useField(field)
        const form = useForm()
        const { settings } = usePreset()
        const [touched, setTouched] = useState(false)
        const validatorAddedRef = useRef(false)
        const chargePerPersonField = form.fields['charge_per_person']
        const chargePerPersonSnapshot = chargePerPersonField
            ? useSnapshot(chargePerPersonField.value)
            : { value: '' }
        const isChargePerPerson = chargePerPersonSnapshot.value === 'yes'
        const currency = getCurrencyConfig(settings?.price_format)

        const simplePricing = useMemo(
            () => normalizeSimplePricing(value),
            [value]
        )
        const perPersonPricing = useMemo(
            () => normalizePerPersonPricing(value),
            [value]
        )
        const normalizedValue = isChargePerPerson ? perPersonPricing : simplePricing
        const setSerializedValue = (nextValue: SimplePricing | PerPersonPricing) => {
            setValue(JSON.stringify(nextValue))
        }
        const [draftValues, setDraftValues] = useState<Record<string, string>>({})

        const buildDraftValues = (): Record<string, string> => {
            if (isChargePerPerson) {
                return {
                    weekday_adult: String(perPersonPricing.pricing.weekday.adult),
                    weekday_child: String(perPersonPricing.pricing.weekday.child),
                    weekday_infant: String(perPersonPricing.pricing.weekday.infant),
                    weekend_holiday_adult: String(
                        perPersonPricing.pricing.weekend_holiday.adult
                    ),
                    weekend_holiday_child: String(
                        perPersonPricing.pricing.weekend_holiday.child
                    ),
                    weekend_holiday_infant: String(
                        perPersonPricing.pricing.weekend_holiday.infant
                    ),
                }
            }
            return {
                weekday: String(simplePricing.pricing.weekday),
                weekend_holiday: String(simplePricing.pricing.weekend_holiday),
            }
        }

        useEffect(() => {
            setDraftValues(buildDraftValues())
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isChargePerPerson, value])

        useEffect(() => {
            if (validatorAddedRef.current) return
            validatorAddedRef.current = true
            field.addValidator((rawValue) => {
                const parsed = getParsedValue(rawValue)
                if (!parsed || !parsed.pricing) {
                    return __('Value must be a valid number', 'webba-booking-lite')
                }
                const weekday = parsed?.pricing?.weekday
                const weekend = parsed?.pricing?.weekend_holiday

                if (
                    typeof weekday === 'object' ||
                    typeof weekend === 'object'
                ) {
                    const pairs = [
                        weekday?.adult,
                        weekday?.child,
                        weekday?.infant,
                        weekend?.adult,
                        weekend?.child,
                        weekend?.infant,
                    ]
                    if (pairs.some((v) => !isValidPricingValue(v))) {
                        return __(
                            'Value must be a positive number or zero',
                            'webba-booking-lite'
                        )
                    }
                    return null
                }

                if (!isValidPricingValue(weekday) || !isValidPricingValue(weekend)) {
                    return __(
                        'Value must be a positive number or zero',
                        'webba-booking-lite'
                    )
                }
                return null
            })
        }, [field])

        useEffect(() => {
            const normalizedJson = JSON.stringify(normalizedValue)
            const currentJson = JSON.stringify(getParsedValue(value) || null)
            if (normalizedJson !== currentJson) {
                setSerializedValue(normalizedValue)
            }
        }, [normalizedValue, value, setValue])

        const updateSimpleValue = (
            dayType: 'weekday' | 'weekend_holiday',
            rawValue: string
        ) => {
            if (!isFloatText(rawValue)) {
                return
            }
            const amount = toNonNegativeNumber(rawValue)
            const baseSimple = normalizeSimplePricing(value)
            const nextSimple: SimplePricing = {
                pricing: {
                    ...baseSimple.pricing,
                    [dayType]: amount,
                },
            }
            setSerializedValue(nextSimple)
            setTouched(true)
        }

        const updatePerPersonValue = (
            dayType: 'weekday' | 'weekend_holiday',
            personType: 'adult' | 'child' | 'infant',
            rawValue: string
        ) => {
            if (!isFloatText(rawValue)) {
                return
            }
            const base = normalizePerPersonPricing(value)
            setSerializedValue({
                pricing: {
                    ...base.pricing,
                    [dayType]: {
                        ...base.pricing[dayType],
                        [personType]: toNonNegativeNumber(rawValue),
                    },
                },
            })
            setTouched(true)
        }

        const onDraftChange = (key: string, nextRaw: string) => {
            if (!isFloatText(nextRaw)) {
                return
            }
            setDraftValues((prev) => ({
                ...prev,
                [key]: nextRaw,
            }))
        }

        const commitSimple = (dayType: 'weekday' | 'weekend_holiday', key: string) => {
            const raw = draftValues[key] ?? ''
            updateSimpleValue(dayType, raw)
        }

        const commitPerPerson = (
            dayType: 'weekday' | 'weekend_holiday',
            personType: 'adult' | 'child' | 'infant',
            key: string
        ) => {
            const raw = draftValues[key] ?? ''
            updatePerPersonValue(dayType, personType, raw)
        }

        const isValid = !errors.length
        const showErrors = !isValid && touched
        const [firstError] = errors

        return (
            <div
                className={classNames('wbk_priceVariantField', {
                    'wbk_priceVariantField--invalid': showErrors,
                })}
            >
                <Label title={label} id={name} tooltip={misc?.tooltip} />

                <div className="wbk_priceVariantField__table">
                    {isChargePerPerson && (
                        <div className="wbk_priceVariantField__header">
                            <div className="wbk_priceVariantField__headerSpacer" />
                            <div>{__('Adult', 'webba-booking-lite')}</div>
                            <div>{__('Child', 'webba-booking-lite')}</div>
                            <div>{__('Infant', 'webba-booking-lite')}</div>
                        </div>
                    )}

                    <div className="wbk_priceVariantField__row">
                        <div className="wbk_priceVariantField__rowTitle">
                            {__('Weekday', 'webba-booking-lite')}
                        </div>
                        {isChargePerPerson ? (
                            <>
                                <div className="wbk_priceVariantField__inputWrapper">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={draftValues.weekday_adult ?? ''}
                                        onChange={(e) =>
                                            onDraftChange('weekday_adult', e.target.value)
                                        }
                                        onBlur={() =>
                                            commitPerPerson(
                                                'weekday',
                                                'adult',
                                                'weekday_adult'
                                            )
                                        }
                                        className={classNames('wbk_priceVariantField__input', {
                                            'wbk_priceVariantField__input--currencyBefore':
                                                currency.position === 'before',
                                            'wbk_priceVariantField__input--currencyAfter':
                                                currency.position === 'after',
                                        })}
                                    />
                                    <span
                                        className={classNames('wbk_priceVariantField__currency', {
                                            'wbk_priceVariantField__currency--before':
                                                currency.position === 'before',
                                            'wbk_priceVariantField__currency--after':
                                                currency.position === 'after',
                                        })}
                                    >
                                        {currency.symbol}
                                    </span>
                                </div>
                                <div className="wbk_priceVariantField__inputWrapper">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={draftValues.weekday_child ?? ''}
                                        onChange={(e) =>
                                            onDraftChange('weekday_child', e.target.value)
                                        }
                                        onBlur={() =>
                                            commitPerPerson(
                                                'weekday',
                                                'child',
                                                'weekday_child'
                                            )
                                        }
                                        className={classNames('wbk_priceVariantField__input', {
                                            'wbk_priceVariantField__input--currencyBefore':
                                                currency.position === 'before',
                                            'wbk_priceVariantField__input--currencyAfter':
                                                currency.position === 'after',
                                        })}
                                    />
                                    <span
                                        className={classNames('wbk_priceVariantField__currency', {
                                            'wbk_priceVariantField__currency--before':
                                                currency.position === 'before',
                                            'wbk_priceVariantField__currency--after':
                                                currency.position === 'after',
                                        })}
                                    >
                                        {currency.symbol}
                                    </span>
                                </div>
                                <div className="wbk_priceVariantField__inputWrapper">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={draftValues.weekday_infant ?? ''}
                                        onChange={(e) =>
                                            onDraftChange('weekday_infant', e.target.value)
                                        }
                                        onBlur={() =>
                                            commitPerPerson(
                                                'weekday',
                                                'infant',
                                                'weekday_infant'
                                            )
                                        }
                                        className={classNames('wbk_priceVariantField__input', {
                                            'wbk_priceVariantField__input--currencyBefore':
                                                currency.position === 'before',
                                            'wbk_priceVariantField__input--currencyAfter':
                                                currency.position === 'after',
                                        })}
                                    />
                                    <span
                                        className={classNames('wbk_priceVariantField__currency', {
                                            'wbk_priceVariantField__currency--before':
                                                currency.position === 'before',
                                            'wbk_priceVariantField__currency--after':
                                                currency.position === 'after',
                                        })}
                                    >
                                        {currency.symbol}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="wbk_priceVariantField__inputWrapper wbk_priceVariantField__inputWrapper--single">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={draftValues.weekday ?? ''}
                                    onChange={(e) =>
                                        onDraftChange('weekday', e.target.value)
                                    }
                                    onBlur={() => commitSimple('weekday', 'weekday')}
                                    className={classNames(
                                        'wbk_priceVariantField__input',
                                        'wbk_priceVariantField__input--single',
                                        {
                                            'wbk_priceVariantField__input--currencyBefore':
                                                currency.position === 'before',
                                            'wbk_priceVariantField__input--currencyAfter':
                                                currency.position === 'after',
                                        }
                                    )}
                                />
                                <span
                                    className={classNames('wbk_priceVariantField__currency', {
                                        'wbk_priceVariantField__currency--before':
                                            currency.position === 'before',
                                        'wbk_priceVariantField__currency--after':
                                            currency.position === 'after',
                                    })}
                                >
                                    {currency.symbol}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="wbk_priceVariantField__row">
                        <div className="wbk_priceVariantField__rowTitle">
                            {__('Weekend or Holiday', 'webba-booking-lite')}
                        </div>
                        {isChargePerPerson ? (
                            <>
                                <div className="wbk_priceVariantField__inputWrapper">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={draftValues.weekend_holiday_adult ?? ''}
                                        onChange={(e) =>
                                            onDraftChange(
                                                'weekend_holiday_adult',
                                                e.target.value
                                            )
                                        }
                                        onBlur={() =>
                                            commitPerPerson(
                                                'weekend_holiday',
                                                'adult',
                                                'weekend_holiday_adult'
                                            )
                                        }
                                        className={classNames('wbk_priceVariantField__input', {
                                            'wbk_priceVariantField__input--currencyBefore':
                                                currency.position === 'before',
                                            'wbk_priceVariantField__input--currencyAfter':
                                                currency.position === 'after',
                                        })}
                                    />
                                    <span
                                        className={classNames('wbk_priceVariantField__currency', {
                                            'wbk_priceVariantField__currency--before':
                                                currency.position === 'before',
                                            'wbk_priceVariantField__currency--after':
                                                currency.position === 'after',
                                        })}
                                    >
                                        {currency.symbol}
                                    </span>
                                </div>
                                <div className="wbk_priceVariantField__inputWrapper">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={draftValues.weekend_holiday_child ?? ''}
                                        onChange={(e) =>
                                            onDraftChange(
                                                'weekend_holiday_child',
                                                e.target.value
                                            )
                                        }
                                        onBlur={() =>
                                            commitPerPerson(
                                                'weekend_holiday',
                                                'child',
                                                'weekend_holiday_child'
                                            )
                                        }
                                        className={classNames('wbk_priceVariantField__input', {
                                            'wbk_priceVariantField__input--currencyBefore':
                                                currency.position === 'before',
                                            'wbk_priceVariantField__input--currencyAfter':
                                                currency.position === 'after',
                                        })}
                                    />
                                    <span
                                        className={classNames('wbk_priceVariantField__currency', {
                                            'wbk_priceVariantField__currency--before':
                                                currency.position === 'before',
                                            'wbk_priceVariantField__currency--after':
                                                currency.position === 'after',
                                        })}
                                    >
                                        {currency.symbol}
                                    </span>
                                </div>
                                <div className="wbk_priceVariantField__inputWrapper">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={draftValues.weekend_holiday_infant ?? ''}
                                        onChange={(e) =>
                                            onDraftChange(
                                                'weekend_holiday_infant',
                                                e.target.value
                                            )
                                        }
                                        onBlur={() =>
                                            commitPerPerson(
                                                'weekend_holiday',
                                                'infant',
                                                'weekend_holiday_infant'
                                            )
                                        }
                                        className={classNames('wbk_priceVariantField__input', {
                                            'wbk_priceVariantField__input--currencyBefore':
                                                currency.position === 'before',
                                            'wbk_priceVariantField__input--currencyAfter':
                                                currency.position === 'after',
                                        })}
                                    />
                                    <span
                                        className={classNames('wbk_priceVariantField__currency', {
                                            'wbk_priceVariantField__currency--before':
                                                currency.position === 'before',
                                            'wbk_priceVariantField__currency--after':
                                                currency.position === 'after',
                                        })}
                                    >
                                        {currency.symbol}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="wbk_priceVariantField__inputWrapper wbk_priceVariantField__inputWrapper--single">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={draftValues.weekend_holiday ?? ''}
                                    onChange={(e) =>
                                        onDraftChange(
                                            'weekend_holiday',
                                            e.target.value
                                        )
                                    }
                                    onBlur={() =>
                                        commitSimple(
                                            'weekend_holiday',
                                            'weekend_holiday'
                                        )
                                    }
                                    className={classNames(
                                        'wbk_priceVariantField__input',
                                        'wbk_priceVariantField__input--single',
                                        {
                                            'wbk_priceVariantField__input--currencyBefore':
                                                currency.position === 'before',
                                            'wbk_priceVariantField__input--currencyAfter':
                                                currency.position === 'after',
                                        }
                                    )}
                                />
                                <span
                                    className={classNames('wbk_priceVariantField__currency', {
                                        'wbk_priceVariantField__currency--before':
                                            currency.position === 'before',
                                        'wbk_priceVariantField__currency--after':
                                            currency.position === 'after',
                                    })}
                                >
                                    {currency.symbol}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {showErrors && firstError && (
                    <div className="wbk_priceVariantField__errorContainer">
                        {firstError}
                    </div>
                )}
            </div>
        )
    }
}
