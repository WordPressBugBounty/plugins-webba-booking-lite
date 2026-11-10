import { __ } from '@wordpress/i18n'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { wbkFormatPrice } from '../../../providers/BookingFormProvider/utils'
import { isHidePriceEnabled } from '../../../lib/hidePrice/areAllSelectedPricesHidden'
import { minutesToText } from '../../../../admin/components/WebbaDataTable/utils'
import { useWording } from '../../../hooks/useWording'
import { useWebba5Booking } from './useWebba5Booking'
import { Webba5ServiceChoice } from './Webba5ServiceChoice'
import { Webba5Select } from './Webba5Select'
import { Webba5ActionButton } from './Webba5ActionButton'
import { StaffSelector } from '../../../components/StaffSelector/StaffSelector'
import { IWebba5BookableItem } from './types'

type BookingState = ReturnType<typeof useWebba5Booking>

const readPositivePrices = (value: unknown): number[] => {
    const numeric = Number(value)
    if (Number.isFinite(numeric) && numeric > 0) {
        return [numeric]
    }
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) {
            return []
        }
        try {
            return readPositivePrices(JSON.parse(trimmed))
        } catch {
            return []
        }
    }
    if (Array.isArray(value)) {
        return value.flatMap((item) => readPositivePrices(item))
    }
    if (value && typeof value === 'object') {
        return Object.values(value as Record<string, unknown>).flatMap((item) =>
            readPositivePrices(item)
        )
    }
    return []
}

const formatPriceLabel = (
    item: IWebba5BookableItem,
    priceFormat: string,
    freeLabel: string
) => {
    if (isHidePriceEnabled(item.hide_price)) {
        return ''
    }
    const prices = readPositivePrices(item.price)
    if (prices.length === 0) {
        return freeLabel
    }
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    if (minPrice !== maxPrice) {
        return `${wbkFormatPrice(minPrice, priceFormat)} - ${wbkFormatPrice(maxPrice, priceFormat)}`
    }
    return wbkFormatPrice(minPrice, priceFormat)
}

export const Webba5ServiceStep = ({ booking }: { booking: BookingState }) => {
    const { priceFormat, bookingMode } = useBookingContext()
    const wording = useWording()
    const freeLabel = wording.free || __('Free', 'webba-booking-lite')

    return (
        <div className="wbk_webba5_form__panel">
            <p className="wbk_webba5_form__kicker">
                {__("Let's get started", 'webba-booking-lite')}
            </p>
            <h2 className="wbk_webba5_form__heading">
                {bookingMode === 'units'
                    ? __('Choose your unit.', 'webba-booking-lite')
                    : __('Choose your service.', 'webba-booking-lite')}
            </h2>

            {(booking.showLocation || booking.showCategory) && (
                <div className="wbk_webba5_form__fields">
                    {booking.showLocation && (
                        <Webba5Select
                            label={
                                wording.location ||
                                __('Location', 'webba-booking-lite')
                            }
                            placeholder={
                                wording.select_location ||
                                __('Select location', 'webba-booking-lite')
                            }
                            options={booking.locations.map((location) => ({
                                id: String(location.id),
                                label: location.label,
                            }))}
                            value={booking.locationId}
                            onChange={(id) => booking.handleLocationChange(id)}
                        />
                    )}
                    {booking.showCategory && (
                        <Webba5Select
                            label={
                                wording.category ||
                                __('Category', 'webba-booking-lite')
                            }
                            placeholder={
                                wording.select_category ||
                                __('Select category', 'webba-booking-lite')
                            }
                            options={booking.categoryOptions}
                            value={booking.categoryId}
                            onChange={booking.handleCategoryChange}
                        />
                    )}
                </div>
            )}

            {(booking.showServiceList || booking.hasPresetService) && (
                <div className="wbk_webba5_form__cards">
                    {booking.visibleItems.map((item) => (
                        <Webba5ServiceChoice
                            key={item.id}
                            item={item}
                            bookingMode={bookingMode}
                            priceLabel={formatPriceLabel(
                                item,
                                priceFormat,
                                freeLabel
                            )}
                            durationLabel={
                                item.duration
                                    ? minutesToText(Number(item.duration), {
                                          h: wording.hour,
                                          min: wording.minute,
                                          d: wording.day || 'd',
                                      })
                                    : ''
                            }
                            onSelect={() =>
                                booking.handleServiceChange(String(item.id))
                            }
                        />
                    ))}
                    {booking.visibleItems.length === 0 && (
                        <p className="wbk_webba5_form__empty">
                            {wording.no_services_found ||
                                __('No services found!', 'webba-booking-lite')}
                        </p>
                    )}
                </div>
            )}

            {booking.showStaffDropdown && (
                <div className="wbk_webba5_form__staff">
                    <span className="wbk_webba5_form__field-label">
                        {__('Preferred team member', 'webba-booking-lite')}
                    </span>
                    <StaffSelector
                        staffOptions={booking.staffOptions}
                        selectedStaffId={booking.selectedStaffId}
                        onSelect={(staffId) => {
                            if (staffId != null) {
                                booking.handleStaffChange(String(staffId))
                            }
                        }}
                    />
                </div>
            )}

            <div className="wbk_webba5_form__actions">
                <Webba5ActionButton
                    label={
                        bookingMode === 'units'
                            ? __('Choose dates', 'webba-booking-lite')
                            : __('Choose a date', 'webba-booking-lite')
                    }
                    disabled={!booking.canContinueService}
                    onClick={() => booking.openStep('schedule')}
                />
            </div>
        </div>
    )
}
