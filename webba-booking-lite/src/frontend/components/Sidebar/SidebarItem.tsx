import { useMemo, useState } from 'react'
import { IServiceProps } from '../Services/types'
import { wbkFormat } from '../../../admin/components/Form/utils/dateTime'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { ReactComponent as CloseIcon } from '../../../../public/images/icon-close.svg'
import { __ } from '@wordpress/i18n'
import { wbkFormatPrice } from '../../providers/BookingFormProvider/utils'
import { minutesToText } from '../../../admin/components/WebbaDataTable/utils'
import { useWording } from '../../hooks/useWording'
import { useLocale } from '../../hooks/useLocale'
import { getDateFnsLocale } from '../../../utilities/timezones'
import { ReactComponent as ArrowDownIcon } from '../../../../public/images/arrow-down.svg'
import classNames from 'classnames'
import { STAFF_ANY_AVAILABLE } from '../StaffSelector/StaffSelector'
import { getServiceAssociatedLocations } from '../../lib/locationFilter/getServiceAssociatedLocations'
import { ILocationOption } from '../LocationDropdown/types'
import { ISidebarDateGroup } from './types'

interface ISidebarItemProps extends IServiceProps {
    to_pay: number
}

export const SidebarItem = ({
    id,
    label,
    quantity,
    price,
    places,
    onUpdate,
    duration,
    hide_price,
    staffId,
}: ISidebarItemProps) => {
    const wording = useWording()
    const {
        timeFormat,
        userTimezone,
        attrService,
        priceFormat,
        amountData,
        preset,
        formData,
    } = useBookingContext()

    const { locale } = useLocale()
    const dateFnsLocale = useMemo(
        () => getDateFnsLocale(locale || 'en'),
        [locale]
    )
    const servicePrice = useMemo(() => {
        const matchedItems = amountData.items.filter((item) => item.id === id)
        if (matchedItems.length > 0) {
            return matchedItems.reduce(
                (sum, item) => sum + (item.price || 0),
                0
            )
        }

        const numericPrice = Number(price)
        if (numericPrice > 0 && quantity > 0) {
            return numericPrice * quantity
        }

        return 0
    }, [amountData, id, price, quantity])

    const toPay = useMemo(() => {
        const matchedItems = amountData.items.filter((item) => item.id === id)
        if (matchedItems.length > 0) {
            return matchedItems.reduce(
                (sum, item) => sum + (item.item_to_pay || 0),
                0
            )
        }

        const numericPrice = Number(price)
        if (numericPrice > 0 && quantity > 0) {
            return numericPrice * quantity
        }

        return 0
    }, [amountData, id, price, quantity])
    const [expanded, setExpanded] = useState(false)

    const haveDeposit = amountData.items.find(
        (item) => item.id === id
    )?.have_deposit

    const selectedLocation = useMemo(() => {
        const locationId = formData?.location != null ? String(formData.location) : null
        if (!locationId || !preset?.locations?.length) return null
        const allowedLocations = getServiceAssociatedLocations(
            (preset.locations ?? []) as ILocationOption[],
            (preset?.services ?? []) as Array<{ locations?: any[] }>
        )
        return allowedLocations.find(
            (loc) =>
                String(loc.id) === locationId || String(loc.value) === locationId
        ) ?? null
    }, [formData?.location, preset?.locations, preset?.services])

    const staffLabel = useMemo(() => {
        const list = preset?.staff_members as { id: string; label: string }[] | undefined
        const labelForStaffId = (sid: string | null | undefined) => {
            if (sid === undefined || sid === null || String(sid) === STAFF_ANY_AVAILABLE)
                return null
            if (!list?.length) return null
            const staff = list.find((s: { id: string }) => String(s.id) === String(sid))
            return staff?.label ?? null
        }

        const placeStaffIds = (places ?? [])
            .map((p) => p.staff_member_id)
            .filter(
                (sid): sid is string =>
                    sid != null &&
                    String(sid) !== '' &&
                    String(sid) !== STAFF_ANY_AVAILABLE
            )

        if (placeStaffIds.length > 0) {
            const uniqueIds = [...new Set(placeStaffIds.map(String))]
            const labels = uniqueIds
                .map((sid) => labelForStaffId(sid))
                .filter((l): l is string => Boolean(l))
            if (labels.length > 0) {
                return labels.length === 1 ? labels[0] : labels.join(', ')
            }
        }

        const sid = staffId ?? (formData?.staff as Record<string, string> | undefined)?.[String(id)]
        if (sid === undefined || sid === null || sid === STAFF_ANY_AVAILABLE)
            return wording.any_available ?? __('Any Available', 'webba-booking-lite')
        if (!list?.length) return wording.any_available ?? __('Any Available', 'webba-booking-lite')
        const staff = list.find((s: { id: string }) => String(s.id) === String(sid))
        return staff?.label ?? wording.any_available ?? __('Any Available', 'webba-booking-lite')
    }, [places, staffId, formData?.staff, id, preset?.staff_members, wording.any_available])

    const slotsByDate = useMemo(() => {
        const groups = new Map<string, ISidebarDateGroup>()
        const sortedPlaces = [...(places ?? [])].sort(
            (left, right) => left.timeslot - right.timeslot
        )

        sortedPlaces.forEach((place) => {
            const dateKey = wbkFormat(place.timeslot, 'Y-m-d', userTimezone, {
                locale: dateFnsLocale,
            })
            const existingGroup = groups.get(dateKey)
            const timePill = {
                timeslot: place.timeslot,
                timeLabel: wbkFormat(place.timeslot, timeFormat, userTimezone, {
                    locale: dateFnsLocale,
                }),
            }

            if (existingGroup) {
                existingGroup.times.push(timePill)
                return
            }

            groups.set(dateKey, {
                dateKey,
                dateLabel: wbkFormat(place.timeslot, 'j M Y', userTimezone, {
                    locale: dateFnsLocale,
                }),
                times: [timePill],
            })
        })

        return Array.from(groups.values())
    }, [places, timeFormat, userTimezone, dateFnsLocale])

    const durationText = useMemo(() => {
        if (typeof duration === 'undefined' || duration === '') {
            return ''
        }

        const minutes = Number(duration)
        if (!Number.isFinite(minutes)) {
            return ''
        }

        return minutesToText(minutes, { h: 'h', min: 'm', d: 'd' })
    }, [duration])

    const serviceHasStaff = useMemo(() => {
        const list = preset?.staff_members as { services?: string[] }[] | undefined
        return (
            Array.isArray(list) &&
            list.some((member) => member.services?.includes(String(id)))
        )
    }, [preset?.staff_members, id])

    const hasSelectedSlots = (places?.length ?? 0) > 0
    const titleCount =
        (places?.length ?? 0) > 1
            ? places?.length
            : quantity > 1
              ? quantity
              : 0
    const detailLine = [
        hasSelectedSlots ? durationText : '',
        selectedLocation?.label ?? '',
    ]
        .filter(Boolean)
        .join(' · ')

    return (
        <>
            <div className={'wbk_sidebar__items__item__inner'}>
                <div className={'wbk_sidebar__items__item__info'}>
                    <h4 className={'wbk_sidebar__items__item__title'}>
                        {label}
                        {titleCount ? ` × ${titleCount}` : ''}
                    </h4>
                </div>
                {!hide_price && (
                    <div className={'wbk_sidebar__items__item__price'}>
                        {(servicePrice &&
                            servicePrice > 0 &&
                            wbkFormatPrice(servicePrice, priceFormat)) || (
                                <span>
                                    {wording.free ||
                                        __('Free', 'webba-booking-lite')}
                                </span>
                            )}
                    </div>
                )}
                {(!attrService || attrService === '0') && (
                    <div
                        className={'wbk_sidebar__items__item__button-remove'}
                        onClick={() =>
                            onUpdate({
                                selected: false,
                            })
                        }
                    >
                        <CloseIcon />
                    </div>
                )}
            </div>
            {hasSelectedSlots ? (
                slotsByDate.map((dateGroup) => (
                    <div
                        key={dateGroup.dateKey}
                        className={'wbk_sidebar__items__item__date-row'}
                    >
                        <span className={'wbk_sidebar__items__item__date-label'}>
                            {dateGroup.dateLabel}
                        </span>
                        {dateGroup.times.map((timePill, timeIndex) => (
                            <span
                                key={`${timePill.timeslot}-${timeIndex}`}
                                className={'wbk_sidebar__items__item__time-pill'}
                            >
                                {timePill.timeLabel}
                            </span>
                        ))}
                    </div>
                ))
            ) : (
                <p className={'wbk_sidebar__items__item__subline'}>
                    <span>
                        {wording.no_time_selected ||
                            __('No time selected', 'webba-booking-lite')}
                    </span>
                </p>
            )}
            {detailLine && (
                <p className={'wbk_sidebar__items__item__subline'}>
                    {detailLine}
                </p>
            )}
            {serviceHasStaff && staffLabel && (
                <p className={'wbk_sidebar__items__item__subline'}>
                    {staffLabel}
                </p>
            )}
            {expanded && (
                <div className={'wbk_sidebar__items__item__details'}>
                    <div className={'wbk_sidebar__items__item__details__price'}>
                        <p>
                            {wording.price || __('Price', 'webba-booking-lite')}
                        </p>
                        <p>{wbkFormatPrice(servicePrice, priceFormat)}</p>
                    </div>
                    <div className={'wbk_sidebar__items__item__details__price'}>
                        <p>
                            {wording.to_pay ||
                                __('To pay now', 'webba-booking-lite')}
                        </p>
                        <p>{wbkFormatPrice(toPay, priceFormat)}</p>
                    </div>
                </div>
            )}
            {haveDeposit && (
                <div
                    className={'wbk_sidebar__items__item__expand-button'}
                    onClick={() => setExpanded(!expanded)}
                >
                    <span>
                        {expanded
                            ? wording?.hide_details ||
                            __('Hide details', 'webba-booking-lite')
                            : wording?.show_details ||
                            __('Show details', 'webba-booking-lite')}
                    </span>
                    <ArrowDownIcon
                        className={classNames(
                            'wbk_sidebar__items__item__expand-button__icon',
                            {
                                ['wbk_sidebar__items__item__expand-button__icon--expanded']:
                                    expanded,
                            }
                        )}
                    />
                </div>
            )}
        </>
    )
}
