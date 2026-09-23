export type GiftCardDesignVariantId =
    | 'botanical_green'
    | 'spa_wellness'
    | 'gold_ribbon'
    | 'black_gold'

export interface GiftCardDesignVariant {
    id: GiftCardDesignVariantId
    label: string
    background: string
    width: number
    height: number
}

export interface GiftCardDesignValue {
    variant: GiftCardDesignVariantId
    html: string
}

export interface GiftCardPlaceholder {
    text: string
    content: string
}
