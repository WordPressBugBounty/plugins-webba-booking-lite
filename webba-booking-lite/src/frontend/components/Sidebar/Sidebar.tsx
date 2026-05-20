import { FC, useCallback, useMemo, useRef, useEffect, useState } from 'react'
import { __ } from '@wordpress/i18n'
import { differenceInCalendarDays, format } from 'date-fns'
import { ISidebarProps } from './types'
import ChevronLeftIcon from '../../../../public/images/chevron-left-icon.svg'
import './Sidebar.scss'
import classNames from 'classnames'
import { Button } from '../Button/Button'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { wbkFormatPrice } from '../../providers/BookingFormProvider/utils'
import { SidebarItem } from './SidebarItem'
import { ReactComponent as CloseIcon } from '../../../../public/images/icon-close.svg'
import { ReactComponent as ArrowDownIcon } from '../../../../public/images/arrow-down.svg'
import iconPhone from '../../../../public/images/icon-phone.svg'
import iconEmail from '../../../../public/images/icon-email.svg'
import { useWording } from '../../hooks/useWording'
import calendarRangeIcon from '../../../../public/images/icon-calendar.svg'
import dayCountIcon from '../../../../public/images/icon-clock.svg'
import { IExtraProps } from '../Extras/types'

const parseYmdLocal = (ymd: string): Date => {
    const parts = ymd.split('-').map(Number)
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
        return new Date(ymd)
    }
    const [y, m, d] = parts
    return new Date(y, m - 1, d)
}

export const Sidebar: FC<ISidebarProps> = ({
    onAddMore,
    toggle,
    onToggle,
    title,
}) => {
    const {
        services,
        extras,
        units,
        bookingMode,
        attrService,
        priceFormat,
        amountData,
        preset,
        formData,
    } = useBookingContext()
    const wording = useWording()
    const [animatedIds, setAnimatedIds] = useState<number[]>([])
    const [showSummary, setShowSummary] = useState(false)
    const [extrasExpanded, setExtrasExpanded] = useState(true)
    const prevIdsRef = useRef<number[]>([])

    const { help_title, help_phone, help_email } = useMemo(() => {
        const wording = preset?.wording || {}
        const help_title = wording.help_title || ''
        const help_phone = wording.help_phone || ''
        const help_email = wording.help_email || ''
        return { help_title, help_phone, help_email }
    }, [preset])

    const items = useMemo(() => {
        return bookingMode === 'units'
            ? (units || []).filter(({ selected }) => selected)
            : services.filter(({ selected }) => selected)
    }, [services, units, bookingMode])

    const unitStaySummary = useMemo(() => {
        if (bookingMode !== 'units') {
            return { dayCount: null as number | null, rangeLabel: null as string | null }
        }
        const range = (formData as Record<string, unknown>)?.range as
            | { start?: string; end?: string }
            | undefined

        let dayCount: number | null = null
        if (range?.start && range?.end) {
            const startD = parseYmdLocal(range.start)
            const endD = parseYmdLocal(range.end)
            dayCount = differenceInCalendarDays(endD, startD) + 1
        }

        let rangeLabel: string | null = null
        const selectedUnitId = (units || []).find((u) => u.selected)?.id
        if (selectedUnitId != null) {
            const placesMap = formData.places as Record<string, unknown> | undefined
            const unitPlaces = placesMap?.[String(selectedUnitId)]
            if (
                Array.isArray(unitPlaces) &&
                unitPlaces.length > 0 &&
                range?.start &&
                range?.end
            ) {
                const startD = parseYmdLocal(range.start)
                const endD = parseYmdLocal(range.end)
                rangeLabel = `${format(startD, 'MMM d')} – ${format(endD, 'MMM d, yyyy')}`
            }
        }

        return { dayCount, rangeLabel }
    }, [bookingMode, formData, units])

    const selectedUnitId = useMemo(
        () => (units || []).find((unit) => unit.selected)?.id ?? null,
        [units]
    )
    const hasSelectedUnitOffer = useMemo(() => {
        if (bookingMode !== 'units' || selectedUnitId == null) return false
        const placesMap = formData.places as Record<string, unknown> | undefined
        const unitPlaces = placesMap?.[String(selectedUnitId)]
        return Array.isArray(unitPlaces) && unitPlaces.length > 0
    }, [bookingMode, selectedUnitId, formData.places])
    const hasUnitApiPrice = useMemo(() => {
        if (bookingMode !== 'units' || selectedUnitId == null) return false
        if (!Array.isArray(amountData?.items)) return false
        return amountData.items.some(
            (item: any) =>
                Number(item?.id) === Number(selectedUnitId) &&
                typeof item?.price === 'number' &&
                !Number.isNaN(item.price)
        )
    }, [bookingMode, selectedUnitId, amountData?.items])
    const canShowUnitPrice = bookingMode !== 'units' || (hasSelectedUnitOffer && hasUnitApiPrice)

    // Helper to get price for an item from amountData.items
    const getApiItemPrice = (itemId: number, index: number) => {
        if (Array.isArray(amountData.items) && amountData.items.length > 0) {
            // Find the nth occurrence of itemId in amountData.items
            let count = 0
            for (let i = 0; i < amountData.items.length; i++) {
                if (amountData.items[i].id === itemId) {
                    if (count === index) {
                        return amountData.items[i].price
                    }
                    count++
                }
            }
        }
        return undefined
    }

    // Always sort selected services by selectedAt before rendering
    const sortedItems = items
        .slice()
        .sort((a, b) => (a.selectedAt || 0) - (b.selectedAt || 0))

    const selectedExtras = useMemo(() => {
        return (extras || [])
            .filter((extra: IExtraProps) => extra.selected)
            .slice()
            .sort((a, b) => (a.selectedAt || 0) - (b.selectedAt || 0))
    }, [extras])

    const getExtraLinePrice = useCallback(
        (extra: IExtraProps) => {
            const quantity = Math.max(1, Number(extra.quantity) || 1)
            const amountPayload = amountData as unknown as Record<string, unknown>
            const orderedFromApi = amountPayload?.ordered_extras
            if (Array.isArray(orderedFromApi)) {
                const row = orderedFromApi.find(
                    (entry: { id?: number }) => Number(entry?.id) === Number(extra.id)
                ) as { line_net?: number | string } | undefined
                if (row != null && row.line_net !== undefined && row.line_net !== '') {
                    const parsed = Number(row.line_net)
                    if (!Number.isNaN(parsed)) {
                        return parsed
                    }
                }
            }
            const itemsList = amountData?.items as
                | Array<{ id?: unknown; price?: number }>
                | undefined
            if (Array.isArray(itemsList)) {
                const extraKey = `extra:${extra.id}`
                const matched = itemsList.filter(
                    (entry) => String(entry?.id) === extraKey
                )
                if (matched.length > 0) {
                    return matched.reduce(
                        (sum, entry) => sum + Number(entry.price || 0),
                        0
                    )
                }
            }
            const unitPrice = Number(extra.price)
            if (unitPrice > 0 && quantity > 0) {
                return unitPrice * quantity
            }
            return 0
        },
        [amountData]
    )

    useEffect(() => {
        const currentIds = sortedItems.map((item) => item.id)
        const prevIds = prevIdsRef.current
        const newIds = currentIds.filter((id) => !prevIds.includes(id))
        if (newIds.length > 0) {
            setAnimatedIds(newIds)
            setTimeout(() => setAnimatedIds([]), 500)
        }
        prevIdsRef.current = currentIds
    }, [sortedItems])

    // Local fallback calculation for total
    const localCalculatedTotal = useMemo(() => {
        let total = 0
        sortedItems.forEach((service) => {
            const matchedItems = amountData.items.filter(
                (item) => item.id === service.id
            )
            if (matchedItems.length > 0) {
                total += matchedItems.reduce(
                    (sum, item) => sum + (item.price || 0),
                    0
                )
            } else {
                const numericPrice = Number(service.price)
                if (numericPrice > 0 && service.quantity > 0) {
                    total += numericPrice * service.quantity
                }
            }
        })
        return total
    }, [amountData, sortedItems])

    // Use API total if available, otherwise fallback
    const apiTotal = Number(amountData.to_pay_total)
    const displayTotal = !isNaN(apiTotal) ? apiTotal : localCalculatedTotal

    const isNarrowForm = preset?.settings?.narrow_form === true

    // Fallback tax calculation logic
    const apiTax = Number(amountData.tax_to_pay)
    let displayTax = 0
    if (!isNaN(apiTax) && apiTax > 0) {
        displayTax = apiTax
    } else {
        const presetTax = Number(preset?.settings?.tax)
        if (!isNaN(presetTax) && presetTax > 0) {
            // Calculate tax based on localCalculatedTotal
            displayTax = (localCalculatedTotal * presetTax) / 100
        }
    }

    const isAddMoreVisible = useMemo(() => {
        return (
            preset?.settings?.allowed_multiple_service_selection === true &&
            (!attrService || attrService === '0')
        )
    }, [preset, attrService])

    const depositTotal = useMemo(() => {
        if (!Array.isArray(amountData?.items)) return 0
        return amountData.items.reduce(
            (sum, item) =>
                item.have_deposit && typeof item.item_to_pay === 'number'
                    ? sum + item.item_to_pay
                    : sum,
            0
        )
    }, [amountData?.items])

    const hasSummaryAmounts = useMemo(
        () =>
            depositTotal > 0 ||
            Number(amountData?.service_fees) > 0 ||
            displayTax > 0 ||
            Number(amountData?.left_to_pay) > 0,
        [depositTotal, amountData?.service_fees, amountData?.left_to_pay, displayTax]
    )

    return (
        <div
            className={classNames('wbk_sidebar__wrapper', {
                ['wbk_sidebar__wrapper--open']: toggle,
                ['wbk_sidebar__wrapper--hidden']: !toggle,
            })}
        >
            <div
                className={classNames('wbk_sidebar__toggle-button', {
                    ['wbk_sidebar__toggle-button--open']: toggle,
                    ['wbk_sidebar__toggle-button--hidden']: !toggle,
                    ['wbk_sidebar__toggle-button--narrow']: isNarrowForm,
                })}
                onClick={() => onToggle(!toggle)}
            >
                <img src={ChevronLeftIcon} />
            </div>
            <div
                className={classNames('wbk_sidebar__inner-wrapper', {
                    ['wbk_sidebar__inner-wrapper--open']: toggle,
                    ['wbk_sidebar__inner-wrapper--hidden']: !toggle,
                })}
            >
                <div
                    onClick={() => onToggle(!toggle)}
                    className={'wbk_sidebar__mobile-close-button'}
                >
                    <CloseIcon />
                </div>
                <h3 className={'wbk_sidebar__title'}>{title}</h3>
                {!!sortedItems.length &&
                    (bookingMode === 'units' ||
                        sortedItems.some(
                            (item) => item.places && item.places.length > 0
                        )) ? (
                    <>
                        <div className={'wbk_sidebar__items'}>
                            <div className={'wbk_sidebar__items__inner'}>
                                {sortedItems.map((item, idx) => {
                                    // Find the price for this item from API, fallback to local
                                    // If there are multiple items with the same id, use index
                                    const apiPrice = getApiItemPrice(
                                        item.id,
                                        idx
                                    )
                                    const price =
                                        typeof apiPrice === 'number' &&
                                            !isNaN(apiPrice)
                                            ? apiPrice
                                            : Number(item.price) || 0
                                    return (
                                        <div
                                            key={item.id + '-' + idx}
                                            className={classNames(
                                                'wbk_sidebar__items__item wbk_sidebar__items__item--vertical',
                                                {
                                                    ['wbk_sidebar__items__item--animated']:
                                                        animatedIds.includes(
                                                            item.id
                                                        ),
                                                }
                                            )}
                                        >
                                            {bookingMode === 'units' ? (
                                                <>
                                                    <div
                                                        className={
                                                            'wbk_sidebar__items__item__inner'
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                'wbk_sidebar__items__item__info'
                                                            }
                                                        >
                                                            <h4
                                                                className={
                                                                    'wbk_sidebar__items__item__title'
                                                                }
                                                            >
                                                                {item.quantity &&
                                                                    Number(item.quantity) > 1
                                                                    ? `${item.quantity}x `
                                                                    : ''}
                                                                {item.label}
                                                            </h4>
                                                        </div>
                                                        {canShowUnitPrice && (
                                                            <div
                                                                className={
                                                                    'wbk_sidebar__items__item__price'
                                                                }
                                                            >
                                                                {(price > 0 &&
                                                                    wbkFormatPrice(
                                                                        price,
                                                                        priceFormat
                                                                    )) ||
                                                                    wording.free ||
                                                                    __(
                                                                        'Free',
                                                                        'webba-booking-lite'
                                                                    )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={
                                                            'wbk_sidebar__items__item__meta'
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                'wbk_sidebar__items__item__meta-row'
                                                            }
                                                        >
                                                            <span
                                                                className={
                                                                    'wbk_sidebar__items__item__meta-icon wbk_sidebar__items__item__meta-icon--img wbk_sidebar__items__item__meta-icon--muted'
                                                                }
                                                            >
                                                                <img
                                                                    src={dayCountIcon}
                                                                    alt=""
                                                                />
                                                            </span>
                                                            <span
                                                                className={
                                                                    'wbk_sidebar__items__item__meta-label'
                                                                }
                                                            >
                                                                {unitStaySummary.dayCount !==
                                                                    null
                                                                    ? `${unitStaySummary.dayCount} ${unitStaySummary.dayCount === 1 ? __('day', 'webba-booking-lite') : wording.unit_days || __('days', 'webba-booking-lite')}`
                                                                    : `— ${wording.unit_days || __('days', 'webba-booking-lite')}`}
                                                            </span>
                                                        </div>
                                                        <div
                                                            className={
                                                                'wbk_sidebar__items__item__meta-row'
                                                            }
                                                        >
                                                            <span
                                                                className={
                                                                    'wbk_sidebar__items__item__meta-icon wbk_sidebar__items__item__meta-icon--img wbk_sidebar__items__item__meta-icon--muted'
                                                                }
                                                            >
                                                                <img
                                                                    src={calendarRangeIcon}
                                                                    alt=""
                                                                />
                                                            </span>
                                                            <span
                                                                className={
                                                                    'wbk_sidebar__items__item__meta-label'
                                                                }
                                                            >
                                                                {unitStaySummary.rangeLabel ||
                                                                    wording.unit_no_date_selected ||
                                                                    __('No date selected', 'webba-booking-lite')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <SidebarItem
                                                    {...item}
                                                    price={String(price)}
                                                />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className={'wbk_sidebar__items wbk_sidebar__items--less-gap'}>
                            {/* discount */}
                            {Number(amountData.discount) > 0 && (
                                <div className={'wbk_sidebar__items__item'}>
                                    <h4
                                        className={
                                            'wbk_sidebar__items__item__title'
                                        }
                                    >
                                        {wording.discount ||
                                            __(
                                                'Discount (-)',
                                                'webba-booking-lite'
                                            )}
                                    </h4>
                                    <div>
                                        <p
                                            className={
                                                'wbk_sidebar__items__item__title'
                                            }
                                        >
                                            {wbkFormatPrice(
                                                amountData.discount,
                                                priceFormat
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {/* discount end */}
                            {/* service fees */}
                            {/* {Number(amountData?.service_fees) > 0 && (
                                <div className={'wbk_sidebar__items__item'}>
                                    <h4
                                        className={
                                            'wbk_sidebar__items__item__title'
                                        }
                                    >
                                        {wording.service_fees ||
                                            __(
                                                'Service Fees',
                                                'webba-booking-lite'
                                            )}
                                    </h4>
                                    <div>
                                        <p
                                            className={
                                                'wbk_sidebar__items__item__title'
                                            }
                                        >
                                            {wbkFormatPrice(
                                                Number(amountData.service_fees),
                                                priceFormat
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )} */}
                            {/* service fees end */}
                            {/* tax */}
                            {/* {displayTax > 0 && (
                                <div className={'wbk_sidebar__items__item'}>
                                    <h4
                                        className={
                                            'wbk_sidebar__items__item__title'
                                        }
                                    >
                                        {wording.tax ||
                                            __('Tax', 'webba-booking-lite')}
                                    </h4>
                                    <div>
                                        <p
                                            className={
                                                'wbk_sidebar__items__item__price'
                                            }
                                        >
                                            {wbkFormatPrice(
                                                displayTax,
                                                priceFormat
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )} */}
                            {/* tax end */}
                            {selectedExtras.length > 0 && (
                                <div className={'wbk_sidebar__extras-toggle'}>
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className={classNames(
                                            'wbk_sidebar__extras-toggle__btn',
                                            {
                                                ['wbk_sidebar__extras-toggle__btn--expanded']:
                                                    extrasExpanded,
                                            }
                                        )}
                                        onClick={() =>
                                            setExtrasExpanded((expanded) => !expanded)
                                        }
                                        onKeyDown={(e) =>
                                            (e.key === 'Enter' || e.key === ' ') &&
                                            setExtrasExpanded((expanded) => !expanded)
                                        }
                                    >
                                        <span>
                                            {wording.additional_items ||
                                                __('Additional items', 'webba-booking-lite')}
                                        </span>
                                        <ArrowDownIcon
                                            className={classNames(
                                                'wbk_sidebar__extras-toggle__icon',
                                                {
                                                    ['wbk_sidebar__extras-toggle__icon--expanded']:
                                                        extrasExpanded,
                                                }
                                            )}
                                        />
                                    </div>
                                    {extrasExpanded && (
                                        <div className={'wbk_sidebar__extras-toggle__list'}>
                                            {selectedExtras.map((extra) => {
                                                const quantity = Math.max(
                                                    1,
                                                    Number(extra.quantity) || 1
                                                )
                                                const linePrice = getExtraLinePrice(extra)
                                                const titlePrefix =
                                                    quantity > 1 ? `${quantity}x ` : ''
                                                return (
                                                    <div
                                                        key={extra.id}
                                                        className={
                                                            'wbk_sidebar__items__item__inner'
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                'wbk_sidebar__items__item__info'
                                                            }
                                                        >
                                                            <h4
                                                                className={
                                                                    'wbk_sidebar__items__item__title'
                                                                }
                                                            >
                                                                {titlePrefix}
                                                                {extra.label}
                                                            </h4>
                                                        </div>
                                                        <div
                                                            className={
                                                                'wbk_sidebar__items__item__price'
                                                            }
                                                        >
                                                            {(linePrice > 0 &&
                                                                wbkFormatPrice(
                                                                    linePrice,
                                                                    priceFormat
                                                                )) ||
                                                                wording.free ||
                                                                __(
                                                                    'Free',
                                                                    'webba-booking-lite'
                                                                )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* total */}
                            <div className={'wbk_sidebar__items__item'}>
                                <h4
                                    className={
                                        'wbk_sidebar__items__item__title'
                                    }
                                >
                                    {wording.total ||
                                        __('TOTAL TODAY', 'webba-booking-lite')}
                                </h4>
                                <div className={'wbk_sidebar__items__item__price'}>
                                    <p
                                        className={
                                            'wbk_sidebar__items__item__title'
                                        }
                                    >
                                        <strong>
                                            {canShowUnitPrice
                                                ? (displayTotal &&
                                                    displayTotal > 0 &&
                                                    wbkFormatPrice(
                                                        displayTotal,
                                                        priceFormat
                                                    )) ||
                                                wording.free ||
                                                __('Free', 'webba-booking-lite')
                                                : ''}
                                        </strong>
                                    </p>
                                    {canShowUnitPrice && displayTotal > 0 && (
                                        <p
                                            className={
                                                'wbk_sidebar__items__item__subline'
                                            }
                                        >
                                            {wording.tax_included ||
                                                __(
                                                    'Tax incl.',
                                                    'webba-booking-lite'
                                                )}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {/* total end */}
                            {/* left to pay */}
                            {/* {Number(amountData?.left_to_pay) > 0 && (<div className={'wbk_sidebar__items__item'}>
                                <h4
                                    className={
                                        'wbk_sidebar__items__item__title'
                                    }
                                >
                                    {wording.left_to_pay ||
                                        __('Left to pay', 'webba-booking-lite')}
                                </h4>
                                <div>
                                    <p
                                        className={
                                            'wbk_sidebar__items__item__title'
                                        }
                                    >
                                        {(amountData?.left_to_pay &&
                                            amountData.left_to_pay > 0 &&
                                            wbkFormatPrice(
                                                amountData.left_to_pay,
                                                priceFormat
                                            )) ||
                                            wording.free ||
                                            __('Free', 'webba-booking-lite')}
                                    </p>
                                </div>
                            </div>)} */}
                            {/* left to pay end */}
                            {hasSummaryAmounts && (
                                <div className={'wbk_sidebar__summary-toggle'}>
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className={'wbk_sidebar__summary-toggle__btn'}
                                        onClick={() => setShowSummary((s) => !s)}
                                        onKeyDown={(e) =>
                                            (e.key === 'Enter' || e.key === ' ') &&
                                            setShowSummary((s) => !s)
                                        }
                                    >
                                        <span>
                                            {showSummary
                                                ? __('Hide summary', 'webba-booking-lite')
                                                : __('Show summary', 'webba-booking-lite')}
                                        </span>
                                        <ArrowDownIcon
                                            className={classNames(
                                                'wbk_sidebar__summary-toggle__icon',
                                                {
                                                    ['wbk_sidebar__summary-toggle__icon--expanded']:
                                                        showSummary,
                                                }
                                            )}
                                        />
                                    </div>
                                    {showSummary && (
                                        <div className={'wbk_sidebar__summary-detail'}>
                                            {depositTotal > 0 && (
                                                <div className={'wbk_sidebar__summary-detail__row'}>
                                                    <span>{__('Deposits', 'webba-booking-lite')}:</span>
                                                    <span>{wbkFormatPrice(depositTotal, priceFormat)}</span>
                                                </div>
                                            )}
                                            {Number(amountData?.service_fees) > 0 && (
                                                <div className={'wbk_sidebar__summary-detail__row'}>
                                                    <span>{wording.service_fees || __('Service fees', 'webba-booking-lite')}:</span>
                                                    <span>{wbkFormatPrice(Number(amountData.service_fees), priceFormat)}</span>
                                                </div>
                                            )}
                                            {displayTax > 0 && (
                                                <div className={'wbk_sidebar__summary-detail__row'}>
                                                    <span>{wording.tax || __('Taxes', 'webba-booking-lite')}:</span>
                                                    <span>{wbkFormatPrice(displayTax, priceFormat)}</span>
                                                </div>
                                            )}
                                            {Number(amountData?.left_to_pay) > 0 && (
                                                <div className={'wbk_sidebar__summary-detail__row'}>
                                                    <span>{__('Left to pay later', 'webba-booking-lite')}:</span>
                                                    <span>{wbkFormatPrice(Number(amountData.left_to_pay), priceFormat)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {isAddMoreVisible && (
                            <div className={'wbk_sidebar__add-more'}>
                                <Button
                                    onClick={onAddMore}
                                    type="secondary"
                                    classes={'wbk_sidebar__add-more__button'}
                                >
                                    {wording.add_more ||
                                        __('+ Add more', 'webba-booking-lite')}
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className={'wbk_sidebar__empty'}>
                        {bookingMode === 'units'
                            ? __(
                                'Please select a unit to see a summary here.',
                                'webba-booking-lite'
                            )
                            : wording.empty_summary ||
                            __(
                                'Please select a service and slot to see a summary here.',
                                'webba-booking-lite'
                            )}
                    </p>
                )}
                {(!!help_phone || !!help_email) && help_title && (
                    <div className={'wbk_sidebar__help'}>
                        {!!help_title && (!!help_phone || !!help_email) && (
                            <h4 className={'wbk_sidebar__help__title'}>
                                {help_title}
                            </h4>
                        )}
                        {(!!help_phone || !!help_email) && (
                            <div className={'wbk_sidebar__help__text'}>
                                {!!help_phone && (
                                    <a
                                        href={`tel:${help_phone}`}
                                        target="_blank"
                                    >
                                        <img
                                            src={iconPhone}
                                            alt={
                                                wording.phone ||
                                                __(
                                                    'Phone',
                                                    'webba-booking-lite'
                                                )
                                            }
                                        />
                                        {help_phone}
                                    </a>
                                )}
                                {!!help_email && (
                                    <a
                                        href={`mailto:${help_email}`}
                                        target="_blank"
                                    >
                                        <img
                                            src={iconEmail}
                                            alt={
                                                wording.email ||
                                                __(
                                                    'Email',
                                                    'webba-booking-lite'
                                                )
                                            }
                                        />
                                        {help_email}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
