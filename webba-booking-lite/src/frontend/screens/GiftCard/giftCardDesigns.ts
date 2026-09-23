import { __ } from '@wordpress/i18n'
import { GiftCardDesignOption, GiftCardDesignVariantId } from './types'

export const GIFT_CARD_DESIGN_OPTIONS: GiftCardDesignOption[] = [
    {
        id: 'botanical_green',
        label: __('Botanical Green', 'webba-booking-lite'),
        background: 'public/images/gift-card-1-background.webp',
        width: 1149,
        height: 1369,
    },
    {
        id: 'spa_wellness',
        label: __('Spa Wellness', 'webba-booking-lite'),
        background: 'public/images/gift-card-2-background.webp',
        width: 1536,
        height: 1024,
    },
    {
        id: 'gold_ribbon',
        label: __('Gold Ribbon', 'webba-booking-lite'),
        background: 'public/images/gift-card-3-background.webp',
        width: 1536,
        height: 1024,
    },
    {
        id: 'black_gold',
        label: __('Black Gold', 'webba-booking-lite'),
        background: 'public/images/gift-card-4-background.webp',
        width: 1536,
        height: 1024,
    },
]

export const DEFAULT_GIFT_CARD_DESIGN: GiftCardDesignVariantId =
    'botanical_green'
