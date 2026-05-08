import type { Stripe, StripeElements } from '@stripe/stripe-js'
import { TAllowedMethods } from '../../../../../components/PaymentSelector/types'

export interface IStripeProps {
    selectedMethod: TAllowedMethods
    onLoadingChange?: (loading: boolean) => void
}

export interface IStripeObj {
    stripe: Stripe
    elements: StripeElements
    isValidated: boolean
}

export interface IStripeWrapperProps {
    children: React.ReactNode
    clientSecret: string
}

export type StripeFieldName =
    | 'name'
    | 'city'
    | 'country'
    | 'line1'
    | 'line2'
    | 'postal_code'
    | 'state'

export interface IStripeBillingFieldsProps {
    stripeFields?: StripeFieldName[]
    formData?: any
    setFormData?: (slug: string, value: any) => void
}
