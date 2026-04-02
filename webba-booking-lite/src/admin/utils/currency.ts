import { __ } from '@wordpress/i18n'

export const formatPrice = (
    price: number,
    priceFormat: string = '$#price',
    priceSeparator: string = '.',
    priceFraction: number = 2
): string => {
    let validPrice =
        price !== undefined &&
        price !== null &&
        String(price) !== '' &&
        Number(price) !== 0
            ? price
            : 0

    let parts = String(validPrice).split(priceSeparator)

    let integerPart = parts[0]
    let decimalPart = ''

    if (priceFraction > 0) {
        decimalPart = priceSeparator + (parts[1] || '').padEnd(priceFraction, '0')
    }

    const formattedPrice = integerPart + decimalPart

    let result = priceFormat.replace('#price', formattedPrice)

    return result
}
