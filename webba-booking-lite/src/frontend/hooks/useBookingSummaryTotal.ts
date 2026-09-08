import { useMemo } from 'react'
import { __ } from '@wordpress/i18n'
import { useBookingContext } from '../providers/BookingFormProvider/BookingFormProvider'
import { wbkFormatPrice } from '../providers/BookingFormProvider/utils'
import { areAllSelectedPricesHidden } from '../lib/hidePrice/areAllSelectedPricesHidden'
import { useWording } from './useWording'

export const useBookingSummaryTotal = () => {
    const { services, units, bookingMode, priceFormat, amountData, preset } =
        useBookingContext()
    const wording = useWording()

    const items = useMemo(
        () =>
            bookingMode === 'units'
                ? (units || []).filter((unit: any) => unit.selected)
                : services.filter((s: any) => s.selected),
        [services, units, bookingMode]
    )
    const sortedItems = useMemo(
        () =>
            items
                .slice()
                .sort(
                    (a: any, b: any) =>
                        (a.selectedAt || 0) - (b.selectedAt || 0)
                ),
        [items]
    )

    const localCalculatedTotal = useMemo(() => {
        let total = 0
        sortedItems.forEach((service: any) => {
            const matchedItems = Array.isArray(amountData?.items)
                ? amountData.items.filter((item: any) => item.id === service.id)
                : []
            if (matchedItems.length > 0) {
                total += matchedItems.reduce(
                    (sum: number, item: any) => sum + (item.price || 0),
                    0
                )
            } else {
                const numericPrice = Number(service.price)
                const itemQuantity = Math.max(1, Number(service.quantity) || 1)
                if (numericPrice > 0 && itemQuantity > 0) {
                    total += numericPrice * itemQuantity
                }
            }
        })
        return total
    }, [amountData, sortedItems])

    const apiTax = Number(amountData?.tax_to_pay)
    let displayTax = 0
    if (!isNaN(apiTax) && apiTax > 0) {
        displayTax = apiTax
    } else {
        const presetTax = Number(preset?.settings?.tax)
        if (!isNaN(presetTax) && presetTax > 0) {
            displayTax = (localCalculatedTotal * presetTax) / 100
        }
    }

    const hideAllPrices = areAllSelectedPricesHidden(sortedItems)

    const apiTotal = Number(amountData?.to_pay_total)
    const displayTotal =
        !isNaN(apiTotal) && apiTotal > 0
            ? apiTotal
            : localCalculatedTotal + displayTax

    let totalFormatted = ''
    if (sortedItems.length > 0 && !hideAllPrices) {
        totalFormatted =
            (displayTotal > 0 && wbkFormatPrice(displayTotal, priceFormat)) ||
            wording.free ||
            __('Free', 'webba-booking-lite')
    }

    const depositTotal = useMemo(() => {
        if (!Array.isArray(amountData?.items)) return 0
        return amountData.items.reduce(
            (sum, item) =>
                item.have_deposit && typeof item.item_to_pay === 'number'
                    ? sum + item.item_to_pay
                    : sum,
            0
        )
    }, [amountData?.items])

    const hasSummaryAmounts =
        !hideAllPrices &&
        (depositTotal > 0 ||
            Number(amountData?.service_fees) > 0 ||
            displayTax > 0 ||
            Number(amountData?.left_to_pay) > 0)

    return {
        sortedItems,
        totalFormatted,
        displayTotal,
        displayTax,
        localCalculatedTotal,
        depositTotal,
        hasSummaryAmounts,
        hideAllPrices,
        amountData,
        priceFormat,
        wording,
    }
}
