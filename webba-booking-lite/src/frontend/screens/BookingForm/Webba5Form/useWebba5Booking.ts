import { useEffect, useMemo, useState } from 'react'
import { __ } from '@wordpress/i18n'
import { useDispatch } from '@wordpress/data'
import { store_name } from '../../../../store/frontend'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { getServiceAssociatedLocations } from '../../../lib/locationFilter/getServiceAssociatedLocations'
import { ILocationOption } from '../../../components/LocationDropdown/types'
import { getStaffOptionsForService } from '../../../components/StaffSelector/utils'
import { STAFF_ANY_AVAILABLE } from '../../../components/StaffSelector/StaffSelector'
import { IStaffOption } from '../../../components/StaffSelector/types'
import { useWording } from '../../../hooks/useWording'
import { useProcessBooking } from '../../../hooks/useProcessBooking'
import { useWaterfallCheckoutValidation } from '../WaterfallForm/WaterfallCheckoutFields'
import { stripeMethods } from '../PaymentHandler/payments/Stripe/StripeMethods'
import { IUnitAttendees } from '../../../components/Services/types'
import { IWebba5BookableItem, Webba5StepId } from './types'

const HOSTED_CHECKOUT_METHODS = ['paypal', 'woocommerce', 'mollie']

const isUnsetAttr = (value: unknown) =>
    value == null || String(value).trim() === '' || String(value) === '0'

const getTotalAttendees = (attendees: IUnitAttendees) =>
    Number(attendees.adult || 0) +
    Number(attendees.child || 0) +
    Number(attendees.infant || 0)

export const useWebba5Booking = (
    onBookingComplete?: (response?: unknown) => void
) => {
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
        paymentMethods,
        stripeObj,
        squareObj,
        amountData,
    } = useBookingContext()
    const { fetchBookingFields, fetchBookingAmounts } = useDispatch(store_name)
    const processBooking = useProcessBooking()
    const wording = useWording()
    const { canSubmit: canSubmitFields, submitError: fieldsSubmitError } =
        useWaterfallCheckoutValidation()
    const [requestedStep, setRequestedStep] = useState<Webba5StepId>('service')
    const [fieldsReady, setFieldsReady] = useState(false)
    const [paymentReady, setPaymentReady] = useState(false)
    const [staffChoice, setStaffChoice] = useState<{
        serviceId: number
        staffId: string
    } | null>(null)

    const attributeServiceIds = useMemo(() => {
        if (isUnsetAttr(attrService)) {
            return [] as string[]
        }
        return String(attrService)
            .split(',')
            .map((value) => value.trim())
            .filter((value) => value !== '' && value !== '0')
    }, [attrService])
    const hasPresetService = attributeServiceIds.length > 0
    const hasPresetCategory = extractedAttrCats.length > 0
    const hasPresetLocation = extractedAttrLocations.length > 0
    const bookableItems = (
        bookingMode === 'units' ? units || [] : services || []
    ) as IWebba5BookableItem[]

    const locations = useMemo(
        () =>
            getServiceAssociatedLocations(
                (preset?.locations ?? []) as ILocationOption[],
                bookableItems as Array<{ locations?: Array<string | number> }>
            ),
        [bookableItems, preset?.locations]
    )
    const hasLocations = locations.length > 0
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
        return new Set(
            bookableItems
                .filter((item) => {
                    const itemLocations = item.locations || []
                    if (itemLocations.length === 0) {
                        return true
                    }
                    return itemLocations.some(
                        (location) => String(location) === locationId
                    )
                })
                .map((item) => String(item.id))
        )
    }, [bookableItems, locationId])

    const categoryOptions = useMemo(
        () =>
            (categories || [])
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
                })),
        [bookingMode, categories, serviceIdsInSelectedLocation]
    )
    const hasCategories =
        attrHideCategory !== 'yes' && categoryOptions.length > 0

    const visibleItems = useMemo(() => {
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
            filtered = filtered.filter((item) =>
                linkedIds.has(String(item.id))
            )
        }
        if (
            bookingMode === 'services' &&
            extractedAttrLocations.length > 0 &&
            !locationSelected
        ) {
            filtered = filtered.filter((item) => {
                const itemLocations = (item.locations || []).map((location) =>
                    String(location)
                )
                if (itemLocations.length === 0) {
                    return true
                }
                return itemLocations.some((location) =>
                    extractedAttrLocations.includes(location)
                )
            })
        }
        if (bookingMode === 'services' && attributeServiceIds.length > 0) {
            filtered = filtered.filter((item) =>
                attributeServiceIds.includes(String(item.id))
            )
        }
        if (bookingMode === 'services' && extractedAttrStaff.length > 0) {
            const allowedServiceIds = new Set<string>()
            ;((preset?.staff_members || []) as IStaffOption[]).forEach(
                (staffMember) => {
                    if (!extractedAttrStaff.includes(String(staffMember.id))) {
                        return
                    }
                    ;(staffMember.services || []).forEach((serviceId) => {
                        allowedServiceIds.add(String(serviceId))
                    })
                }
            )
            filtered = filtered.filter((item) =>
                allowedServiceIds.has(String(item.id))
            )
        }
        return filtered
    }, [
        attributeServiceIds,
        bookableItems,
        bookingMode,
        extractedAttrLocations,
        extractedAttrStaff,
        locationSelected,
        preset?.staff_members,
        presetCategories,
        selectedCategory,
        serviceIdsInSelectedLocation,
    ])

    const servicesMatchingAttributes = useMemo(() => {
        if (bookingMode !== 'services') {
            return [] as IWebba5BookableItem[]
        }
        let filtered = bookableItems
        if (attributeServiceIds.length > 0) {
            filtered = filtered.filter((item) =>
                attributeServiceIds.includes(String(item.id))
            )
        }
        if (extractedAttrCats.length > 0) {
            const linkedIds = new Set(
                (categories || [])
                    .filter((category) =>
                        extractedAttrCats.includes(Number(category.id))
                    )
                    .flatMap((category) =>
                        (category.services || []).map((id) => String(id))
                    )
            )
            filtered = filtered.filter((item) =>
                linkedIds.has(String(item.id))
            )
        }
        if (extractedAttrLocations.length > 0) {
            filtered = filtered.filter((item) => {
                const itemLocations = (item.locations || []).map((location) =>
                    String(location)
                )
                if (itemLocations.length === 0) {
                    return true
                }
                return itemLocations.some((location) =>
                    extractedAttrLocations.includes(location)
                )
            })
        }
        if (extractedAttrStaff.length > 0) {
            const allowedServiceIds = new Set<string>()
            ;((preset?.staff_members || []) as IStaffOption[]).forEach(
                (staffMember) => {
                    if (!extractedAttrStaff.includes(String(staffMember.id))) {
                        return
                    }
                    ;(staffMember.services || []).forEach((serviceId) => {
                        allowedServiceIds.add(String(serviceId))
                    })
                }
            )
            filtered = filtered.filter((item) =>
                allowedServiceIds.has(String(item.id))
            )
        }
        return filtered
    }, [
        attributeServiceIds,
        bookableItems,
        bookingMode,
        categories,
        extractedAttrCats,
        extractedAttrLocations,
        extractedAttrStaff,
        preset?.staff_members,
    ])
    const hasAttributeFilter =
        attributeServiceIds.length > 0 ||
        extractedAttrCats.length > 0 ||
        extractedAttrLocations.length > 0 ||
        extractedAttrStaff.length > 0
    const catalogReady =
        bookingMode === 'units'
            ? Array.isArray(preset?.units)
            : Array.isArray(preset?.services)
    const skipServiceStep =
        bookingMode === 'services' &&
        catalogReady &&
        (hasAttributeFilter
            ? servicesMatchingAttributes.length === 1
            : bookableItems.length === 1)
    const step: Webba5StepId =
        skipServiceStep && requestedStep === 'service'
            ? 'schedule'
            : requestedStep

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
    const showServiceList =
        !hasPresetService &&
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
    const selectedItem = (selectedService || selectedUnit) as
        | IWebba5BookableItem
        | undefined

    const staffOptions = useMemo(
        () =>
            selectedService
                ? getStaffOptionsForService(
                      preset?.staff_members as IStaffOption[] | undefined,
                      selectedService.id,
                      null,
                      extractedAttrStaff
                  )
                : [],
        [extractedAttrStaff, preset?.staff_members, selectedService?.id]
    )
    const selectedStaffId =
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
        if (selectedStaffId != null && selectedStaffId !== '') {
            return selectedStaffId
        }
        if (extractedAttrStaff.length === 1 && extractedAttrStaff[0]) {
            return extractedAttrStaff[0]
        }
        if (staffOptions.length === 1) {
            return String(staffOptions[0].id)
        }
        if (staffOptions.length > 1) {
            return STAFF_ANY_AVAILABLE
        }
        return null
    }, [
        bookingMode,
        extractedAttrStaff,
        selectedService,
        selectedStaffId,
        staffOptions,
    ])

    const hasSelectedTimeslot = useMemo(() => {
        if (bookingMode === 'units') {
            if (!selectedUnit) {
                return false
            }
            const placesMap = formData?.places as
                | Record<string, unknown>
                | undefined
            const unitPlaces = placesMap?.[String(selectedUnit.id)]
            return Array.isArray(unitPlaces) && unitPlaces.length > 0
        }
        return (
            !!selectedService &&
            Array.isArray(selectedService.places) &&
            selectedService.places.length > 0
        )
    }, [bookingMode, formData?.places, selectedService, selectedUnit])

    const scheduleError = useMemo(() => {
        if (bookingMode === 'units') {
            if (!selectedUnit) {
                return (
                    wording.please_select_service ||
                    __('Please select a service', 'webba-booking-lite')
                )
            }
            const range = (formData as Record<string, { start?: string; end?: string }>)
                ?.range
            if (!hasSelectedTimeslot || !range?.start || !range?.end) {
                return (
                    wording.please_select_timeslot ||
                    __('Please select a time slot', 'webba-booking-lite')
                )
            }
            const attendees = selectedUnit.attendees || {
                adult: 0,
                child: 0,
                infant: 0,
            }
            const unitCapacity = Math.max(1, Number(selectedUnit.capacity) || 1)
            if (getTotalAttendees(attendees) > unitCapacity) {
                return (
                    wording.the_entered_number_is_invalid ||
                    __('The entered number is invalid', 'webba-booking-lite')
                )
            }
            return null
        }

        if (!selectedService || !hasSelectedTimeslot) {
            return (
                wording.please_select_timeslot ||
                __('Please select a time slot', 'webba-booking-lite')
            )
        }
        if (selectedService.limited_timeslot) {
            const totalSelectedSlots = selectedService.places?.length || 0
            const minSlots = selectedService.min_slots || 0
            if (totalSelectedSlots < minSlots) {
                return `Please select at least ${minSlots} slot(s) for ${selectedService.label}.`
            }
            const maxSlots = selectedService.max_slots
            if (
                maxSlots !== undefined &&
                maxSlots > 0 &&
                totalSelectedSlots > maxSlots
            ) {
                return `You can select at most ${maxSlots} slot(s) for ${selectedService.label}.`
            }
        }
        return null
    }, [
        bookingMode,
        formData,
        hasSelectedTimeslot,
        selectedService,
        selectedUnit,
        wording.please_select_service,
        wording.please_select_timeslot,
        wording.the_entered_number_is_invalid,
    ])

    const canContinueService =
        !!selectedItem &&
        (!showLocation || locationSelected) &&
        (!showCategory || categorySelected)
    const canContinueSchedule = canContinueService && scheduleError == null
    const canContinueDetails =
        canContinueSchedule &&
        canSubmitFields &&
        fieldsReady &&
        !loading?.bookingFields

    const hasExtras = useMemo(() => {
        const items =
            bookingMode === 'units'
                ? (units || []).filter((unit) => unit.selected)
                : (services || []).filter((service) => service.selected)
        return items.some(
            (item) => Array.isArray(item.extra_ids) && item.extra_ids.length > 0
        )
    }, [bookingMode, services, units])

    const showPaymentStep = useMemo(() => {
        if (!paymentMethods || paymentMethods.length === 0) {
            return false
        }
        const onlyMethod = paymentMethods[0]?.id
        if (
            paymentMethods.length === 1 &&
            preset?.settings?.coupons_enabled === false &&
            !stripeMethods.includes(onlyMethod) &&
            onlyMethod !== 'square' &&
            !HOSTED_CHECKOUT_METHODS.includes(onlyMethod)
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
                        wording.please_select_payment_method ||
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
                    wording.please_fill_out_payment_form ||
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
                    wording.please_fill_out_payment_form ||
                    __('Please fill out payment form', 'webba-booking-lite'),
            }
        }
        if (!paymentMethod || !acceptedMethods.includes(paymentMethod)) {
            return {
                canSubmit: false,
                submitError:
                    wording.please_select_payment_method ||
                    __('Please select a payment method', 'webba-booking-lite'),
            }
        }
        return { canSubmit: true, submitError: null as string | null }
    }, [
        amountData?.to_pay_total,
        canSubmitFields,
        fieldsSubmitError,
        formData?.coupon,
        formData?.payment_method,
        paymentMethods,
        preset,
        showPaymentStep,
        squareObj?.isValidated,
        stripeObj?.isValidated,
        wording.please_fill_out_payment_form,
        wording.please_select_payment_method,
    ])

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
        if (!selectedService || selectedStaffId === id) {
            return
        }
        selectedService.onUpdate({ places: [] })
        setStaffChoice({ serviceId: selectedService.id, staffId: id })
        onStaffSelect(selectedService.id, id)
    }

    const openStep = (nextStep: Webba5StepId) => {
        if (nextStep === 'service' && skipServiceStep) {
            return
        }
        if (nextStep === 'schedule' && !canContinueService) {
            return
        }
        if (nextStep === 'details' && !canContinueSchedule) {
            return
        }
        if (nextStep === 'review' && !canContinueDetails) {
            return
        }
        setRequestedStep(nextStep)
    }

    const lockedServiceId = skipServiceStep
        ? servicesMatchingAttributes[0]?.id ?? bookableItems[0]?.id
        : undefined
    useEffect(() => {
        if (lockedServiceId == null || bookingMode !== 'services') {
            return
        }
        const lockedService = (services || []).find(
            (service) => service.id === lockedServiceId
        )
        if (!lockedService || lockedService.selected) {
            return
        }
        lockedService.onUpdate({ selected: true })
    }, [bookingMode, lockedServiceId, services])

    const selectedServiceId = selectedService?.id
    useEffect(() => {
        if (selectedServiceId == null || bookingMode !== 'services') {
            return
        }
        if (staffChoice?.serviceId === selectedServiceId) {
            return
        }
        const initialStaffId =
            extractedAttrStaff.length === 1 && extractedAttrStaff[0]
                ? String(extractedAttrStaff[0])
                : staffOptions.length === 1
                  ? String(staffOptions[0].id)
                  : staffOptions.length > 1
                    ? STAFF_ANY_AVAILABLE
                    : null
        if (!initialStaffId) {
            return
        }
        setStaffChoice({
            serviceId: selectedServiceId,
            staffId: initialStaffId,
        })
        onStaffSelect(selectedServiceId, initialStaffId)
    }, [
        bookingMode,
        extractedAttrStaff,
        onStaffSelect,
        selectedServiceId,
        staffChoice,
        staffOptions,
    ])

    const placesKey = JSON.stringify(formData?.places)
    useEffect(() => {
        const needsCustomerFields = step === 'details' || step === 'review'
        if (!needsCustomerFields || !hasSelectedTimeslot) {
            if (step === 'service' || step === 'schedule') {
                setFieldsReady(false)
                setPaymentReady(false)
            }
            return
        }

        let cancelled = false
        setFieldsReady(false)
        if (step === 'review') {
            setPaymentReady(false)
        }
        const selectedIds =
            bookingMode === 'units'
                ? (units || [])
                      .filter((item) => item.selected)
                      .map((item) => item.id)
                : (services || [])
                      .filter((item) => item.selected)
                      .map((item) => item.id)

        const prepareCheckout = async () => {
            try {
                if (selectedIds.length > 0) {
                    await fetchBookingFields(selectedIds)
                }
                if (!cancelled) {
                    setFieldsReady(true)
                }
                if (step === 'review') {
                    await fetchBookingAmounts({
                        ...formData,
                        generate_stripe_intent: true,
                    })
                    if (!cancelled) {
                        setPaymentReady(true)
                    }
                }
            } finally {
                if (!cancelled && step !== 'review') {
                    setPaymentReady(false)
                }
            }
        }

        void prepareCheckout()

        return () => {
            cancelled = true
        }
    }, [step, placesKey, hasSelectedTimeslot, bookingMode])

    const isSubmitting = Boolean(loading?.createBooking)
    const canSubmitReview =
        canSubmit && fieldsReady && paymentReady && !loading?.bookingFields
    const handleSubmit = async () => {
        if (!canSubmitReview || isSubmitting) {
            return
        }
        try {
            const response = await processBooking()
            const method = (response as { payment_method?: string } | undefined)
                ?.payment_method
            const paymentRequired =
                (response as { payment_required?: boolean } | undefined)
                    ?.payment_required === true
            if (
                paymentRequired &&
                method &&
                HOSTED_CHECKOUT_METHODS.includes(method)
            ) {
                onBookingComplete?.(response)
                return
            }
            onBookingComplete?.(response)
        } catch {
            // Error toast is handled in useProcessBooking
        }
    }

    return {
        step,
        catalogReady,
        skipServiceStep,
        openStep,
        wording,
        preset,
        bookingMode,
        locations,
        showLocation,
        showCategory,
        showServiceList,
        hasPresetService,
        categoryOptions,
        categoryId,
        visibleItems,
        selectedItem,
        selectedService,
        selectedUnit,
        locationId,
        showStaffDropdown,
        staffOptions,
        selectedStaffId,
        staffIdForCalendar,
        canContinueService,
        canContinueSchedule,
        canContinueDetails,
        detailsError: fieldsReady
            ? fieldsSubmitError
            : wording.loading || __('Loading', 'webba-booking-lite'),
        scheduleError,
        hasExtras,
        showPaymentStep,
        canSubmit: canSubmitReview,
        submitError: paymentReady
            ? submitError
            : wording.loading || __('Loading', 'webba-booking-lite'),
        isSubmitting,
        loading,
        handleLocationChange,
        handleCategoryChange,
        handleServiceChange,
        handleStaffChange,
        handleSubmit,
    }
}
