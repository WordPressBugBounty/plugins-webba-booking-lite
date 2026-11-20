import type { ComponentType } from 'react'
import { PackageSelectStep } from './steps/PackageSelectStep'
import { PackagePaymentStep } from './steps/PackagePaymentStep'

export type PackageScenario = {
    title: string
    description: string
    Screen: ComponentType
    validate: (ctx: {
        selectedProductId: number | null
        paymentMethod: string
        paymentMethods: { id: string }[]
    }) => true | string
    isVisible?: (ctx: {
        paymentMethods: { id: string }[]
    }) => boolean
}

export const packageScenarios: PackageScenario[] = [
    {
        title: 'select_services',
        description: 'choose_service_proceed',
        Screen: PackageSelectStep,
        validate: ({ selectedProductId }) =>
            selectedProductId
                ? true
                : 'please_select_service',
    },
    {
        title: 'payment_method',
        description: 'select_preferred_payment_method',
        Screen: PackagePaymentStep,
        validate: ({ paymentMethod, paymentMethods }) => {
            if (!paymentMethods.length) {
                return true
            }
            return paymentMethod
                ? true
                : 'please_select_payment_method'
        },
        // Always show payment for package purchase so the flow mirrors
        // classic Progressbar + Navigation (select → payment → submit).
        isVisible: ({ paymentMethods }) => paymentMethods.length > 0,
    },
]
