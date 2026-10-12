export interface GiftCardPublicStatus {
    code: string
    amount: number
    remaining: number
    amount_formatted: string
    remaining_formatted: string
    active: boolean
    expiration_label: string
}

export interface GiftCardStatusProps {
    giftCardToken: string
}
