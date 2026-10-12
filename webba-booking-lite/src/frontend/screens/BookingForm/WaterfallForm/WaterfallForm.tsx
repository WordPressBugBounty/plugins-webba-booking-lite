import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { useDispatch } from '@wordpress/data'
import { store_name } from '../../../../store/frontend'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { LocationDropdown } from '../../../components/LocationDropdown/LocationDropdown'
import { ILocationOption } from '../../../components/LocationDropdown/types'
import { getServiceAssociatedLocations } from '../../../lib/locationFilter/getServiceAssociatedLocations'
import { getPlainTextFromHtml } from '../../../lib/utils'
import { Button } from '../../../components/Button/Button'
import { ReactComponent as GoNextIcon } from '../../../../../public/images/icon-go-next.svg'
import {
    CategoryIcon,
    ServiceIcon,
    StaffIcon,
    UnitIcon,
    WaterfallDropdown,
} from './WaterfallDropdown'
import { getStaffOptionsForService } from '../../../components/StaffSelector/utils'
import { STAFF_ANY_AVAILABLE } from '../../../components/StaffSelector/StaffSelector'
import { IStaffOption } from '../../../components/StaffSelector/types'
import { WaterfallAvailabilityCalendar } from './WaterfallAvailabilityCalendar'
import { WaterfallUnitAvailabilityCalendar } from './WaterfallUnitAvailabilityCalendar'
import {
    WaterfallCheckoutFields,
    useWaterfallCheckoutValidation,
} from './WaterfallCheckoutFields'
import { WaterfallSummary } from './WaterfallSummary'
import { WaterfallSelectedItem } from './WaterfallSelectedItem'
import { FormProvider } from '../../../components/Form/FormProvider'
import { PaymentStep } from '../steps/PaymentStep'
import { ThankYou } from '../ThankYou/ThankYou'
import { useProcessBooking } from '../../../hooks/useProcessBooking'
import { stripeMethods } from '../PaymentHandler/payments/Stripe/StripeMethods'
import { useWording } from '../../../hooks/useWording'
import './WaterfallForm.scss'

const isUnsetAttr = (value: unknown) =>
    value == null || String(value).trim() === '' || String(value) === '0'

const WATERFALL_SCROLL_EXTRA_PX = 220

const getScrollableParent = (element: HTMLElement) => {
    let container = element.parentElement

    while (container) {
        const style = window.getComputedStyle(container)
        const canScroll =
            (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
            container.scrollHeight > container.clientHeight + 1

        if (canScroll) {
            return container
        }

        container = container.parentElement
    }

    return null
}

const scrollWaterfallSection = (element: HTMLElement | null) => {
    if (!element) {
        return
    }

    const elRect = element.getBoundingClientRect()
    const container = getScrollableParent(element)

    if (container) {
        const containerRect = container.getBoundingClientRect()
        const overflowBelow = elRect.bottom - containerRect.bottom
        container.scrollTo({
            top: container.scrollTop + overflowBelow + WATERFALL_SCROLL_EXTRA_PX,
            behavior: 'smooth',
        })
        return
    }

    const overflowBelow = elRect.bottom - window.innerHeight
    window.scrollBy({
        top: overflowBelow + WATERFALL_SCROLL_EXTRA_PX,
        behavior: 'smooth',
    })
}

const WaterfallAppear = ({ children }: { children: ReactNode }) => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        let innerFrame = 0
        const outerFrame = window.requestAnimationFrame(() => {
            innerFrame = window.requestAnimationFrame(() => {
                setVisible(true)
            })
        })

        return () => {
            window.cancelAnimationFrame(outerFrame)
            window.cancelAnimationFrame(innerFrame)
        }
    }, [])

    return (
        <div
            className={classNames('wbk_waterfall_form__appear', {
                'wbk_waterfall_form__appear--visible': visible,
            })}
        >
            {children}
        </div>
    )
}

export const WaterfallForm = ({
    onBookingComplete,
}: {
    onBookingComplete?: (response?: any) => void
} = {}) => {
    const {
        attrService,
        attrHideCategory,
        bookingMode,
        categories,
        services,
        units,
        formData,
        preset,
        setFormObj,
        setFormData,
        onLocationSelect,
        onStaffSelect,
        extractedAttrCats,
        extractedAttrLocations,
        extractedAttrStaff,
        loading,
        fields,
        setFields,
        paymentMethods,
        stripeObj,
        squareObj,
        amountData,
    } = useBookingContext()
    const { fetchBookingFields, fetchBookingAmounts } = useDispatch(store_name)
    const processBooking = useProcessBooking()
    const checkoutWording = useWording()
    const { canSubmit: canSubmitFields, submitError: fieldsSubmitError } =
        useWaterfallCheckoutValidation()

    const wording = preset?.wording ?? {}
    const calendarRef = useRef<HTMLDivElement>(null)
    const checkoutButtonRef = useRef<HTMLDivElement>(null)
    const checkoutFieldsRef = useRef<HTMLDivElement>(null)
    const [showCheckoutFields, setShowCheckoutFields] = useState(false)
    const [staffChoice, setStaffChoice] = useState<{
        serviceId: number
        staffId: string
    } | null>(null)
    const [completedBooking, setCompletedBooking] = useState<any>(null)
    const hasPresetService = !isUnsetAttr(attrService)
    const hasPresetCategory = extractedAttrCats.length > 0
    const hasPresetLocation = extractedAttrLocations.length > 0

    const bookableItems = bookingMode === 'units' ? units || [] : services || []

    const locations = useMemo(
        () =>
            getServiceAssociatedLocations(
                (preset?.locations ?? []) as ILocationOption[],
                bookableItems as Array<{ locations?: Array<string | number> }>
            ),
        [bookableItems, preset?.locations]
    )
    const hasLocations = locations.length > 0
    const hasServices =
        bookingMode === 'units'
            ? (preset?.units ?? []).length > 0
            : (preset?.services ?? []).length > 0

    const locationId =
        formData?.location != null ? String(formData.location) : ''
    const locationSelected = locationId !== ''
    const selectedCategoryFromUi = (categories || []).find(
        ({ selected }) => selected
    )
    const presetCategories = useMemo(
        () =>
            (categories || []).filter((category) =>
                extractedAttrCats.includes(Number(category.id))
            ),
        [categories, extractedAttrCats]
    )
    const selectedCategory =
        selectedCategoryFromUi ||
        (presetCategories.length === 1 ? presetCategories[0] : undefined)
    const categorySelected = !!selectedCategory || hasPresetCategory
    const categoryId = selectedCategory ? String(selectedCategory.id) : ''

    const clearCategorySelection = () => {
        setFormObj(
            'categories',
            (categories || []).map((category) => ({
                ...category,
                selected: false,
            }))
        )
        setFormData('category', null)
    }

    const clearBookableSelection = () => {
        if (bookingMode === 'units') {
            setFormObj(
                'units',
                (units || []).map((unit) => ({
                    ...unit,
                    selected: false,
                    selectedAt: null,
                }))
            )
            setFormData('units', [])
            return
        }

        setFormObj(
            'services',
            (services || []).map((service) => ({
                ...service,
                selected: false,
                selectedAt: null,
            }))
        )
        setFormData('services', [])
    }

    const serviceIdsInSelectedLocation = useMemo(() => {
        if (!locationId) {
            return new Set(bookableItems.map((item) => String(item.id)))
        }
        const inLocation = bookableItems.filter((item) => {
            const locs = item.locations
            if (!locs || !Array.isArray(locs) || locs.length === 0) {
                return false
            }
            return locs.some((lid) => String(lid) === locationId)
        })
        return new Set(inLocation.map((item) => String(item.id)))
    }, [bookableItems, locationId])

    const categoryOptions = useMemo(() => {
        return (categories || [])
            .filter((category) => {
                const linkedIds =
                    bookingMode === 'units'
                        ? category.units || []
                        : category.services || []
                return linkedIds.some((id) =>
                    serviceIdsInSelectedLocation.has(String(id))
                )
            })
            .map((category) => ({
                id: String(category.id),
                label: category.name,
            }))
    }, [bookingMode, categories, serviceIdsInSelectedLocation])
    const hasCategories =
        attrHideCategory !== 'yes' && categoryOptions.length > 0

    const serviceOptions = useMemo(() => {
        let filtered = bookableItems

        if (locationSelected) {
            filtered = filtered.filter((item) =>
                serviceIdsInSelectedLocation.has(String(item.id))
            )
        }

        const categoryFilterSource = selectedCategory
            ? [selectedCategory]
            : presetCategories

        if (categoryFilterSource.length > 0) {
            const linkedIds = new Set(
                categoryFilterSource.flatMap((category) =>
                    (
                        bookingMode === 'units'
                            ? category.units || []
                            : category.services || []
                    ).map((id) => String(id))
                )
            )
            filtered = filtered.filter((item) => linkedIds.has(String(item.id)))
        }

        return filtered.map((item) => ({
            id: String(item.id),
            label: item.label,
            description: item.description
                ? getPlainTextFromHtml(item.description)
                : undefined,
        }))
    }, [
        bookableItems,
        bookingMode,
        locationSelected,
        presetCategories,
        selectedCategory,
        serviceIdsInSelectedLocation,
    ])

    // Reveal each dropdown under the previous one once the prior selection is made
    const showLocation =
        !hasPresetService &&
        !hasPresetCategory &&
        !hasPresetLocation &&
        hasLocations
    const showCategory =
        !hasPresetService &&
        !hasPresetCategory &&
        hasCategories &&
        (!hasLocations || locationSelected)
    const showService =
        !hasPresetService &&
        hasServices &&
        (!hasLocations || locationSelected || hasPresetCategory) &&
        (!hasCategories || categorySelected)

    const selectedService =
        bookingMode === 'services'
            ? (services || []).find(({ selected }) => selected)
            : undefined
    const selectedUnit =
        bookingMode === 'units'
            ? (units || []).find(({ selected }) => selected)
            : undefined
    const selectedServiceId = selectedService
        ? String(selectedService.id)
        : selectedUnit
          ? String(selectedUnit.id)
          : ''

    const locationIdForStaff = locationId !== '' ? locationId : null
    const staffOptions = useMemo(
        () =>
            selectedService
                ? getStaffOptionsForService(
                      preset?.staff_members as IStaffOption[] | undefined,
                      selectedService.id,
                      locationIdForStaff,
                      extractedAttrStaff
                  )
                : [],
        [
            extractedAttrStaff,
            locationIdForStaff,
            preset?.staff_members,
            selectedService?.id,
        ]
    )
    const staffChoiceForService =
        selectedService && staffChoice?.serviceId === selectedService.id
            ? staffChoice.staffId
            : null
    const showStaffDropdown =
        bookingMode === 'services' &&
        !!selectedService &&
        extractedAttrStaff.length !== 1 &&
        staffOptions.length > 1
    const staffIdForCalendar = useMemo(() => {
        if (bookingMode !== 'services' || !selectedService) {
            return null
        }
        if (staffOptions.length === 0) {
            return null
        }
        if (staffOptions.length === 1 || extractedAttrStaff.length === 1) {
            return staffOptions[0]?.id ?? extractedAttrStaff[0] ?? null
        }
        return staffChoiceForService
    }, [
        bookingMode,
        extractedAttrStaff,
        selectedService,
        staffChoiceForService,
        staffOptions,
    ])
    const showServiceCalendar =
        !!selectedService &&
        (staffOptions.length === 0 || staffIdForCalendar != null)

    const staffDropdownOptions = useMemo(
        () => [
            {
                id: STAFF_ANY_AVAILABLE,
                label:
                    wording.any_available ||
                    __('Any available', 'webba-booking-lite'),
                description:
                    wording.best_available_time ||
                    __('Best available time.', 'webba-booking-lite'),
            },
            ...staffOptions.map((staff) => ({
                id: String(staff.id),
                label: staff.label,
            })),
        ],
        [staffOptions, wording.any_available, wording.best_available_time]
    )

    const hasSelectedTimeslot =
        bookingMode === 'units'
            ? (() => {
                  if (!selectedUnit) {
                      return false
                  }
                  const placesMap = formData?.places as
                      | Record<string, unknown>
                      | undefined
                  const unitPlaces = placesMap?.[String(selectedUnit.id)]
                  return Array.isArray(unitPlaces) && unitPlaces.length > 0
              })()
            : !!selectedService &&
              Array.isArray(selectedService.places) &&
              selectedService.places.length > 0

    const handleLocationChange = (id: string | number) => {
        const nextLocationId = String(id)
        if (nextLocationId === locationId) {
            return
        }

        if (locationSelected) {
            clearCategorySelection()
            clearBookableSelection()
        }

        onLocationSelect(id)
    }

    const handleCategoryChange = (id: string) => {
        const category = (categories || []).find(
            (item) => String(item.id) === id
        )
        if (!category || category.selected) {
            return
        }

        // Changing category rebuilds the service dropdown below it
        clearBookableSelection()
        category.onSelect()
    }

    const handleServiceChange = (id: string) => {
        const item = bookableItems.find((entry) => String(entry.id) === id)
        if (!item || item.selected) {
            return
        }

        clearBookableSelection()
        item.onUpdate({ selected: true })
    }

    const handleStaffChange = (id: string) => {
        if (!selectedService || staffChoiceForService === id) {
            return
        }

        selectedService.onUpdate({ places: [] })
        setStaffChoice({ serviceId: selectedService.id, staffId: id })
        onStaffSelect(selectedService.id, id)
    }

    const handleProceedToCheckout = async () => {
        const selectedIds =
            bookingMode === 'units'
                ? (units || [])
                      .filter((item) => item.selected)
                      .map((item) => item.id)
                : (services || [])
                      .filter((item) => item.selected)
                      .map((item) => item.id)

        if (selectedIds.length > 0) {
            await fetchBookingFields(selectedIds)
        }

        setShowCheckoutFields(true)
    }

    const showPaymentStep = useMemo(() => {
        if (!paymentMethods || paymentMethods.length === 0) {
            return false
        }

        const onlyMethod = paymentMethods[0]?.id
        const hostedCheckoutMethods = ['paypal', 'woocommerce']

        // Keep the payment UI for hosted gateways even when it is the only method.
        // Bank / arrival can still skip the selector when coupons are off.
        if (
            paymentMethods.length === 1 &&
            preset?.settings?.coupons_enabled === false &&
            !stripeMethods.includes(onlyMethod) &&
            onlyMethod !== 'square' &&
            !hostedCheckoutMethods.includes(onlyMethod)
        ) {
            return false
        }

        return true
    }, [paymentMethods, preset])

    const { canSubmit, submitError } = useMemo(() => {
        if (!canSubmitFields) {
            return { canSubmit: false, submitError: fieldsSubmitError }
        }

        if (
            preset?.settings?.coupons_enabled &&
            String(formData?.coupon || '').length > 0 &&
            Number(amountData?.to_pay_total) <= 0
        ) {
            return { canSubmit: true, submitError: null as string | null }
        }

        if (!showPaymentStep) {
            if (
                Number(amountData?.to_pay_total) > 0 &&
                (!paymentMethods || paymentMethods.length === 0)
            ) {
                return {
                    canSubmit: false,
                    submitError:
                        checkoutWording?.please_select_payment_method ||
                        __('Please select a payment method', 'webba-booking-lite'),
                }
            }

            return { canSubmit: true, submitError: null as string | null }
        }

        const paymentMethod = formData?.payment_method as string
        const acceptedMethods = [
            'stripe',
            'square',
            'paypal',
            'mollie',
            'bank',
            'arrival',
            'woocommerce',
            'google_pay',
            'apple_pay',
            'stripe_others',
        ]

        if (
            paymentMethod &&
            stripeMethods.includes(paymentMethod) &&
            !stripeObj?.isValidated &&
            Number(amountData?.to_pay_total) > 0
        ) {
            return {
                canSubmit: false,
                submitError:
                    checkoutWording?.please_fill_out_payment_form ||
                    __('Please fill out payment form', 'webba-booking-lite'),
            }
        }

        if (
            paymentMethod === 'square' &&
            !squareObj?.isValidated &&
            Number(amountData?.to_pay_total) > 0
        ) {
            return {
                canSubmit: false,
                submitError:
                    checkoutWording?.please_fill_out_payment_form ||
                    __('Please fill out payment form', 'webba-booking-lite'),
            }
        }

        if (!paymentMethod || !acceptedMethods.includes(paymentMethod)) {
            return {
                canSubmit: false,
                submitError:
                    checkoutWording?.please_select_payment_method ||
                    __('Please select a payment method', 'webba-booking-lite'),
            }
        }

        return { canSubmit: true, submitError: null as string | null }
    }, [
        canSubmitFields,
        fieldsSubmitError,
        showPaymentStep,
        formData?.payment_method,
        formData?.coupon,
        preset,
        stripeObj?.isValidated,
        squareObj?.isValidated,
        amountData?.to_pay_total,
        checkoutWording,
        paymentMethods,
    ])

    const isSubmitting = Boolean(loading?.createBooking)

    const handleSubmit = async () => {
        if (!canSubmit || isSubmitting) {
            return
        }

        try {
            const response = await processBooking()
            const method = response?.payment_method
            const needsHostedCheckout =
                response?.payment_required === true &&
                (method === 'paypal' || method === 'woocommerce')

            if (needsHostedCheckout) {
                onBookingComplete?.(response)
                return
            }

            setCompletedBooking(response || { success: true })
            onBookingComplete?.(response)
        } catch {
            // Error toast is handled in useProcessBooking
        }
    }

    const placesKey = JSON.stringify(formData?.places)

    useEffect(() => {
        if (!selectedService || bookingMode !== 'services') {
            return
        }

        if (staffOptions.length === 1) {
            const singleStaffId = String(staffOptions[0].id)
            setStaffChoice({
                serviceId: selectedService.id,
                staffId: singleStaffId,
            })
            onStaffSelect(selectedService.id, singleStaffId)
            return
        }

        if (extractedAttrStaff.length === 1 && extractedAttrStaff[0]) {
            const singleStaffId = extractedAttrStaff[0]
            setStaffChoice({
                serviceId: selectedService.id,
                staffId: singleStaffId,
            })
            onStaffSelect(selectedService.id, singleStaffId)
        }
    }, [
        bookingMode,
        extractedAttrStaff,
        onStaffSelect,
        selectedService?.id,
        staffOptions,
    ])

    useEffect(() => {
        if (!hasSelectedTimeslot || bookingMode === 'units') {
            return
        }

        if (
            !formData?.places ||
            Object.keys(formData.places as Record<string, unknown>).length === 0
        ) {
            return
        }

        fetchBookingAmounts({
            ...formData,
            generate_stripe_intent: false,
        })
    }, [placesKey, hasSelectedTimeslot, bookingMode])

    useEffect(() => {
        if (!selectedUnit?.id) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            scrollWaterfallSection(calendarRef.current)
        }, 400)

        return () => window.clearTimeout(timeoutId)
    }, [selectedUnit?.id])

    useEffect(() => {
        if (!hasSelectedTimeslot) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            scrollWaterfallSection(checkoutButtonRef.current)
        }, 400)

        return () => window.clearTimeout(timeoutId)
    }, [hasSelectedTimeslot])

    useEffect(() => {
        if (!hasSelectedTimeslot) {
            setShowCheckoutFields(false)
        }
    }, [hasSelectedTimeslot])

    useEffect(() => {
        if (!showCheckoutFields || loading?.bookingFields) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            scrollWaterfallSection(checkoutFieldsRef.current)
        }, 400)

        return () => window.clearTimeout(timeoutId)
    }, [showCheckoutFields, loading?.bookingFields])

    if (completedBooking) {
        return <ThankYou bookingDetails={completedBooking} />
    }

    return (
        <div className="wbk_waterfall_form__wrapper">
            {showLocation && (
                <WaterfallAppear>
                    <LocationDropdown
                        locations={locations}
                        onSelect={handleLocationChange}
                    />
                </WaterfallAppear>
            )}

            {showCategory && (
                <WaterfallAppear key={`category-${locationId}`}>
                    <WaterfallDropdown
                        icon={<CategoryIcon />}
                        label={
                            wording.category ||
                            __('Category', 'webba-booking-lite')
                        }
                        placeholder={
                            wording.select_category ||
                            wording.category_label ||
                            __('Select category', 'webba-booking-lite')
                        }
                        options={categoryOptions}
                        value={categoryId}
                        onChange={handleCategoryChange}
                    />
                </WaterfallAppear>
            )}

            {showService && (
                <WaterfallAppear key={`service-${locationId}-${categoryId}`}>
                    <div className="wbk_waterfall_form__service-step">
                        <WaterfallDropdown
                            icon={
                                bookingMode === 'units' ? (
                                    <UnitIcon />
                                ) : (
                                    <ServiceIcon />
                                )
                            }
                            label={
                                bookingMode === 'units'
                                    ? wording.unit ||
                                      __('Unit', 'webba-booking-lite')
                                    : wording.service ||
                                      __('Service', 'webba-booking-lite')
                            }
                            placeholder={
                                bookingMode === 'units'
                                    ? wording.select_unit ||
                                      wording.select_units ||
                                      __('Select unit', 'webba-booking-lite')
                                    : wording.select_service ||
                                      wording.service_label ||
                                      wording.select_services ||
                                      __('Select service', 'webba-booking-lite')
                            }
                            options={serviceOptions}
                            value={selectedServiceId}
                            onChange={handleServiceChange}
                        />
                        <WaterfallSelectedItem />
                    </div>
                </WaterfallAppear>
            )}

            {!showService && (selectedService || selectedUnit) && (
                <WaterfallAppear key={`selected-card-${selectedServiceId}`}>
                    <WaterfallSelectedItem />
                </WaterfallAppear>
            )}

            {showStaffDropdown && selectedService && (
                <WaterfallAppear key={`staff-${selectedService.id}`}>
                    <WaterfallDropdown
                        icon={<StaffIcon />}
                        label={
                            wording.staff_member ||
                            wording.staff ||
                            __('Staff member', 'webba-booking-lite')
                        }
                        placeholder={
                            wording.select_staff_member ||
                            __('Select staff member', 'webba-booking-lite')
                        }
                        options={staffDropdownOptions}
                        value={staffChoiceForService || ''}
                        onChange={handleStaffChange}
                    />
                </WaterfallAppear>
            )}

            {showServiceCalendar && selectedService && (
                <WaterfallAppear
                    key={`calendar-${selectedService.id}-${staffIdForCalendar || 'none'}`}
                >
                    <WaterfallAvailabilityCalendar
                        service={selectedService}
                        locationId={locationId}
                        staffId={staffIdForCalendar}
                        weekStart={preset?.settings?.week_start}
                    />
                </WaterfallAppear>
            )}

            {selectedUnit && (
                <WaterfallAppear key={`calendar-${selectedUnit.id}`}>
                    <div ref={calendarRef}>
                        <WaterfallUnitAvailabilityCalendar
                            unit={selectedUnit}
                            locationId={locationId}
                            weekStart={preset?.settings?.week_start}
                        />
                    </div>
                </WaterfallAppear>
            )}

            {hasSelectedTimeslot && !showCheckoutFields && (
                <WaterfallAppear key="checkout-button">
                    <WaterfallSummary />
                    <div
                        className="wbk_waterfall_form__checkout"
                        ref={checkoutButtonRef}
                    >
                        <Button
                            type="primary"
                            classes="wbk_waterfall_form__checkout-button"
                            onClick={handleProceedToCheckout}
                            showLoading={!!loading?.bookingFields}
                            disabled={!!loading?.bookingFields}
                            svgIcon={
                                GoNextIcon as React.FunctionComponent<
                                    React.SVGAttributes<SVGElement>
                                >
                            }
                            iconLocation="right"
                        >
                            {wording.proceed_to_checkout ||
                                __('Proceed to checkout', 'webba-booking-lite')}
                        </Button>
                    </div>
                </WaterfallAppear>
            )}

            {showCheckoutFields && (
                <WaterfallAppear key="checkout-fields">
                    <FormProvider fields={fields} setFields={setFields}>
                        <div ref={checkoutFieldsRef}>
                            <WaterfallCheckoutFields />
                            {showPaymentStep && !loading?.bookingFields && (
                                <div className="wbk_waterfall_form__payment">
                                    <PaymentStep nativeScroll />
                                </div>
                            )}
                            <WaterfallSummary />
                            <div className="wbk_waterfall_form__submit">
                                <Button
                                    type="primary"
                                    classes="wbk_waterfall_form__submit-button"
                                    onClick={() => {
                                        void handleSubmit()
                                    }}
                                    disabled={!canSubmit || isSubmitting}
                                    showLoading={isSubmitting}
                                    tooltip={
                                        !canSubmit && submitError
                                            ? submitError
                                            : undefined
                                    }
                                    svgIcon={
                                        GoNextIcon as React.FunctionComponent<
                                            React.SVGAttributes<SVGElement>
                                        >
                                    }
                                    iconLocation="right"
                                >
                                    {wording.submit ||
                                        checkoutWording?.submit ||
                                        __('Submit', 'webba-booking-lite')}
                                </Button>
                            </div>
                        </div>
                    </FormProvider>
                </WaterfallAppear>
            )}
        </div>
    )
}
