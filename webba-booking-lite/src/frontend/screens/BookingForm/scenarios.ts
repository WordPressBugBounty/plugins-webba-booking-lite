import { IScenario as IScenarioBase } from './types'
import { ServicesStep } from './steps/ServicesStep'
import { CalendarStep } from './steps/CalendarStep'
import { CheckoutStep } from './steps/CheckoutStep'
import { PaymentStep } from './steps/PaymentStep'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { validateField } from '../../components/Form/validation'
import { IField } from '../../components/Form/types'
import { stripeMethods } from './PaymentHandler/payments/Stripe/StripeMethods'
import { ExtrasStep } from './steps/ExtrasStep'

// Allow validationRules to return true (valid) or a string (error message)
type ValidationResult = true | string
type ValidationRule = (value: any) => ValidationResult

interface IScenario extends Omit<IScenarioBase, 'validationRules'> {
    validationRules: {
        [key: string]: ValidationRule
    }
}

export const bookingScenarios: IScenario[] = [
    {
        title: 'select_services',
        description: 'choose_service_proceed',
        Screen: ServicesStep,
        validationRules: {
            services: (value) => {
                const { bookingMode, units } = useBookingContext()
                if (bookingMode === 'units') {
                    const selectedUnits = (units || []).filter(
                        ({ selected }) => selected
                    )
                    return selectedUnits.length > 0
                        ? true
                        : 'please_select_service'
                }
                return !!value && value.length > 0
                    ? true
                    : 'please_select_service'
            },
        },
        isVisible: () => {
            const { attrService, bookingMode } = useBookingContext()
            if (bookingMode === 'units') {
                return true
            }

            return attrService === undefined || attrService === '0'
        },
    },
    {
        title: 'select_date_time_services',
        description: 'choose_preferred_appointment_slot',
        Screen: CalendarStep,
        validationRules: {
            places: (value) => {
                const { services, bookingMode, formData, units } = useBookingContext()
                if (bookingMode === 'units') {
                    const selectedUnits = (units || []).filter(
                        ({ selected }) => selected
                    )
                    if (selectedUnits.length === 0) {
                        return 'please_select_service'
                    }
                    const selectedUnit = selectedUnits[0]
                    const placesMap = formData.places as
                        | Record<string, unknown>
                        | undefined
                    const unitPlaces = placesMap?.[String(selectedUnit.id)] as
                        | unknown[]
                        | undefined
                    if (!Array.isArray(unitPlaces) || unitPlaces.length === 0) {
                        return 'please_select_timeslot'
                    }
                    const range = (formData as Record<string, any>)?.range
                    if (!range?.start || !range?.end) {
                        return 'please_select_timeslot'
                    }
                    const attendees = selectedUnit?.attendees || {
                        adult: 0,
                        child: 0,
                        infant: 0,
                    }
                    const totalAttendees =
                        Number(attendees.adult || 0) +
                        Number(attendees.child || 0) +
                        Number(attendees.infant || 0)
                    const unitCapacity = Math.max(
                        1,
                        Number(selectedUnit?.capacity) || 1
                    )
                    if (totalAttendees > unitCapacity) {
                        return 'the_entered_number_is_invalid'
                    }
                    return true
                }

                const selectedServices = services
                    .filter(({ selected }) => selected)
                    .map(({ id }) => id)
                const placeIds = Object.keys(value)

                if (selectedServices.length !== placeIds.length) {
                    return 'please_select_timeslot'
                }

                // Check min_slots and max_slots for each service, based on total selected places (not per day)
                for (const serviceId of placeIds) {
                    const service = services.find(
                        (s) => s.id === Number(serviceId)
                    )
                    if (!service) continue
                    const serviceName =
                        (service as any).name || `Service #${serviceId}`
                    const selectedPlaces = value[serviceId] || []

                    const totalSelectedSlots = selectedPlaces.length

                    // Only check min/max slots if limited_timeslot is true for this service
                    if (service.limited_timeslot) {
                        // Check minimum slots (default to 0 if not defined)
                        const minSlots = service.min_slots || 0
                        if (totalSelectedSlots < minSlots) {
                            return `Please select at least ${minSlots} slot(s) for ${serviceName}.`
                        }
                        // Check maximum slots (default to unlimited if not defined)
                        const maxSlots = service.max_slots
                        if (
                            maxSlots !== undefined &&
                            maxSlots > 0 &&
                            totalSelectedSlots > maxSlots
                        ) {
                            return `You can select at most ${maxSlots} slot(s) for ${serviceName}.`
                        }
                    }
                }

                return true
            },
        },
    },
    {
        title: 'select_extras',
        description: 'choose_additional_services',
        Screen: ExtrasStep,
        validationRules: {

        },
        isVisible: () => {
            const { services, units, bookingMode } = useBookingContext()

            if (bookingMode === 'units') {
                const selectedUnits = (units || []).filter(({ selected }) => selected)
                return selectedUnits.some(
                    (unit) =>
                        Array.isArray(unit.extra_ids) && unit.extra_ids.length > 0
                )
            }

            const selectedServices = services.filter(({ selected }) => selected)
            return selectedServices.some(
                (service) =>
                    Array.isArray(service.extra_ids) &&
                    service.extra_ids.length > 0
            )
        },
    },
    {
        title: 'personal_details',
        description: 'fill_contact_information',
        Screen: CheckoutStep,
        validationRules: {
            fields: (value) => {
                const { fields } = useBookingContext()

                for (const field of fields) {
                    const errors = validateField(field as IField)
                    if (errors && errors.length > 0) {
                        return 'please_fill_out_all_fields'
                    }
                }
                return true
            },
        },
    },
    {
        title: 'payment_method',
        description: 'select_preferred_payment_method',
        Screen: PaymentStep,
        validationRules: {
            payment_method: (value) => {
                const { stripeObj, amountData, preset, formData } =
                    useBookingContext()
                if (
                    preset?.settings.coupons_enabled &&
                    String(formData?.coupon).length > 0 &&
                    amountData.to_pay_total <= 0
                ) {
                    return true
                }

                const accepetedMethods = [
                    'stripe',
                    'paypal',
                    'bank',
                    'arrival',
                    'woocommerce',
                    'google_pay',
                    'apple_pay',
                    'stripe_others',
                ]

                if (
                    !!value &&
                    stripeMethods.includes(value) &&
                    !stripeObj?.isValidated &&
                    Number(amountData?.to_pay_total) > 0
                ) {
                    return 'please_fill_out_payment_form'
                }

                return !!value && accepetedMethods.includes(value)
                    ? true
                    : 'please_select_payment_method'
            },
        },
        isVisible: () => {
            const { paymentMethods, preset } = useBookingContext()

            if (
                paymentMethods &&
                paymentMethods.length === 1 &&
                preset?.settings.coupons_enabled === false &&
                !stripeMethods.includes(paymentMethods[0].id)
            ) {
                return false
            }

            return paymentMethods && paymentMethods.length > 0
        },
    },
]
