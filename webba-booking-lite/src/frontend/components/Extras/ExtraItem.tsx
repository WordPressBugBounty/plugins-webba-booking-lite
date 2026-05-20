import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { __ } from '@wordpress/i18n'
import { ReactComponent as CheckIcon } from '../../../../public/images/icon-checkmark.svg'
import arrowDownIcon from '../../../../public/images/arrow-down.svg'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { wbkFormatPrice } from '../../providers/BookingFormProvider/utils'
import { Button } from '../Button/Button'
import { useWording } from '../../hooks/useWording'
import { getPlainTextFromHtml } from '../../lib/utils'
import { IExtraProps } from './types'
import cartReduceIcon from '../../../../public/images/icon-cart-reduce.svg'
import cartIncreaseIcon from '../../../../public/images/icon-cart-increase.svg'
import '../Services/Services.scss'
import './Extras.scss'

const DESCRIPTION_TRUNCATE_LENGTH = 190

export const ExtraItem = ({
    id,
    label,
    description,
    image,
    price,
    min_quantity,
    max_quantity,
    selected,
    quantity,
    onUpdate,
}: IExtraProps) => {
    const wording = useWording()
    const { priceFormat } = useBookingContext()
    const [descriptionExpanded, setDescriptionExpanded] = useState(false)
    const descriptionPlainText = description ? getPlainTextFromHtml(description) : ''
    const shouldTruncate =
        descriptionPlainText.length > DESCRIPTION_TRUNCATE_LENGTH

    const minQ = Math.max(1, Number(min_quantity) || 1)
    const maxQ = Math.max(minQ, Number(max_quantity) || 1)
    const hasQuantityRange = maxQ > minQ
    const currentQuantity = Math.min(
        maxQ,
        Math.max(minQ, Number(quantity) || minQ)
    )

    const setQuantity = useCallback(
        (updatedQuantity: number) => {
            const num = Math.min(maxQ, Math.max(minQ, updatedQuantity))
            onUpdate({ quantity: num })
        },
        [minQ, maxQ, onUpdate]
    )

    const toggleSelectExtra = useCallback(() => {
        onUpdate({
            selected: !selected,
        })
    }, [selected, onUpdate])

    return (
        <div
            className={classNames('wbk_service_item', 'wbk_extra_item', `id__${id}`, {
                ['wbk_service_item--selected']: selected,
            })}
            onClick={toggleSelectExtra}
        >
            <div className={'wbk_service_item__top-part'}>
                <div
                    className={'wbk_extra_item__select-checkbox-wrap'}
                    onClick={(event) => event.stopPropagation()}
                >
                    <input
                        type="checkbox"
                        className={'wbk_extra_item__select-checkbox'}
                        checked={selected}
                        onChange={() =>
                            onUpdate({
                                selected: !selected,
                            })
                        }
                        aria-label={
                            selected
                                ? wording.selected ||
                                __('Selected', 'webba-booking-lite')
                                : wording.select ||
                                __('+ Select', 'webba-booking-lite')
                        }
                    />
                </div>
                {image && (
                    <img
                        src={image}
                        alt={label}
                        className={'wbk_service_item__image'}
                    />
                )}
                <div className={'wbk_service_item__content-wrapper'}>
                    <div className={'wbk_service_item__heading-wrapper'}>
                        <div className={'wbk_service_item__heading-content'}>
                            <h3>{label}</h3>
                            {description && (
                                <p
                                    className={classNames('wbk_service_item__description', {
                                        ['wbk_service_item__description--expanded']:
                                            descriptionExpanded,
                                    })}
                                    {...(descriptionExpanded || !shouldTruncate
                                        ? {
                                            dangerouslySetInnerHTML: {
                                                __html: description,
                                            },
                                        }
                                        : {
                                            children: descriptionPlainText.slice(
                                                0,
                                                DESCRIPTION_TRUNCATE_LENGTH
                                            ),
                                        })}
                                />
                            )}
                            {description && shouldTruncate && (
                                <div
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
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
                        </div>
                        <div className={'wbk_service_item__heading-wrapper__price-row'}>
                            <div className={'wbk_service_item__heading-wrapper__price'}>
                                {(price && Number(price) > 0 && (
                                    <span>{wbkFormatPrice(Number(price), priceFormat)}</span>
                                )) ||
                                    wording.free ||
                                    __('Free', 'webba-booking-lite')}
                            </div>
                            {selected && hasQuantityRange && (
                                <div
                                    className={'wbk_extra_item__quantity-below-price'}
                                    onClick={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                    }}
                                >
                                    <div className={'wbk_service_item__counter-input-wrapper'}>
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            className={
                                                'wbk_service_item__counter-button wbk_service_item__counter-button--reduce'
                                            }
                                            onClick={() =>
                                                setQuantity(currentQuantity - 1)
                                            }
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === 'Enter' ||
                                                    event.key === ' '
                                                ) {
                                                    event.preventDefault()
                                                    setQuantity(currentQuantity - 1)
                                                }
                                            }}
                                        >
                                            <img
                                                src={cartReduceIcon}
                                                alt={
                                                    wording.reduce_item ||
                                                    __(
                                                        'Reduce item',
                                                        'webba-booking-lite'
                                                    )
                                                }
                                            />
                                        </div>
                                        <input
                                            className={'wbk_service_item__counter-input'}
                                            value={currentQuantity}
                                            readOnly
                                            aria-label={__(
                                                'Quantity',
                                                'webba-booking-lite'
                                            )}
                                        />
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            className={
                                                'wbk_service_item__counter-button wbk_service_item__counter-button--increase'
                                            }
                                            onClick={() =>
                                                setQuantity(currentQuantity + 1)
                                            }
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === 'Enter' ||
                                                    event.key === ' '
                                                ) {
                                                    event.preventDefault()
                                                    setQuantity(currentQuantity + 1)
                                                }
                                            }}
                                        >
                                            <img
                                                src={cartIncreaseIcon}
                                                alt={
                                                    wording.increase_item ||
                                                    __(
                                                        'Increase item',
                                                        'webba-booking-lite'
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
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
