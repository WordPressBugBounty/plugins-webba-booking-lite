import type { ComponentType, ReactNode, RefObject } from 'react'
import { IFormPlace, IPlace } from '../../components/Services/types'
import { TAllowedMethods } from '../../components/PaymentSelector/types'
import type { StripeFieldName } from './PaymentHandler/payments/Stripe/types'

export type ValidationResult = true | string
export type ValidationRule = (value: any) => ValidationResult

export interface IScenario {
    title: string
    description?: ReactNode | string
    Screen: ComponentType<any>
    validationRules: {
        [key: string]: ValidationRule
    }
    isVisible?: () => boolean
}

export interface IUseScenario extends IScenario {
    totalSteps: number
    currentIndex: number
    canGoNext: boolean
    goBack: () => void
    goNext: () => void
    stepInto: (index: number) => void
    nextStepError?: string | null
}

export interface IScenarioState {
    currentStep: number
    steps: IScenario[]
}

export interface IUnitDateOffer {
    id: string
    start: Date
    end: Date
    days: number
    total: string | number
}

export interface IFormData {
    services: number[]
    units?: number[]
    booking_mode?: 'services' | 'units'
    unit_attendees?: Record<number, { adult: number; child: number; infant: number }>
    unit_quantity?: Record<number, number>
    places: Record<number, IFormPlace[]>
    payment_method: TAllowedMethods
    [key: string]: unknown
    extra: Record<string, unknown>
    coupon: string
    attachments: File[]
    stripe_details?: IStripeDetails
    generate_stripe_intent?: boolean
}

export interface IAmountItem {
    id: number
    price: number
    item_to_pay: number
    have_deposit: boolean
}

export interface IAmountData {
    total: number
    subtotal: number
    discount: number
    tax_to_pay: number
    items: IAmountItem[]
    service_fees: number
    left_to_pay: number
    order_total: number
    to_pay_total: number
    stripe_details: IStripeDetails
}

export interface IStripeDetails {
    client_secret: string
    error?: string
    intent_id: string
    billing_details?: {
        name: string
        email: string
        phone: string
        line1: string
        line2: string
        city: string
        state: string
        postal_code: string
        country: string
    }
}

export interface IPaymentStepStripeSectionProps {
    clientSecret: string
    selectedMethod: string
    onLoadingChange: (loading: boolean) => void
    stripeWrapperRef: RefObject<HTMLDivElement | null>
    formData: IFormData
    setFormData: (slug: string, value: unknown) => void
    stripeFields?: StripeFieldName[]
}

export interface INavigationProps
    extends Omit<IUseScenario, 'stepInto' | keyof IScenario> {}
