import { IServiceProps } from './types'
import './Services.scss'
import { useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import { __ } from '@wordpress/i18n'
import arrowDownIcon from '../../../../public/images/arrow-down.svg'
import clockIcon from '../../../../public/images/icon-clock.svg'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { wbkFormatPrice } from '../../providers/BookingFormProvider/utils'
import { Button } from '../Button/Button'
import { minutesToText } from '../../../admin/components/WebbaDataTable/utils'
import { ReactComponent as CheckIcon } from '../../../../public/images/icon-checkmark.svg'
import { useWording } from '../../hooks/useWording'
import { getPlainTextFromHtml } from '../../lib/utils'
import { StaffSelector } from '../StaffSelector/StaffSelector'
import { IStaffOption } from '../StaffSelector/types'
import { getStaffOptionsForService } from '../StaffSelector/utils'

const DESCRIPTION_TRUNCATE_LENGTH = 190

export const ServiceItem = ({
    id,
    label,
    description,
    duration,
    price,
    image,
    quantity,
    min_quantity,
    max_quantity,
    selected,
    onUpdate,
    group_booking,
    hide_price,
    staffId,
}: IServiceProps) => {
    const {
        priceFormat,
        preset,
        formData,
        onStaffSelect,
        extractedAttrStaff,
    } = useBookingContext()
    const wording = useWording()
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

    const handleQuantitySelectChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const num = parseInt(e.target.value, 10)
        if (!isNaN(num)) setQuantity(num)
    }

    const toggleSelectService = useCallback(() => {
        onUpdate({
            selected: !selected,
        })
    }, [id, selected, onUpdate])

    const locationId =
        formData?.location != null ? String(formData.location) : null

    const staffOptions = useMemo(
        () =>
            getStaffOptionsForService(
                preset?.staff_members as IStaffOption[] | undefined,
                id,
                locationId,
                extractedAttrStaff
            ),
        [preset?.staff_members, id, locationId, extractedAttrStaff]
    )

    const showStaffSelector =
        selected &&
        extractedAttrStaff.length !== 1 &&
        staffOptions.length > 1

    useEffect(() => {
        if (
            !selected ||
            staffOptions.length !== 1 ||
            extractedAttrStaff.length === 1
        )
            return
        const singleStaffId = staffOptions[0]?.id
        if (singleStaffId == null) return
        const current = (
            formData?.staff as Record<string, string | null> | undefined
        )?.[String(id)]
        if (current === singleStaffId) return
        onStaffSelect(id, singleStaffId)
    }, [
        selected,
        id,
        staffOptions,
        extractedAttrStaff.length,
        formData?.staff,
        onStaffSelect,
    ])

    const selectedStaffId =
        staffId ??
        (formData?.staff as Record<string, string | null> | undefined)?.[
            String(id)
        ] ??
        null

    return (
        <div
            className={classNames('wbk_service_item', `id__${id}`, {
                ['wbk_service_item--selected']: selected,
            })}
            onClick={toggleSelectService}
        >
            <div className={'wbk_service_item__top-part'}>
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
                            <p
                                className={
                                    'wbk_service_item__heading-wrapper__duration'
                                }
                            >
                                <img
                                    src={clockIcon}
                                    alt={
                                        wording.duration ||
                                        __('Duration', 'webba-booking-lite')
                                    }
                                />
                                <span>
                                    {minutesToText(Number(duration), {
                                        h: wording.hour,
                                        min: wording.minute,
                                    })}
                                </span>
                            </p>
                        </div>
                        {(!hide_price || hasQuantityRange) && (
                            <div
                                className={
                                    'wbk_service_item__heading-wrapper__price-row'
                                }
                            >
                                {!hide_price && (
                                    <div
                                        className={
                                            'wbk_service_item__heading-wrapper__price'
                                        }
                                    >
                                        {(price && Number(price) > 0 && (
                                            <span>
                                                {wbkFormatPrice(
                                                    Number(price),
                                                    priceFormat
                                                )}
                                            </span>
                                        )) ||
                                            wording.free ||
                                            __('Free', 'webba-booking-lite')}
                                    </div>
                                )}
                                {hasQuantityRange && (
                                    <select
                                        className={
                                            'wbk_service_item__quantity-select'
                                        }
                                        value={currentQuantity}
                                        onChange={handleQuantitySelectChange}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                    >
                                        {Array.from(
                                            { length: maxQ - minQ + 1 },
                                            (_, i) => minQ + i
                                        ).map((n) => (
                                            <option key={n} value={n}>
                                                {n}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}
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
                        <>
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
                                            __(
                                                'Show less',
                                                'webba-booking-lite'
                                            ))) ||
                                        wording.show_more ||
                                        __('Show more', 'webba-booking-lite')}
                                </strong>
                                <img
                                    src={arrowDownIcon}
                                    alt={
                                        wording.toggle_description ||
                                        __(
                                            'Toggle description',
                                            'webba-booking-lite'
                                        )
                                    }
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
            {showStaffSelector && (
                <div
                    className="wbk_service_item__staff-section"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                >
                    <h4 className="wbk_service_item__staff-section-label">
                        {wording.select_staff_member ?? __('SELECT STAFF MEMBER', 'webba-booking-lite')}
                    </h4>
                    <StaffSelector
                        staffOptions={staffOptions}
                        selectedStaffId={selectedStaffId}
                        onSelect={(staffId: string | null) => onStaffSelect(id, staffId)}
                    />
                </div>
            )}
            <Button
                classes={classNames('wbk_service_item__mobile-select-button', {
                    ['wbk_service_item__mobile-select-button--selected']:
                        selected,
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
