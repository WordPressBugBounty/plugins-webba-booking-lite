import { HidePriceValue, IPricedSelectionItem } from './types'

export const isHidePriceEnabled = (hidePrice: HidePriceValue): boolean =>
    hidePrice === true || hidePrice === 'yes' || hidePrice === 1 || hidePrice === '1'

const getHidePriceValue = (item: unknown): HidePriceValue => {
    if (!item || typeof item !== 'object' || !('hide_price' in item)) {
        return undefined
    }

    return (item as IPricedSelectionItem).hide_price
}

export const areAllSelectedPricesHidden = (items: readonly unknown[]): boolean =>
    items.length > 0 && items.every((item) => isHidePriceEnabled(getHidePriceValue(item)))
