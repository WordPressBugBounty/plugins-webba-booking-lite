import { ComponentType, ReactNode } from 'react'
import { IFormPlace, IPlace } from '../../components/Services/types'
import { TAllowedMethods } from '../../components/PaymentSelector/types'

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

export interface IFormData {
    services: number[]
    places: Record<number, IFormPlace[]>
    payment_method: TAllowedMethods
    [key: string]: unknown
    extra: Record<string, unknown>
    coupon: string
    attachments: File[]
    stripe_details?: IStripeDetails
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

export interface INavigationProps
    extends Omit<IUseScenario, 'stepInto' | keyof IScenario> {}
