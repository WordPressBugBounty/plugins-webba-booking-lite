import GiftCardsModel from '../../../schemas/gift_cards.json'

import { removePrefixesFromModelFields } from '../../components/WebbaDataTable/utils'

const giftCardProperties = Object.fromEntries(
    Object.entries(GiftCardsModel.properties).filter(
        ([key]) =>
            key !== 'gift_card_partial_redemption' &&
            key !== 'gift_card_history'
    )
)

export const giftCardsModel = removePrefixesFromModelFields(
    {
        ...GiftCardsModel,
        properties: giftCardProperties,
    },
    'gift_card_'
)
