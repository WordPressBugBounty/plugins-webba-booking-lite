import { IFieldConfig } from '../../components/Form/types'
import { IPaymentMethod } from '../../components/PaymentSelector/types'
import { IGiftCardStripeDetails } from './GiftCardPaymentSection'
import { IGiftCardResult } from './GiftCardThankYou'

export type GiftCardPurchasePhase =
    | 'form'
    | 'redirect_payment'
    | 'success'
    | 'paypal_return'
    | 'cancelled'

export type GiftCardDesignVariantId =
    | 'botanical_green'
    | 'spa_wellness'
    | 'gold_ribbon'
    | 'black_gold'

export interface GiftCardDesignOption {
    id: GiftCardDesignVariantId
    label: string
    background: string
    width: number
    height: number
}

export interface GiftCardContentProps {
    fields: IFieldConfig[]
    sendOn: string
    setSendOn: (value: string) => void
    sendOnError: string | null
    setSendOnError: (value: string | null) => void
    sendOnTouched: boolean
    setSendOnTouched: (value: boolean) => void
    selectedMethod: string
    setSelectedMethod: (value: string) => void
    paymentMethods: IPaymentMethod[]
    formattedAmount: string | null
    amountValue: number
    buyerEmail: string
    isNarrowForm: boolean
    validateSendOn: (
        date: string,
        time: string,
        timezone: string
    ) => string | null
    sendTime: string
    setSendTime: (value: string) => void
    sendTimezone: string
    setSendTimezone: (value: string) => void
    stripeDetails: IGiftCardStripeDetails | null
    setStripeDetails: (details: IGiftCardStripeDetails | null) => void
    purchasePhase: GiftCardPurchasePhase
    setPurchasePhase: (phase: GiftCardPurchasePhase) => void
    purchaseResult: IGiftCardResult | null
    setPurchaseResult: (result: IGiftCardResult | null) => void
    paymentUrl: string
    setPaymentUrl: (url: string) => void
    purchaseError: string | null
    setPurchaseError: (error: string | null) => void
    purchasing: boolean
    setPurchasing: (value: boolean) => void
    paypalReturnPaymentId: string | null
}

export interface GiftCardSendTimeStepProps {
    sendOn: string
    setSendOn: (value: string) => void
    sendOnError: string | null
    setSendOnError: (value: string | null) => void
    sendOnTouched: boolean
    setSendOnTouched: (value: boolean) => void
    validateSendOn: (
        date: string,
        time: string,
        timezone: string
    ) => string | null
    sendTime: string
    setSendTime: (value: string) => void
    sendTimezone: string
    setSendTimezone: (value: string) => void
}

export interface GiftCardTimezoneSelectProps {
    value: string
    onChange: (value: string) => void
}

export interface GiftCardPolicyAccordionProps {
    html: string
}

export interface GiftCardCheckoutBarProps {
    formattedAmount: string | null
    recipientName: string
    sendTiming: string
    sendOnLabel: string
    canPurchase: boolean
    purchasing: boolean
    onPurchase: () => void
    policyHtml: string
    showPurchaseButton?: boolean
}
