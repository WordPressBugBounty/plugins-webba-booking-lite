import { IUnitAttendees, IUnitProps } from './types'
import './Services.scss'
import { useCallback, useMemo, useState } from 'react'
import classNames from 'classnames'
import { __ } from '@wordpress/i18n'
import arrowDownIcon from '../../../../public/images/arrow-down.svg'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { wbkFormatPrice } from '../../providers/BookingFormProvider/utils'
import { Button } from '../Button/Button'
import { ReactComponent as CheckIcon } from '../../../../public/images/icon-checkmark.svg'
import { useWording } from '../../hooks/useWording'
import { getPlainTextFromHtml } from '../../lib/utils'
import cartReduceIcon from '../../../../public/images/icon-cart-reduce.svg'
import cartIncreaseIcon from '../../../../public/images/icon-cart-increase.svg'

const DESCRIPTION_TRUNCATE_LENGTH = 190

const getTotalAttendees = (attendees: IUnitAttendees) =>
    attendees.adult + attendees.child + attendees.infant

const getNumericPriceValues = (value: unknown): number[] => {
    const numeric = Number(value)
    if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
        return [numeric]
    }

    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) {
            return []
        }
        try {
            const parsed = JSON.parse(trimmed)
            return getNumericPriceValues(parsed)
        } catch {
            return []
        }
    }

    if (Array.isArray(value)) {
        return value.flatMap((item) => getNumericPriceValues(item))
    }

    if (value && typeof value === 'object') {
        return Object.values(value as Record<string, unknown>).flatMap((item) =>
            getNumericPriceValues(item)
        )
    }

    return []
}

const getBucketDisplayPrice = (value: unknown): number => {
    const values = getNumericPriceValues(value).filter((v) => v > 0)
    if (values.length === 0) {
        return 0
    }
    return Math.min(...values)
}

const getPriceBuckets = (value: unknown): { weekday: number; weekend: number } => {
    let parsedValue: unknown = value

    if (typeof parsedValue === 'string') {
        const trimmed = parsedValue.trim()
        if (!trimmed) {
            return { weekday: 0, weekend: 0 }
        }
        try {
            parsedValue = JSON.parse(trimmed)
        } catch {
            const numeric = Number(trimmed)
            return {
                weekday: Number.isFinite(numeric) ? numeric : 0,
                weekend: Number.isFinite(numeric) ? numeric : 0,
            }
        }
    }

    if (
        !parsedValue ||
        typeof parsedValue !== 'object' ||
        Array.isArray(parsedValue)
    ) {
        const numeric = Number(parsedValue)
        return {
            weekday: Number.isFinite(numeric) ? numeric : 0,
            weekend: Number.isFinite(numeric) ? numeric : 0,
        }
    }

    const obj = parsedValue as Record<string, unknown>
    const pricingObj =
        obj.pricing && typeof obj.pricing === 'object'
            ? (obj.pricing as Record<string, unknown>)
            : obj

    return {
        weekday: getBucketDisplayPrice(pricingObj.weekday),
        weekend: getBucketDisplayPrice(pricingObj.weekend_holiday),
    }
}

export const UnitItem = ({
    id,
    label,
    description,
    price,
    image,
    quantity,
    capacity,
    selected,
    onUpdate,
    attendee_type_adult,
    attendee_type_child,
    attendee_type_infant,
    attendees,
}: IUnitProps) => {
    const { priceFormat } = useBookingContext()
    const wording = useWording()
    const [descriptionExpanded, setDescriptionExpanded] = useState(false)
    const descriptionPlainText = description ? getPlainTextFromHtml(description) : ''
    const shouldTruncate =
        descriptionPlainText.length > DESCRIPTION_TRUNCATE_LENGTH

    const unitCapacity = Math.max(1, Number(capacity) || 1)
    const hasCapacityCounter =
        capacity !== undefined &&
        capacity !== null &&
        String(capacity) !== '' &&
        Number(capacity) > 1
    const currentQuantity = Math.min(
        unitCapacity,
        Math.max(1, Number(quantity) || 1)
    )
    const enabledRows = useMemo(
        () => ({
            adult: attendee_type_adult === 'yes',
            child: attendee_type_child === 'yes',
            infant: attendee_type_infant === 'yes',
        }),
        [attendee_type_adult, attendee_type_child, attendee_type_infant]
    )
    const currentAttendees = attendees || {
        adult: enabledRows.adult ? 1 : 0,
        child: 0,
        infant: 0,
    }
    const showAttendeeInputs = enabledRows.adult || enabledRows.child || enabledRows.infant
    const showQuantityInput = hasCapacityCounter && !showAttendeeInputs
    const displayedPeopleCount = showAttendeeInputs
        ? getTotalAttendees(currentAttendees)
        : currentQuantity
    const displayPriceText = useMemo(() => {
        const { weekday, weekend } = getPriceBuckets(price)
        if (weekday > 0 && weekend > 0 && weekday !== weekend) {
            const minPrice = Math.min(weekday, weekend)
            const maxPrice = Math.max(weekday, weekend)
            return `${wbkFormatPrice(minPrice, priceFormat)} - ${wbkFormatPrice(maxPrice, priceFormat)}`
        }

        const displayPriceValue =
            weekday > 0
                ? weekday
                : weekend > 0
                  ? weekend
                  : getBucketDisplayPrice(price)

        if (displayPriceValue <= 0) {
            return ''
        }

        return wbkFormatPrice(displayPriceValue, priceFormat)
    }, [price, priceFormat])

    const updateQuantity = useCallback(
        (nextQuantity: number) => {
            const clamped = Math.min(unitCapacity, Math.max(1, nextQuantity))
            onUpdate({ quantity: clamped })
        },
        [onUpdate, unitCapacity]
    )

    const updateAttendees = useCallback(
        (fieldName: keyof IUnitAttendees, delta: number) => {
            const existing = attendees || currentAttendees
            const previousValue = existing[fieldName] || 0
            const nextValue = Math.max(0, previousValue + delta)
            const nextAttendees = {
                ...existing,
                [fieldName]: nextValue,
            }
            const totalAttendees = getTotalAttendees(nextAttendees)

            if (totalAttendees > unitCapacity) {
                return
            }

            onUpdate({
                attendees: nextAttendees,
            })
        },
        [attendees, currentAttendees, onUpdate, unitCapacity]
    )

    const toggleSelectUnit = useCallback(() => {
        onUpdate({
            selected: !selected,
        })
    }, [selected, onUpdate])

    return (
        <div
            className={classNames('wbk_service_item', `id__${id}`, {
                ['wbk_service_item--selected']: selected,
            })}
            onClick={toggleSelectUnit}
        >
            <div className={'wbk_service_item__top-part'}>
                {image && (
                    <img
                        src={String(image)}
                        alt={label}
                        className={'wbk_service_item__image'}
                    />
                )}
                <div className={'wbk_service_item__content-wrapper'}>
                    <div className={'wbk_service_item__heading-wrapper'}>
                        <div className={'wbk_service_item__heading-content'}>
                            <h3>{label}</h3>
                        </div>
                        <div className={'wbk_service_item__heading-wrapper__price-row'}>
                            <div className={'wbk_service_item__heading-wrapper__price'}>
                                {(displayPriceText && (
                                    <span>
                                        {displayPriceText}
                                    </span>
                                )) ||
                                    wording.free ||
                                    __('Free', 'webba-booking-lite')}
                            </div>
                        </div>
                    </div>
                    {description && (
                        <p
                            className={classNames(
                                'wbk_service_item__description',
                                {
                                    ['wbk_service_item__description--expanded']:
                                        descriptionExpanded,
                                }
                            )}
                            {...(descriptionExpanded || !shouldTruncate
                                ? {
                                      dangerouslySetInnerHTML: {
                                          __html: description,
                                      },
                                  }
                                : {
                                      children:
                                          descriptionPlainText.slice(
                                              0,
                                              DESCRIPTION_TRUNCATE_LENGTH
                                          ),
                                  })}
                        />
                    )}
                    {description && shouldTruncate && (
                        <div
                            onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                setDescriptionExpanded(!descriptionExpanded)
                            }}
                            className={classNames(
                                'wbk_service_item__description-toggle',
                                {
                                    ['wbk_service_item__description-toggle--expanded']:
                                        descriptionExpanded,
                                }
                            )}
                        >
                            <strong>
                                {(descriptionExpanded &&
                                    (wording.show_less ||
                                        __('Show less', 'webba-booking-lite'))) ||
                                    wording.show_more ||
                                    __('Show more', 'webba-booking-lite')}
                            </strong>
                            <img
                                src={arrowDownIcon}
                                alt={
                                    wording.toggle_description ||
                                    __('Toggle description', 'webba-booking-lite')
                                }
                            />
                        </div>
                    )}
                    {selected && showQuantityInput && (
                        <div
                            className="wbk_service_item__counter-row"
                            onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                            }}
                        >
                            <span className="wbk_service_item__counter-label">
                                {__('Quantity', 'webba-booking-lite')}
                            </span>
                            <div className="wbk_service_item__counter-input-wrapper">
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className="wbk_service_item__counter-button wbk_service_item__counter-button--reduce"
                                    onClick={() => updateQuantity(currentQuantity - 1)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault()
                                            updateQuantity(currentQuantity - 1)
                                        }
                                    }}
                                >
                                    <img
                                        src={cartReduceIcon}
                                        alt={wording.reduce_item || __('Reduce item', 'webba-booking-lite')}
                                    />
                                </div>
                                <input
                                    className="wbk_service_item__counter-input"
                                    value={currentQuantity}
                                    readOnly
                                />
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className="wbk_service_item__counter-button wbk_service_item__counter-button--increase"
                                    onClick={() => updateQuantity(currentQuantity + 1)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault()
                                            updateQuantity(currentQuantity + 1)
                                        }
                                    }}
                                >
                                    <img
                                        src={cartIncreaseIcon}
                                        alt={wording.increase_item || __('Increase item', 'webba-booking-lite')}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {selected && hasCapacityCounter && enabledRows.adult && (
                        <div
                            className="wbk_service_item__counter-row"
                            onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                            }}
                        >
                            <span className="wbk_service_item__counter-label">
                                {wording.unit_adult ||
                                    __('Adult', 'webba-booking-lite')}
                            </span>
                            <div className="wbk_service_item__counter-input-wrapper">
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className="wbk_service_item__counter-button wbk_service_item__counter-button--reduce"
                                    onClick={() => updateAttendees('adult', -1)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault()
                                            updateAttendees('adult', -1)
                                        }
                                    }}
                                >
                                    <img
                                        src={cartReduceIcon}
                                        alt={wording.reduce_item || __('Reduce item', 'webba-booking-lite')}
                                    />
                                </div>
                                <input
                                    className="wbk_service_item__counter-input"
                                    value={currentAttendees.adult}
                                    readOnly
                                />
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className="wbk_service_item__counter-button wbk_service_item__counter-button--increase"
                                    onClick={() => updateAttendees('adult', 1)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault()
                                            updateAttendees('adult', 1)
                                        }
                                    }}
                                >
                                    <img
                                        src={cartIncreaseIcon}
                                        alt={wording.increase_item || __('Increase item', 'webba-booking-lite')}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {selected && hasCapacityCounter && enabledRows.child && (
                        <div
                            className="wbk_service_item__counter-row"
                            onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                            }}
                        >
                            <span className="wbk_service_item__counter-label">
                                {wording.unit_child ||
                                    __('Child', 'webba-booking-lite')}
                            </span>
                            <div className="wbk_service_item__counter-input-wrapper">
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className="wbk_service_item__counter-button wbk_service_item__counter-button--reduce"
                                    onClick={() => updateAttendees('child', -1)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault()
                                            updateAttendees('child', -1)
                                        }
                                    }}
                                >
                                    <img
                                        src={cartReduceIcon}
                                        alt={wording.reduce_item || __('Reduce item', 'webba-booking-lite')}
                                    />
                                </div>
                                <input
                                    className="wbk_service_item__counter-input"
                                    value={currentAttendees.child}
                                    readOnly
                                />
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className="wbk_service_item__counter-button wbk_service_item__counter-button--increase"
                                    onClick={() => updateAttendees('child', 1)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault()
                                            updateAttendees('child', 1)
                                        }
                                    }}
                                >
                                    <img
                                        src={cartIncreaseIcon}
                                        alt={wording.increase_item || __('Increase item', 'webba-booking-lite')}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {selected && hasCapacityCounter && enabledRows.infant && (
                        <div
                            className="wbk_service_item__counter-row"
                            onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                            }}
                        >
                            <span className="wbk_service_item__counter-label">
                                {wording.unit_infant ||
                                    __('Infant', 'webba-booking-lite')}
                            </span>
                            <div className="wbk_service_item__counter-input-wrapper">
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className="wbk_service_item__counter-button wbk_service_item__counter-button--reduce"
                                    onClick={() => updateAttendees('infant', -1)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault()
                                            updateAttendees('infant', -1)
                                        }
                                    }}
                                >
                                    <img
                                        src={cartReduceIcon}
                                        alt={wording.reduce_item || __('Reduce item', 'webba-booking-lite')}
                                    />
                                </div>
                                <input
                                    className="wbk_service_item__counter-input"
                                    value={currentAttendees.infant}
                                    readOnly
                                />
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className="wbk_service_item__counter-button wbk_service_item__counter-button--increase"
                                    onClick={() => updateAttendees('infant', 1)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault()
                                            updateAttendees('infant', 1)
                                        }
                                    }}
                                >
                                    <img
                                        src={cartIncreaseIcon}
                                        alt={wording.increase_item || __('Increase item', 'webba-booking-lite')}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {selected && hasCapacityCounter && (
                        <p className="wbk_service_item__capacity-caption">
                            {wording.unit_max_attendees ||
                                __('Max attendees', 'webba-booking-lite')}
                            : {unitCapacity} (
                            {displayedPeopleCount})
                        </p>
                    )}
                </div>
            </div>
            <Button
                classes={classNames('wbk_service_item__mobile-select-button', {
                    ['wbk_service_item__mobile-select-button--selected']: selected,
                })}
                type={'custom'}
                svgIcon={selected && (CheckIcon as any)}
            >
                {selected
                    ? wording.selected || __('Selected', 'webba-booking-lite')
                    : wording.select || __('+ Select', 'webba-booking-lite')}
            </Button>
        </div>
    )
}
