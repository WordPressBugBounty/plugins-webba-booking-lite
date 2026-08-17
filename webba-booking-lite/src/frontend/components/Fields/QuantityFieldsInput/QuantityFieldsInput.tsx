import classNames from 'classnames'
import { useEffect, useMemo, useRef } from 'react'
import { __ } from '@wordpress/i18n'
import { useField } from '../../Form/hooks/useField'
import { IFieldProps } from '../../Form/types'
import { createQuantityAllocationValidator } from '../../Form/validation'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { useWording } from '../../../hooks/useWording'
import {
    allocateQuantityDefaults,
    getDefaultQuantityFields,
    getQuantityFieldsTotal,
    IQuantityFieldValue,
    normalizeQuantityFields,
} from './types'
import './QuantityFieldsInput.scss'

const isQuantityValue = (value: unknown): value is IQuantityFieldValue =>
    !!value && typeof value === 'object' && !Array.isArray(value)

export const QuantityFieldsInput = ({
    fieldConstructor,
    anyTouched,
}: IFieldProps) => {
    const wording = useWording()
    const { services, units, bookingMode } = useBookingContext()
    const {
        slug,
        placeholder,
        value,
        setValue,
        setTouched,
        width,
        quantityFields,
    } = useField(fieldConstructor)

    const quantityOptions = useMemo(() => {
        const normalized = normalizeQuantityFields(quantityFields)
        return normalized.length ? normalized : getDefaultQuantityFields()
    }, [quantityFields])

    const optionsKey = quantityOptions
        .map((field) => `${field.slug}:${field.label}`)
        .join('|')

    const selectedQuantity = useMemo(() => {
        if (bookingMode === 'units') {
            const selectedUnit = (units || []).find((unit) => unit.selected)
            return Math.max(1, Number(selectedUnit?.quantity) || 1)
        }

        const total = (services || [])
            .filter((service) => service.selected)
            .reduce(
                (sum, service) =>
                    sum + Math.max(1, Number(service.quantity) || 1),
                0
            )

        return Math.max(1, total)
    }, [bookingMode, services, units])

    const allocationValidator = useMemo(
        () => createQuantityAllocationValidator(selectedQuantity),
        [selectedQuantity]
    )

    const currentValue = isQuantityValue(value)
        ? value
        : allocateQuantityDefaults(quantityOptions, selectedQuantity)

    const assignedTotal = getQuantityFieldsTotal(currentValue)
    const previousQuantityRef = useRef<number | null>(null)
    const previousOptionsRef = useRef<string>(optionsKey)
    const initializedRef = useRef(false)

    useEffect(() => {
        const quantityChanged =
            previousQuantityRef.current !== null &&
            previousQuantityRef.current !== selectedQuantity
        const optionsChanged = previousOptionsRef.current !== optionsKey
        const shouldInitialize =
            !initializedRef.current || !isQuantityValue(value)

        if (shouldInitialize || quantityChanged || optionsChanged) {
            setValue(
                allocateQuantityDefaults(quantityOptions, selectedQuantity)
            )
            initializedRef.current = true
        }

        previousQuantityRef.current = selectedQuantity
        previousOptionsRef.current = optionsKey
    }, [optionsKey, quantityOptions, selectedQuantity])

    const allocationError = allocationValidator(currentValue)
    const showError = allocationError !== true
    const isAtLimit = assignedTotal >= selectedQuantity

    const updateSlugValue = (fieldSlug: string, nextAmount: number) => {
        const currentAmount = Number(currentValue[fieldSlug]) || 0
        let safeAmount = Math.max(0, nextAmount)

        if (safeAmount > currentAmount) {
            const available = Math.max(0, selectedQuantity - assignedTotal)
            safeAmount =
                currentAmount +
                Math.min(safeAmount - currentAmount, available)
        }

        setValue({
            ...currentValue,
            [fieldSlug]: safeAmount,
        })
        setTouched(true)
    }

    return (
        <div
            className={classNames('wbk_input wbk_quantityFields', {
                'wbk_input--half-width': width === 'half-width',
            })}
        >
            {placeholder && (
                <h3 className="wbk_quantityFields__title">{placeholder}</h3>
            )}
            <ul className="wbk_quantityFields__list">
                {quantityOptions.map((field) => {
                    const amount = Number(currentValue[field.slug]) || 0

                    return (
                        <li key={field.slug} className="wbk_quantityFields__row">
                            <span className="wbk_quantityFields__label">
                                {field.label}
                            </span>
                            <div className="wbk_quantityFields__controls">
                                <button
                                    type="button"
                                    className="wbk_quantityFields__button"
                                    aria-label={
                                        wording.reduce_item ||
                                        __('Reduce item', 'webba-booking-lite')
                                    }
                                    onClick={() =>
                                        updateSlugValue(field.slug, amount - 1)
                                    }
                                >
                                    −
                                </button>
                                <input
                                    name={`${slug}[${field.slug}]`}
                                    type="text"
                                    inputMode="numeric"
                                    value={amount}
                                    className={classNames(
                                        'wbk_quantityFields__input',
                                        {
                                            'wbk_quantityFields__input--error':
                                                showError,
                                        }
                                    )}
                                    onBlur={() => setTouched(true)}
                                    onChange={(event) => {
                                        const nextValue = Number(
                                            event.target.value
                                        )
                                        updateSlugValue(
                                            field.slug,
                                            Number.isFinite(nextValue)
                                                ? nextValue
                                                : 0
                                        )
                                    }}
                                />
                                <button
                                    type="button"
                                    className="wbk_quantityFields__button"
                                    aria-label={
                                        wording.increase_item ||
                                        __(
                                            'Increase item',
                                            'webba-booking-lite'
                                        )
                                    }
                                    disabled={isAtLimit}
                                    onClick={() =>
                                        updateSlugValue(field.slug, amount + 1)
                                    }
                                >
                                    +
                                </button>
                            </div>
                        </li>
                    )
                })}
            </ul>
            {showError && (
                <p className="wbk_quantityFields__error">
                    {typeof allocationError === 'string'
                        ? allocationError
                        : `${__(
                              'Please allocate all selected quantities',
                              'webba-booking-lite'
                          )} (${assignedTotal} of ${selectedQuantity} assigned).`}
                </p>
            )}
        </div>
    )
}
