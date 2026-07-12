export type BillingCycle = 'monthly' | 'yearly' | 'lifetime'

export interface PlanPrice {
    amount: string
    period: string
}

export interface PlanDefinition {
    id: 'starter' | 'pro_1' | 'pro_3'
    title: string
    subtitle: string
    prices: Record<BillingCycle, PlanPrice>
    featureHeading: string
    features: string[]
    buttonLabel: string
    isPopular?: boolean
    isFree?: boolean
}
