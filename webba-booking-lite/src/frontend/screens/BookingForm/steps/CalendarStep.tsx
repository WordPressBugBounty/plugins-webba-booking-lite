import { useDispatch, useSelect } from '@wordpress/data'
import { SelectedServices } from '../../../components/SelectedServices/SelectedServices'
import { LocationDropdown } from '../../../components/LocationDropdown/LocationDropdown'
import { StaffSelector } from '../../../components/StaffSelector/StaffSelector'
import { getStaffOptionsForService } from '../../../components/StaffSelector/utils'
import { IStaffOption } from '../../../components/StaffSelector/types'
import { ILocationOption } from '../../../components/LocationDropdown/types'
import { store } from '../../../../store/frontend'
import { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { CustomScroll } from 'react-custom-scroll'
import './Steps.scss'
import Select from 'react-select'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { ReactComponent as InfoIcon } from '../../../../../public/images/icon-info-circle.svg'
import { BookingCalendar } from '../../../components/BookingCalendar/BookingCalendar'
import { Value } from 'react-calendar/dist/esm/shared/types.js'
import { differenceInCalendarDays, format } from 'date-fns'
import calendarIcon from '../../../../../public/images/icon-calendar.svg'
import { IUnitDateOffer } from '../types'
import { IFormPlace } from '../../../components/Services/types'

const parseYmdLocal = (ymd: string): Date => {
    const parts = ymd.split('-').map(Number)
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
        return new Date(ymd)
    }
    const [y, m, d] = parts
    return new Date(y, m - 1, d)
}

const isInUnitAvailabilityRanges = (
    date: Date,
    ranges: any[],
    recurringAnnually: boolean
): boolean => {
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const monthDay = (normalizedDate.getMonth() + 1) * 100 + normalizedDate.getDate()

    return ranges.some((range: any) => {
        const startRaw = range?.start_date
        const endRaw = range?.end_date
        if (typeof startRaw !== 'string' || typeof endRaw !== 'string') {
            return false
        }
        const start = parseYmdLocal(startRaw.slice(0, 10))
        const end = parseYmdLocal(endRaw.slice(0, 10))
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return false
        }

        if (!recurringAnnually) {
            const rangeStart = new Date(start.getFullYear(), start.getMonth(), start.getDate())
            const rangeEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate())
            return normalizedDate >= rangeStart && normalizedDate <= rangeEnd
        }

        const startMonthDay = (start.getMonth() + 1) * 100 + start.getDate()
        const endMonthDay = (end.getMonth() + 1) * 100 + end.getDate()
        if (startMonthDay <= endMonthDay) {
            return monthDay >= startMonthDay && monthDay <= endMonthDay
        }
        return monthDay >= startMonthDay || monthDay <= endMonthDay
    })
}

const scrollElementIntoStepScrollContainer = (element: HTMLElement | null) => {
    if (!element) return
    let container: HTMLElement | null = element.parentElement
    while (container) {
        const style = window.getComputedStyle(container)
        if (
            style.overflowY === 'auto' ||
            style.overflowY === 'scroll' ||
            container.classList.contains('wbk_step__scroll-wrapper')
        ) {
            const containerRect = container.getBoundingClientRect()
            const elementRect = element.getBoundingClientRect()
            const relativeTop = elementRect.top - containerRect.top
            container.scrollTo({
                top: container.scrollTop + relativeTop - 16,
                behavior: 'smooth',
            })
            return
        }
        container = container.parentElement
    }
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export const CalendarStep = () => {
    const {
        bookingMode,
        services,
        units,
        preset,
        formData,
        loading,
        onStaffSelect,
        onLocationSelect,
        setFormData,
        mergeFormData,
        attrService,
        extractedAttrLocations,
        extractedAttrStaff,
        disableCustomScroll,
    } = useBookingContext()
    const wording = preset?.wording ?? {}
    const settings = preset?.settings
    const {
        setTimezoneData,
        fetchUnitAvailabilityDateRanges,
        fetchUnitAvailabilityForRange,
        fetchClosestIntervalsForRange,
        fetchBookingAmounts,
    } = useDispatch(store)
    const timezoneData = useSelect(
        // @ts-ignore
        (select) => select(store).getTimezoneData(),
        []
    )
    const selectedTimezone = useMemo(() => {
        const selectedZone =
            timezoneData?.selectedZone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone

        return {
            label: selectedZone,
            value: selectedZone,
        }
    }, [timezoneData])
    const selectedUnits = useMemo(
        () =>
            (units || [])
                .filter((unit) => unit.selected)
                .sort((a, b) => (a.selectedAt || 0) - (b.selectedAt || 0)),
        [units]
    )
    const selectedUnit = selectedUnits[0]
    const unitAvailabilityDateRanges = useSelect(
        (select: any) =>
            selectedUnit?.id
                ? select(store).getUnitAvailabilityDateRanges(selectedUnit.id)
                : null,
        [selectedUnit?.id]
    )
    const getUnitPeoplePayload = useMemo(() => {
        if (!selectedUnit) return null
        const attendees = selectedUnit.attendees
        const hasAttendees =
            attendees &&
            (Number(attendees.adult || 0) +
                Number(attendees.child || 0) +
                Number(attendees.infant || 0)) >
                0
        if (hasAttendees) {
            return attendees
        }
        const qty = Math.max(1, Number(selectedUnit.quantity) || 1)
        return qty
    }, [selectedUnit?.id, selectedUnit?.attendees, selectedUnit?.quantity])

    const isPredefinedService =
        attrService !== undefined &&
        attrService !== '' &&
        String(attrService) !== '0'

    const predefinedServiceIds = useMemo(
        () => services.filter((s) => s.selected).map((s) => s.id),
        [services]
    )
    const firstPredefinedService = useMemo(
        () => services.find((s) => s.selected) ?? null,
        [services]
    )
    const firstPredefinedServiceId = firstPredefinedService?.id ?? null

    const locationsForService = useMemo(() => {
        const all: ILocationOption[] = preset?.locations ?? []
        const serviceLocations = firstPredefinedService?.locations
        if (!serviceLocations || !Array.isArray(serviceLocations) || serviceLocations.length === 0)
            return []
        let list = all.filter(
            (loc) =>
                serviceLocations.includes(String(loc.id)) ||
                serviceLocations.includes(String(loc.value))
        )
        if (extractedAttrLocations.length > 0) {
            list = list.filter(
                (loc) =>
                    extractedAttrLocations.includes(String(loc.id)) ||
                    extractedAttrLocations.includes(String(loc.value))
            )
        }

        if (extractedAttrStaff.length > 0 && firstPredefinedServiceId != null) {
            const staffForService = getStaffOptionsForService(
                preset?.staff_members as IStaffOption[] | undefined,
                firstPredefinedServiceId,
                null,
                extractedAttrStaff
            )
            const staffLocationIds = new Set<string>()
            staffForService.forEach((staff) => {
                ; (staff.locations || []).forEach((locationId) =>
                    staffLocationIds.add(String(locationId))
                )
            })
            list = list.filter(
                (loc) =>
                    staffLocationIds.has(String(loc.id)) ||
                    staffLocationIds.has(String(loc.value))
            )
        }

        return list
    }, [
        preset?.locations,
        preset?.staff_members,
        firstPredefinedService?.locations,
        firstPredefinedServiceId,
        extractedAttrStaff,
        extractedAttrLocations,
    ])

    const locationId =
        formData?.location != null ? String(formData.location) : null

    const staffOptions = useMemo(
        () =>
            firstPredefinedServiceId != null
                ? getStaffOptionsForService(
                    preset?.staff_members as IStaffOption[] | undefined,
                    firstPredefinedServiceId,
                    locationId,
                    extractedAttrStaff
                )
                : [],
        [
            preset?.staff_members,
            firstPredefinedServiceId,
            locationId,
            extractedAttrStaff,
        ]
    )

    const showLocationDropdown =
        isPredefinedService && locationsForService.length > 1

    const isLocationSelected = formData?.location != null && String(formData.location) !== ''
    const lockCalendarUntilLocation = showLocationDropdown && !isLocationSelected

    const showStaffSelector =
        isPredefinedService &&
        firstPredefinedServiceId != null &&
        extractedAttrStaff.length !== 1 &&
        staffOptions.length > 1

    useEffect(() => {
        if (
            !isPredefinedService ||
            locationsForService.length !== 1 ||
            formData?.location != null
        )
            return
        const single = locationsForService[0]
        const id = single?.id ?? single?.value
        if (id) onLocationSelect(id)
    }, [
        isPredefinedService,
        locationsForService,
        formData?.location,
        onLocationSelect,
    ])

    useEffect(() => {
        if (
            !isPredefinedService ||
            firstPredefinedServiceId == null ||
            staffOptions.length !== 1 ||
            extractedAttrStaff.length === 1
        )
            return
        const singleStaffId = staffOptions[0]?.id
        if (singleStaffId == null) return
        const current =
            (formData?.staff as Record<string, string | null> | undefined)?.[
            String(firstPredefinedServiceId)
            ]
        if (current === singleStaffId) return
        onStaffSelect(predefinedServiceIds, singleStaffId)
    }, [
        isPredefinedService,
        firstPredefinedServiceId,
        staffOptions,
        extractedAttrStaff.length,
        formData?.staff,
        predefinedServiceIds,
        onStaffSelect,
    ])

    const selectedStaffId =
        firstPredefinedServiceId != null
            ? ((formData?.staff as Record<string, string | null> | undefined)?.[
                String(firstPredefinedServiceId)
            ] ?? null)
            : null

    const handleStaffSelect = (staffId: string | null) => {
        onStaffSelect(predefinedServiceIds, staffId)
    }

    const unitRange = (formData as Record<string, any>)?.range || {
        start: '',
        end: '',
    }
    const [unitViewMonth, setUnitViewMonth] = useState<Date>(new Date())
    const [unitOffers, setUnitOffers] = useState<IUnitDateOffer[]>([])
    const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null)
    const prevDateFlexRef = useRef<number | null>(null)
    const prevSelectedUnitIdRef = useRef<number | null>(null)
    const weekStartsOn =
        typeof settings?.week_start === 'number'
            ? settings.week_start
            : String(settings?.week_start || 'monday').toLowerCase() === 'sunday'
              ? 0
              : 1
    const unitRangeValue = useMemo<Value>(() => {
        if (!unitRange?.start) return null
        const startDate = parseYmdLocal(unitRange.start)
        if (!unitRange?.end) {
            return [startDate, null] as [Date, null]
        }
        return [startDate, parseYmdLocal(unitRange.end)] as [Date, Date]
    }, [unitRange?.start, unitRange?.end])
    const dateFlexibility = Number((formData as Record<string, any>)?.days_to_shift || 0)
    const unitLoadingAnchorRef = useRef<HTMLDivElement>(null)
    const unitOffersSectionRef = useRef<HTMLDivElement>(null)
    const isUnitRangeLoading =
        bookingMode === 'units' &&
        !!selectedUnit?.id &&
        !!loading?.unitAvailability?.[selectedUnit.id]
    const minUnitBookingDays = Math.max(0, Number(selectedUnit?.min_booking_days || 0) || 0)
    const maxUnitBookingDays = Math.max(0, Number(selectedUnit?.max_booking_days || 0) || 0)
    const hasSelectedUnitRange = !!unitRange?.start && !!unitRange?.end
    const showNoUnitOffersMessage =
        bookingMode === 'units' &&
        hasSelectedUnitRange &&
        !isUnitRangeLoading &&
        unitOffers.length === 0
    const unitCalendarAvailableDates = useMemo(() => {
        if (bookingMode !== 'units' || !selectedUnit?.id) {
            return []
        }
        const ranges = Array.isArray(unitAvailabilityDateRanges?.date_ranges)
            ? unitAvailabilityDateRanges.date_ranges
            : []
        if (ranges.length === 0) {
            return []
        }
        const recurringAnnually =
            unitAvailabilityDateRanges?.availability_recurring_annually === true ||
            Number(unitAvailabilityDateRanges?.availability_recurring_annually) === 1 ||
            String(unitAvailabilityDateRanges?.availability_recurring_annually).toLowerCase() ===
                'yes'

        const monthStart = new Date(unitViewMonth.getFullYear(), unitViewMonth.getMonth(), 1)
        const monthEnd = new Date(unitViewMonth.getFullYear(), unitViewMonth.getMonth() + 1, 0)
        const dates: Date[] = []
        for (
            let cursor = new Date(monthStart);
            cursor <= monthEnd;
            cursor.setDate(cursor.getDate() + 1)
        ) {
            const day = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())
            if (isInUnitAvailabilityRanges(day, ranges, recurringAnnually)) {
                dates.push(day)
            }
        }
        return dates
    }, [bookingMode, selectedUnit?.id, unitAvailabilityDateRanges, unitViewMonth])
    const unitHasAvailabilityRanges = useMemo(
        () => Array.isArray(unitAvailabilityDateRanges?.date_ranges) && unitAvailabilityDateRanges.date_ranges.length > 0,
        [unitAvailabilityDateRanges]
    )

    useEffect(() => {
        if (!unitRange?.start) return
        setUnitViewMonth(new Date(unitRange.start))
    }, [unitRange?.start])

    useEffect(() => {
        if (bookingMode !== 'units' || !selectedUnit?.id) return
        fetchUnitAvailabilityDateRanges(selectedUnit.id)
    }, [bookingMode, selectedUnit?.id, fetchUnitAvailabilityDateRanges])

    useEffect(() => {
        if (!isUnitRangeLoading) return
        const timeoutId = setTimeout(() => {
            unitLoadingAnchorRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 80)
        return () => clearTimeout(timeoutId)
    }, [isUnitRangeLoading])

    useEffect(() => {
        if (bookingMode !== 'units' || unitOffers.length === 0) return
        if (isUnitRangeLoading) return
        const timeoutId = window.setTimeout(() => {
            scrollElementIntoStepScrollContainer(unitOffersSectionRef.current)
        }, 150)
        return () => window.clearTimeout(timeoutId)
    }, [bookingMode, unitOffers, isUnitRangeLoading])

    const buildOffersFromClosestResponse = useCallback(
        (response: unknown): IUnitDateOffer[] => {
            const parsed = Array.isArray(response) ? response : []
            const toLocalDay = (raw: unknown) => {
                if (raw == null) return new Date()
                if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
                    return parseYmdLocal(raw.slice(0, 10))
                }
                return parseYmdLocal(format(new Date(raw as string | number | Date), 'yyyy-MM-dd'))
            }
            return parsed
                .map((item: any, index: number) => {
                    const availability =
                        typeof item?.availability === 'string'
                            ? JSON.parse(item.availability)
                            : item?.availability
                    if (!availability || availability?.available === false) {
                        return null
                    }
                    const startD = toLocalDay(item.range?.start)
                    const endD = toLocalDay(item.range?.end)
                    const dayCount = differenceInCalendarDays(endD, startD) + 1
                    return {
                        id: `${item.shift_days}-${index}`,
                        start: startD,
                        end: endD,
                        days: dayCount,
                        total:
                            availability.total_formatted || availability.total || '',
                    } as IUnitDateOffer
                })
                .filter(Boolean) as IUnitDateOffer[]
        },
        []
    )

    const fetchOffersForUnitRange = useCallback(
        (nextRange: { start: string; end: string }) => {
            if (!selectedUnit?.id || !nextRange.start || !nextRange.end) {
                return Promise.resolve()
            }
            const selectedLocationId =
                formData?.location != null && String(formData.location) !== ''
                    ? formData.location
                    : null
            setSelectedOfferId(null)
            mergeFormData({ places: {} })
            if (dateFlexibility > 0) {
                return fetchClosestIntervalsForRange(
                    selectedUnit.id,
                    nextRange,
                    getUnitPeoplePayload,
                    dateFlexibility,
                    selectedLocationId
                ).then((response: unknown) => {
                    setUnitOffers(buildOffersFromClosestResponse(response))
                })
            }
            return fetchUnitAvailabilityForRange(
                selectedUnit.id,
                nextRange,
                getUnitPeoplePayload,
                selectedLocationId
            ).then((response: any) => {
                if (!response || response.available === false) {
                    setUnitOffers([])
                    return
                }
                const startDate = parseYmdLocal(nextRange.start)
                const endDate = parseYmdLocal(nextRange.end)
                const dayCount = differenceInCalendarDays(endDate, startDate) + 1
                setUnitOffers([
                    {
                        id: `${nextRange.start}-${nextRange.end}`,
                        start: startDate,
                        end: endDate,
                        days: dayCount,
                        total: response.total_formatted || response.total || '',
                    },
                ])
            })
        },
        [
            selectedUnit?.id,
            dateFlexibility,
            getUnitPeoplePayload,
            fetchClosestIntervalsForRange,
            fetchUnitAvailabilityForRange,
            formData?.location,
            mergeFormData,
            buildOffersFromClosestResponse,
        ]
    )

    useEffect(() => {
        if (bookingMode !== 'units') return
        if (prevDateFlexRef.current === null) {
            prevDateFlexRef.current = dateFlexibility
            return
        }
        if (prevDateFlexRef.current === dateFlexibility) return
        prevDateFlexRef.current = dateFlexibility
        const range = unitRange as { start?: string; end?: string }
        if (!selectedUnit?.id || !range?.start || !range?.end) return
        fetchOffersForUnitRange({
            start: range.start,
            end: range.end,
        })
    }, [bookingMode, dateFlexibility, selectedUnit?.id, fetchOffersForUnitRange])

    useEffect(() => {
        if (bookingMode !== 'units') return
        const id = selectedUnit?.id
        if (id == null) return
        if (prevSelectedUnitIdRef.current === null) {
            prevSelectedUnitIdRef.current = id
            return
        }
        if (prevSelectedUnitIdRef.current === id) return
        prevSelectedUnitIdRef.current = id
        setUnitOffers([])
        setSelectedOfferId(null)
        mergeFormData({ places: {}, range: { start: '', end: '' } })
    }, [bookingMode, selectedUnit?.id, mergeFormData])

    const handleUnitOfferSelect = (offer: IUnitDateOffer) => {
        if (!selectedUnit?.id) return
        if (selectedOfferId === offer.id) {
            setSelectedOfferId(null)
            mergeFormData({ places: {} })
            return
        }
        const startStr = format(offer.start, 'yyyy-MM-dd')
        const endStr = format(offer.end, 'yyyy-MM-dd')
        const qty = Math.max(1, Number(selectedUnit.quantity) || 1)
        const attendees = selectedUnit.attendees || {
            adult: 0,
            child: 0,
            infant: 0,
        }
        const totalAttendees =
            Number(attendees.adult || 0) +
            Number(attendees.child || 0) +
            Number(attendees.infant || 0)
        const normalizedPeoplePayload =
            totalAttendees > 0
                ? {
                      adult: Number(attendees.adult || 0),
                      child: Number(attendees.child || 0),
                      infant: Number(attendees.infant || 0),
                  }
                : {
                      adult: qty,
                      child: 0,
                      infant: 0,
                  }
        const place: IFormPlace = {
            date: offer.start,
            time: 0,
            quantity: qty,
            unit_range_end: endStr,
        }
        setSelectedOfferId(offer.id)
        mergeFormData({
            range: { start: startStr, end: endStr },
            places: { [selectedUnit.id]: [place] },
        })
        fetchBookingAmounts({
            ...(formData as Record<string, any>),
            booking_mode: 'units',
            unit_id: selectedUnit.id,
            range: { start: startStr, end: endStr },
            places: { [selectedUnit.id]: [place] },
            number_of_people: normalizedPeoplePayload,
            unit_quantity: {
                ...(((formData as Record<string, any>).unit_quantity as
                    | Record<number, number>
                    | undefined) || {}),
                [selectedUnit.id]: qty,
            },
            unit_attendees: {
                ...(((formData as Record<string, any>).unit_attendees as
                    | Record<number, { adult: number; child: number; infant: number }>
                    | undefined) || {}),
                [selectedUnit.id]: normalizedPeoplePayload,
            },
        } as any)
    }

    const handleUnitRangeSelect = (value: Value) => {
        if (!value) {
            mergeFormData({ range: { start: '', end: '' }, places: {} })
            setUnitOffers([])
            setSelectedOfferId(null)
            return
        }
        if (Array.isArray(value)) {
            const [startDate, endDate] = value
            const nextRange = {
                start: startDate ? format(startDate, 'yyyy-MM-dd') : '',
                end: endDate ? format(endDate, 'yyyy-MM-dd') : '',
            }
            if (!nextRange.end) {
                mergeFormData({ range: nextRange, places: {} })
                setUnitOffers([])
                setSelectedOfferId(null)
                return
            }
            mergeFormData({ range: nextRange, places: {} })
            setSelectedOfferId(null)
            setUnitOffers([])
            if (selectedUnit?.id && nextRange.start && nextRange.end) {
                fetchOffersForUnitRange(nextRange)
            }
            return
        }
        const start = format(value as Date, 'yyyy-MM-dd')
        mergeFormData({ range: { start, end: '' }, places: {} })
        setUnitOffers([])
        setSelectedOfferId(null)
    }

    const content = (
        <>
            {bookingMode !== 'units' && settings?.timezone_picker_enabled && (
                <div className={'wbk_timezone_selector__wrapper'}>
                    <label className="wbk_timezone_selector__label">
                        {__('Time zone:', 'webba-booking-lite')}
                    </label>
                    <Select
                        options={timezoneData?.timezones.map(
                            (label: string) => ({
                                label,
                                value: label,
                            })
                        )}
                        value={selectedTimezone}
                        defaultValue={selectedTimezone}
                        onChange={(option: any) =>
                            setTimezoneData({ selectedZone: option.value })
                        }
                        className={'wbk_timezone_selector'}
                    />
                </div>
            )}
            {showLocationDropdown && (
                <LocationDropdown locations={locationsForService} />
            )}
            {lockCalendarUntilLocation && (
                <div className="wbk_step__location_required_notice">
                    <span className="wbk_step__location_required_notice_icon">
                        <InfoIcon aria-hidden="true" />
                    </span>
                    <span>
                        {wording.please_select_location ?? __(
                            'Please select a location first to choose services.',
                            'webba-booking-lite'
                        )}
                    </span>
                </div>
            )}
            <div
                className={classNames('wbk_step__calendar_area', {
                    'wbk_step__calendar_area--locked': lockCalendarUntilLocation,
                })}
            >
                {bookingMode === 'services' && showStaffSelector && (
                    <div className="wbk_step__staff_selector_wrapper">
                        <label className="wbk_step__staff_selector_label">
                            {__('Staff Member', 'webba-booking-lite')}
                        </label>
                        <StaffSelector
                            staffOptions={staffOptions}
                            selectedStaffId={selectedStaffId}
                            onSelect={handleStaffSelect}
                            treatNullAsAnyAvailable={false}
                        />
                    </div>
                )}
                {bookingMode === 'services' && (
                    <div>
                        <SelectedServices />
                    </div>
                )}
                {bookingMode === 'units' && (
                    <div className="wbk_step__unit_range_wrapper">
                        <div className="wbk_step__unit_range_header">
                            <strong>{selectedUnit?.label || __('Selected unit', 'webba-booking-lite')}</strong>
                            <span className="wbk_step__unit_range_badge">
                                {wording.unit_select_suitable_range ||
                                    __('Select suitable range', 'webba-booking-lite')}
                            </span>
                        </div>
                        <div className="wbk_step__unit_range_calendar">
                            <BookingCalendar
                                availableDates={unitCalendarAvailableDates}
                                selectedDate={unitRangeValue}
                                setValue={handleUnitRangeSelect}
                                setMonth={setUnitViewMonth}
                                viewMonth={unitViewMonth}
                                serviceId={selectedUnit?.id || 0}
                                startOfWeek={weekStartsOn}
                                selectionMode="range"
                                minRangeDays={minUnitBookingDays}
                                maxRangeDays={maxUnitBookingDays}
                                restrictToAvailableDates={unitHasAvailabilityRanges}
                                showLoader={false}
                            />
                        </div>
                        <div className="wbk_step__unit_flexibility">
                            <h4>
                                {wording.unit_date_flexibility ||
                                    __('Date Flexibility', 'webba-booking-lite')}
                            </h4>
                            <div className="wbk_step__unit_flexibility_buttons">
                                {[
                                    {
                                        label:
                                            wording.unit_exact_match ||
                                            __('Exact match', 'webba-booking-lite'),
                                        days: 0,
                                    },
                                    {
                                        label:
                                            wording.unit_plus_minus_1_day ||
                                            __('+/- 1 day', 'webba-booking-lite'),
                                        days: 1,
                                    },
                                    {
                                        label:
                                            wording.unit_plus_minus_2_day ||
                                            __('+/- 2 days', 'webba-booking-lite'),
                                        days: 2,
                                    },
                                    {
                                        label:
                                            wording.unit_plus_minus_3_day ||
                                            __('+/- 3 days', 'webba-booking-lite'),
                                        days: 3,
                                    },
                                ].map((option) => (
                                    <div
                                        key={option.days}
                                        role="button"
                                        tabIndex={0}
                                        className={classNames('wbk_step__unit_flexibility_button', {
                                            ['wbk_step__unit_flexibility_button--active']:
                                                dateFlexibility === option.days,
                                        })}
                                        onClick={() => setFormData('days_to_shift', option.days)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault()
                                                setFormData('days_to_shift', option.days)
                                            }
                                        }}
                                    >
                                        {option.label}
                                    </div>
                                ))}
                            </div>
                            <div ref={unitLoadingAnchorRef} />
                            {isUnitRangeLoading && (
                                <div className="wbk_step__unit_range_loader">
                                    <div className="wbk_step__unit_range_loader_spinner" />
                                </div>
                            )}
                            {showNoUnitOffersMessage && (
                                <p className="wbk_step__unit_offers_empty">
                                    {wording.unit_no_available_offers ||
                                        __('No available offers found for the selected range.', 'webba-booking-lite')}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {bookingMode === 'units' &&
                !isUnitRangeLoading &&
                unitOffers.length > 0 && (
                <div ref={unitOffersSectionRef} className="wbk_step__unit_offers">
                    <h3 className="wbk_step__unit_offers_title">
                        {wording.unit_available_date_ranges ||
                            __('Available Date Ranges', 'webba-booking-lite')}
                    </h3>
                    <div className="wbk_step__unit_offers_list">
                        {unitOffers.map((offer) => (
                            <div
                                key={offer.id}
                                role="button"
                                tabIndex={0}
                                className={classNames('wbk_step__unit_offers_item', {
                                    'wbk_step__unit_offers_item--selected':
                                        selectedOfferId === offer.id,
                                })}
                                onClick={() => handleUnitOfferSelect(offer)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault()
                                        handleUnitOfferSelect(offer)
                                    }
                                }}
                            >
                                <div className="wbk_step__unit_offers_item_left">
                                    <div className="wbk_step__unit_offers_item_icon">
                                        <img src={calendarIcon} alt={__('Calendar', 'webba-booking-lite')} />
                                    </div>
                                    <div>
                                        <p className="wbk_step__unit_offers_item_title">
                                            {format(offer.start, 'MMMM d')} -{' '}
                                            {format(offer.end, 'MMMM d, yyyy')}
                                        </p>
                                        <p className="wbk_step__unit_offers_item_days">
                                            {offer.days}{' '}
                                            {offer.days > 1
                                                ? wording.unit_days ||
                                                  __('days', 'webba-booking-lite')
                                                : __('day', 'webba-booking-lite')}
                                        </p>
                                    </div>
                                </div>
                                <div className="wbk_step__unit_offers_item_right">
                                    <p className="wbk_step__unit_offers_item_price">
                                        {String(offer.total)}
                                    </p>
                                    <p className="wbk_step__unit_offers_item_status">
                                        {wording.unit_available ||
                                            wording.available ||
                                            __('Available', 'webba-booking-lite')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    )

    return (
        disableCustomScroll ? (
            <div className={'wbk_step__native-scroll-wrapper'}>{content}</div>
        ) : (
            <CustomScroll
                flex="1"
                className={'wbk_step__scroll-wrapper'}
                allowOuterScroll={true}
            >
                {content}
            </CustomScroll>
        )
    )
}
