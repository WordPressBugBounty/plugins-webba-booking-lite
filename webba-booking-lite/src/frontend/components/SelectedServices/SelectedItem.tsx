import { IPlace } from '../Services/types'
import { IServicePropsWithIndex } from './types'
import { __ } from '@wordpress/i18n'
import { BookingCalendar } from '../BookingCalendar/BookingCalendar'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
    convertToJSFormat,
    wbkFormat,
    wbkGetTimezoneOffset,
    weekDaysSlugs,
} from '../../../admin/components/Form/utils/dateTime'
import {
    endOfMonth,
    endOfWeek,
    fromUnixTime,
    getUnixTime,
    isSameDay,
    startOfMonth,
    startOfWeek,
    subDays,
    format,
} from 'date-fns'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { Timeslots } from '../Timeslots/Timeslots'
import { useDispatch, useSelect } from '@wordpress/data'
import { store_name } from '../../../store/frontend'
import { getStaffOptionsForService } from '../StaffSelector/utils'
import { IStaffOption } from '../StaffSelector/types'
import {
    wbkBackendDate,
    wbkExtractBackendDate,
} from '../../providers/BookingFormProvider/utils'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import classNames from 'classnames'
import iconAccordionArrow from '../../../../public/images/icon-accordion-arrow.svg'
import { useWording } from '../../hooks/useWording'
import { useLocale } from '../../hooks/useLocale'
import * as locales from 'date-fns/locale'
import { Value } from 'react-calendar/dist/esm/shared/types.js'

export const SelectedItem = ({
    label,
    id,
    selectedDate,
    timeslots,
    places,
    onUpdate,
    index,
    selectedMonth,
    expanded,
    quantity,
    max_quantity,
    min_quantity,
    min_slots,
    max_slots,
    consecutive_timeslots,
    group_booking,
    limited_timeslot,
    first_available,
    staffId
}: IServicePropsWithIndex) => {
    const wording = useWording()
    const { loading, preset } = useBookingContext()
    const isTimeslotsLoading =
        id !== undefined && loading?.serviceTimeslots?.[id]
    const { locale } = useLocale()
    const initialized = useRef(false)

    const dateFnsLocale = useMemo(() => {
        // Helper function to get locale from the available locales
        const getLocale = (localeCode: string) => {
            // Common locale mappings
            const localeMapping: { [key: string]: string } = {
                en: 'enUS',
                'en-US': 'enUS',
                'en-GB': 'enGB',
                es: 'es',
                'es-ES': 'es',
                fr: 'fr',
                'fr-FR': 'fr',
                de: 'de',
                'de-DE': 'de',
                it: 'it',
                'it-IT': 'it',
                pt: 'pt',
                'pt-PT': 'pt',
                'pt-BR': 'ptBR',
                ru: 'ru',
                'ru-RU': 'ru',
                ja: 'ja',
                'ja-JP': 'ja',
                ko: 'ko',
                'ko-KR': 'ko',
                zh: 'zhCN',
                'zh-CN': 'zhCN',
                'zh-TW': 'zhTW',
                ar: 'ar',
                'ar-SA': 'arSA',
                nl: 'nl',
                'nl-NL': 'nl',
                sv: 'sv',
                'sv-SE': 'sv',
                da: 'da',
                'da-DK': 'da',
                no: 'nb',
                nb: 'nb',
                fi: 'fi',
                'fi-FI': 'fi',
                pl: 'pl',
                'pl-PL': 'pl',
                cs: 'cs',
                'cs-CZ': 'cs',
                sk: 'sk',
                'sk-SK': 'sk',
                hu: 'hu',
                'hu-HU': 'hu',
                ro: 'ro',
                'ro-RO': 'ro',
                bg: 'bg',
                'bg-BG': 'bg',
                hr: 'hr',
                'hr-HR': 'hr',
                sr: 'sr',
                'sr-RS': 'sr',
                sl: 'sl',
                'sl-SI': 'sl',
                et: 'et',
                'et-EE': 'et',
                lv: 'lv',
                'lv-LV': 'lv',
                lt: 'lt',
                'lt-LT': 'lt',
                tr: 'tr',
                'tr-TR': 'tr',
                he: 'he',
                'he-IL': 'he',
                hi: 'hi',
                'hi-IN': 'hi',
                th: 'th',
                'th-TH': 'th',
                vi: 'vi',
                'vi-VN': 'vi',
                id: 'id',
                'id-ID': 'id',
                ms: 'ms',
                'ms-MY': 'ms',
                bn: 'bn',
                'bn-BD': 'bn',
                'bn-IN': 'bn',
            }

            // Try exact match first
            const mappedLocale = localeMapping[localeCode]
            if (mappedLocale && locales[mappedLocale as keyof typeof locales]) {
                return locales[mappedLocale as keyof typeof locales]
            }

            // Try language code only (e.g., 'en' from 'en-US')
            const languageCode = localeCode.split('-')[0]
            const mappedLanguage = localeMapping[languageCode]
            if (
                mappedLanguage &&
                locales[mappedLanguage as keyof typeof locales]
            ) {
                return locales[mappedLanguage as keyof typeof locales]
            }

            // Default fallback
            return locales.enUS
        }

        return getLocale(locale || 'en')
    }, [locale])

    const timeslotsRef = useRef<HTMLDivElement>(null)
    const prevSelectedDateRef = useRef<Date | null>(null)
    const settings = preset?.settings
    const weekStartsOn =
        typeof settings?.week_start === 'number'
            ? settings.week_start
            : (weekDaysSlugs[
                  String(settings?.week_start || 'monday').toLowerCase()
              ] ?? 1)

    // general
    const {
        fetchServiceAvailability,
        fetchServiceTimeslots,
        fetchBookingAmounts,
    } = useDispatch(store_name)
    const {
        formData,
        dateFormat,
        timeFormat,
        timezone,
        userTimezone,
        attrService,
        extractedAttrStaff,
    } = useBookingContext()
    const currentRange = useMemo(() => {
        const monthToSelect = selectedMonth
        const firstOfMonth = startOfMonth(monthToSelect)
        const lastOfMonth = endOfMonth(monthToSelect)
        return [
            startOfWeek(firstOfMonth, { weekStartsOn }),
            endOfWeek(lastOfMonth, { weekStartsOn }),
        ]
    }, [selectedMonth, weekStartsOn])

    const availabilityStart = useMemo(
        () => subDays(currentRange[0], 1),
        [currentRange]
    )
    const serviceHasStaff = useMemo(() => {
        const list = preset?.staff_members as { services?: string[] }[] | undefined
        return (
            Array.isArray(list) &&
            list.some(
                (s) =>
                    s.services?.includes(String(id))
            )
        )
    }, [preset?.staff_members, id])
    const selectedServiceLevelStaffId = staffId ?? null
    // Backend returns staff_member_ids only when staff_member_id is provided.
    // Use "0" (Any Available) as default filter so the UI can render per-slot staff options.
    const staffIdForApi = serviceHasStaff
        ? selectedServiceLevelStaffId != null &&
          String(selectedServiceLevelStaffId) !== ''
            ? String(selectedServiceLevelStaffId)
            : '0'
        : null

    const isPredefinedService =
        attrService !== undefined &&
        attrService !== null &&
        String(attrService) !== '' &&
        String(attrService) !== '0'

    const staffOptionsForGate = useMemo(() => {
        if (!serviceHasStaff) return []
        const locationId =
            formData?.location != null ? String(formData.location) : null
        return getStaffOptionsForService(
            preset?.staff_members as IStaffOption[] | undefined,
            id,
            locationId,
            extractedAttrStaff
        )
    }, [
        serviceHasStaff,
        preset?.staff_members,
        id,
        formData?.location,
        extractedAttrStaff,
    ])

    const mustPickStaffBeforeCalendar =
        isPredefinedService &&
        extractedAttrStaff.length === 0 &&
        staffOptionsForGate.length > 1
    const isStaffChosenForService =
        selectedServiceLevelStaffId != null &&
        String(selectedServiceLevelStaffId) !== ''
    const showTimeslotStaffSelector =
        String(selectedServiceLevelStaffId ?? '0') === '0'
    const blockCalendarUntilStaffSelected =
        mustPickStaffBeforeCalendar && !isStaffChosenForService
    const availableDates = useSelect(
        (select: any) =>
            select(store_name).getServiceAvailability(
                id,
                wbkBackendDate(availabilityStart),
                wbkBackendDate(currentRange[1]),
                formData?.location,
                staffIdForApi
            ),
        [id, availabilityStart, currentRange, formData?.location, staffIdForApi]
    )

    const actualSelectedDate = useMemo(() => {
        if (blockCalendarUntilStaffSelected) {
            return null
        }
        const formattedAvailableDates = availableDates.map((date: string) =>
            wbkExtractBackendDate(date)
        )

        if (!formattedAvailableDates || formattedAvailableDates.length === 0) {
            return null
        }

        // if (
        //     !formattedAvailableDates ||
        //     (formattedAvailableDates.length === 0 && !first_available)
        // ) {
        //     return null
        // } else if (formattedAvailableDates.length === 0 && first_available) {
        //     return wbkExtractBackendDate(first_available)
        // }

        const dateFound =
            selectedDate != null
                ? formattedAvailableDates.find((d: Date) =>
                      isSameDay(d, selectedDate)
                  )
                : undefined

        if (dateFound) {
            return dateFound
        }

        return formattedAvailableDates[0]
    }, [selectedDate, availableDates, blockCalendarUntilStaffSelected])

    const effectiveStaffIdForApi = staffIdForApi

    const handleSetDate = useCallback(
        (value: Value) => {
            if (value instanceof Date) {
                onUpdate({ selectedDate: value })
            }
        },
        [onUpdate]
    )

    const handleSetMonth = useCallback(
        (value: Date) => {
            onUpdate({ selectedMonth: value })
        },
        [onUpdate]
    )

    const backendDate = actualSelectedDate
        ? wbkBackendDate(actualSelectedDate)
        : ''
    const apiTimeSlots = useSelect(
        (select: any) =>
            backendDate
                ? select(store_name).getServiceTimeslots(id, backendDate)
                : [],
        [id, backendDate]
    )

    useEffect(() => {
        onUpdate({ timeslots: apiTimeSlots })
    }, [apiTimeSlots])

    useEffect(() => {
        if (blockCalendarUntilStaffSelected) return
        if (!actualSelectedDate) return
        fetchServiceTimeslots(
            wbkBackendDate(actualSelectedDate),
            id,
            wbkGetTimezoneOffset(userTimezone),
            formData.location,
            effectiveStaffIdForApi
        )
    }, [actualSelectedDate, userTimezone, id, formData?.location, effectiveStaffIdForApi])

    useEffect(() => {
        if (blockCalendarUntilStaffSelected) return
        if (!actualSelectedDate) return
        const prev = prevSelectedDateRef.current
        const changed =
            !prev ||
            prev.getTime() !== actualSelectedDate.getTime()
        prevSelectedDateRef.current = actualSelectedDate
        if (!changed) return
        const timeoutId = setTimeout(() => {
            const el = timeslotsRef.current
            if (!el) return
            el.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            })
        }, 50)
        return () => clearTimeout(timeoutId)
    }, [actualSelectedDate])

    // Auto-scroll to timeslots when they finish loading
    useEffect(() => {
        if (blockCalendarUntilStaffSelected) return
        if (
            !isTimeslotsLoading &&
            timeslots &&
            timeslots.length > 0 &&
            timeslotsRef.current &&
            expanded
        ) {
            // Small delay to ensure DOM is updated
            const timeoutId = setTimeout(() => {
                const timeslotsElement = timeslotsRef.current
                if (!timeslotsElement) return

                // Scroll within the specific container only
                timeslotsElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest', // This prevents body scroll
                    inline: 'nearest',
                })
            }, 100)

            return () => clearTimeout(timeoutId)
        }
    }, [isTimeslotsLoading, timeslots, expanded])

    useEffect(() => {
        if (!formData.places || Object.keys(formData.places).length === 0)
            return

        fetchBookingAmounts({
            ...formData,
            generate_stripe_intent: false,
        })
    }, [formData.places])

    const handleSetTime = useCallback(
        (time: number) => {
            if (!actualSelectedDate) return
            const minSlotsLimit = min_slots && min_slots > 0 ? min_slots : 1
            const maxSlotsLimit =
                max_slots && max_slots > 0 ? max_slots : Infinity
            const singleSlotMode = minSlotsLimit === 1 && maxSlotsLimit === 1
            const exists = places?.find(
                ({ timeslot, date }) =>
                    date.getDate() === actualSelectedDate.getDate() &&
                    date.getMonth() === actualSelectedDate.getMonth() &&
                    date.getFullYear() === actualSelectedDate.getFullYear() &&
                    timeslot === time
            )

            if (exists !== undefined) {
                onUpdate({
                    places: places?.filter(({ timeslot }) => timeslot !== time),
                })
                return
            }

            if (singleSlotMode) {
                const selectedSlot = timeslots?.find(
                    (slot) => Number(slot.start_time) === time
                )
                const defaultStaffId =
                    selectedSlot?.staff_member_ids &&
                    selectedSlot.staff_member_ids.length > 0
                        ? String(selectedSlot.staff_member_ids[0])
                        : undefined
                onUpdate({
                    places: [
                        {
                            date: actualSelectedDate as Date,
                            day: getUnixTime(fromZonedTime(actualSelectedDate as Date, timezone)),
                            timeslot: time,
                            ...(defaultStaffId
                                ? { staff_member_id: defaultStaffId }
                                : {}),
                        },
                    ],
                })
            } else {
                const selectedSlot = timeslots?.find(
                    (slot) => Number(slot.start_time) === time
                )
                const defaultStaffId =
                    selectedSlot?.staff_member_ids &&
                    selectedSlot.staff_member_ids.length > 0
                        ? String(selectedSlot.staff_member_ids[0])
                        : undefined
                onUpdate({
                    places: [
                        ...(places as IPlace[]),
                        {
                            date: actualSelectedDate as Date,
                            day: getUnixTime(fromZonedTime(actualSelectedDate as Date, timezone)),
                            timeslot: time,
                            ...(defaultStaffId
                                ? { staff_member_id: defaultStaffId }
                                : {}),
                        },
                    ],
                })
            }
        },
        [timeslots, actualSelectedDate, places, min_slots, max_slots]
    )

    const handleSetPlaceStaff = useCallback(
        (time: number, staffId: string) => {
            onUpdate({
                places: (places as IPlace[]).map((place) =>
                    place.timeslot === time &&
                    actualSelectedDate &&
                    place.date.getDate() === actualSelectedDate.getDate() &&
                    place.date.getMonth() === actualSelectedDate.getMonth() &&
                    place.date.getFullYear() === actualSelectedDate.getFullYear()
                        ? { ...place, staff_member_id: staffId }
                        : place
                ),
            })
        },
        [places, onUpdate, actualSelectedDate]
    )

    const { services } = useBookingContext()
    const isDisabled = useMemo(() => {
        const selectedServices = services
            .filter(({ selected }) => selected)
            .sort((a, b) => (a.selectedAt || 0) - (b.selectedAt || 0))

        if (selectedServices.length === 1) return false

        const currentIndex = selectedServices.findIndex(
            (service) => service.id === id
        )

        return selectedServices[currentIndex - 1]?.places?.length === 0
    }, [services, id])

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

    const currentHiddenSlots = useMemo(
        () => timeslots?.filter(({ free_places }) => free_places === 0) || [],
        [timeslots]
    )
    const currentFreeSlots = useMemo(
        () => timeslots?.filter(({ free_places }) => free_places > 0) || [],
        [timeslots]
    )

    return (
        <div
            className={classNames('wbk_selected_services__item', {
                ['wbk_selected_services__item--expanded']: expanded,
                ['wbk_selected_services__item--disabled']: isDisabled,
            })}
        >
            <div
                className={'wbk_selected_services__item__heading'}
                onClick={() => !isDisabled && onUpdate({ expanded: !expanded })}
            >
                <div className={'wbk_selected_services__item__heading__index'}>
                    {index + 1}
                </div>
                <p className={'wbk_selected_services__item__heading__title'}>
                    {label}
                </p>
                <div
                    className={
                        'wbk_selected_services__item__heading__selected-times'
                    }
                >
                    {(places &&
                        places.length > 0 &&
                        places.map(({ timeslot }: IPlace) => (
                            <div
                                className={
                                    'wbk_selected_services__item__heading__selected-timeslot'
                                }
                            >
                                <div>{wbkFormat(timeslot, dateFormat)}</div>
                                <span></span>
                                <div>
                                    {wbkFormat(
                                        getUnixTime(
                                            toZonedTime(
                                                fromUnixTime(timeslot),
                                                timezone
                                            )
                                        ),
                                        timeFormat
                                    )}
                                </div>
                            </div>
                        ))) || (
                        <div
                            className={
                                'wbk_selected_services__item__heading__empty-timeslots-label'
                            }
                        >
                            {wording.select_date_time ||
                                __('Select date & time', 'webba-booking-lite')}
                        </div>
                    )}
                </div>
                <div>
                    <img
                        className={
                            'wbk_selected_services__item__heading__toggle-icon'
                        }
                        src={iconAccordionArrow}
                        alt={
                            wording.toggle || __('Toggle', 'webba-booking-lite')
                        }
                    />
                </div>
            </div>
            <div className={'wbk_selected_services__item__body'}>
                <BookingCalendar
                    startOfWeek={weekStartsOn}
                    viewMonth={selectedMonth}
                    availableDates={
                        blockCalendarUntilStaffSelected
                            ? []
                            : availableDates.map((date: string) =>
                                  wbkExtractBackendDate(date)
                              )
                    }
                    selectedDate={actualSelectedDate}
                    setValue={handleSetDate}
                    setMonth={handleSetMonth}
                    serviceId={id}
                />
                {hasQuantityRange &&
                    attrService !== null &&
                    attrService !== '0' &&
                    attrService && (
                        <div
                            className={
                                'wbk_selected_services__item__bottom-part'
                            }
                        >
                            <span
                                className={
                                    'wbk_selected_services__item__bottom-part__quantity-label'
                                }
                            >
                                {wording.number_of_people ||
                                    __(
                                        'Number of people:',
                                        'webba-booking-lite'
                                    )}
                            </span>
                            <select
                                className={
                                    'wbk_selected_services__item__quantity-select'
                                }
                                value={currentQuantity}
                                onChange={handleQuantitySelectChange}
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
                        </div>
                    )}
                {actualSelectedDate && (
                    <div
                        className={'wbk_selected_services__item__selected-date'}
                    >
                        <p>
                            {wording?.choosing_timeslot_for ||
                                __(
                                    'Choosing time slot for ',
                                    'webba-booking-lite'
                                )}{' '}
                            <span>
                                {format(
                                    actualSelectedDate as Date,
                                    convertToJSFormat(dateFormat || 'PPP'),
                                    { locale: dateFnsLocale }
                                )}
                            </span>
                        </p>
                    </div>
                )}
                {actualSelectedDate && (
                    <div ref={timeslotsRef}>
                        <Timeslots
                            timeslots={
                                timeslots &&
                                !(
                                    preset?.settings?.show_booked_slots ===
                                        false && currentFreeSlots.length === 0
                                )
                                    ? timeslots
                                    : []
                            }
                            selectedSlots={
                                places
                                    ?.filter(({ date }) => {
                                        return (
                                            date !== null &&
                                            actualSelectedDate !== null &&
                                            date.getDate() ===
                                                actualSelectedDate.getDate() &&
                                            date.getMonth() ===
                                                actualSelectedDate.getMonth() &&
                                            date.getFullYear() ===
                                                actualSelectedDate.getFullYear()
                                        )
                                    })
                                    .map(({ timeslot }) => timeslot) || []
                            }
                            setSlot={handleSetTime}
                            onPlaceStaffSelect={handleSetPlaceStaff}
                            max_quantity={Number(max_quantity)}
                            quantity={quantity}
                            serviceId={id}
                            min_slots={min_slots}
                            max_slots={max_slots}
                            consecutive_timeslots={consecutive_timeslots}
                            places={places as IPlace[]}
                            selectedDate={actualSelectedDate}
                            group_booking={group_booking}
                            limited_timeslot={limited_timeslot}
                            showStaffSelector={showTimeslotStaffSelector}
                        />
                    </div>
                )}
                {actualSelectedDate &&
                    !isTimeslotsLoading &&
                    (!timeslots ||
                        timeslots.length === 0 ||
                        (currentFreeSlots.length === 0 &&
                            currentHiddenSlots.length > 0)) && (
                        <div
                            className={
                                'wbk_selected_services__item__no-timeslots'
                            }
                        >
                            {wording?.no_available_timeslots ||
                                __(
                                    'No available time slots',
                                    'webba-booking-lite'
                                )}
                        </div>
                    )}
            </div>
        </div>
    )
}
