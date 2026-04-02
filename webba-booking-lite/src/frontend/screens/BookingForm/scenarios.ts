import { IScenario as IScenarioBase } from './types'
import { ServicesStep } from './steps/ServicesStep'
import { CalendarStep } from './steps/CalendarStep'
import { CheckoutStep } from './steps/CheckoutStep'
import { PaymentStep } from './steps/PaymentStep'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { validateField } from '../../components/Form/validation'
import { IField } from '../../components/Form/types'
import { stripeMethods } from './PaymentHandler/payments/Stripe/StripeMethods'

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
            services: (value) =>
                !!value && value.length > 0 ? true : 'please_select_service',
        },
        isVisible: () => {
            const { attrService } = useBookingContext()

            return attrService === undefined || attrService === '0'
        },
    },
    {
        title: 'select_date_time_services',
        description: 'choose_preferred_appointment_slot',
        Screen: CalendarStep,
        validationRules: {
            places: (value) => {
                const { services } = useBookingContext()

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
