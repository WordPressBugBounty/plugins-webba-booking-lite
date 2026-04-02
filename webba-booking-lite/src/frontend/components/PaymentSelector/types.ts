export type TAllowedMethods =
    | 'arrival'
    | 'bank'
    | 'paypal'
    | 'stripe'
    | 'stripe_others'
    | 'google_pay'
    | 'apple_pay'
    | 'woocommerce'

export interface IPaymentMethod {
    name: TAllowedMethods
    id: string
    icon: string
    isPro: boolean
}
export interface IPaymentSelectorProps {
    methods: IPaymentMethod[]
    selectedMethod: string
    setSelectedMethod: (id: string) => void
    paymentElementLoading?: boolean
}
