import { __ } from '@wordpress/i18n'
import { minutesToText } from '../../../../admin/components/WebbaDataTable/utils'
import { Webba5ActionButton } from './Webba5ActionButton'
import { Webba5BackButton } from './Webba5BackButton'
import { StaffSelector } from '../../../components/StaffSelector/StaffSelector'
import { useWording } from '../../../hooks/useWording'
import { WaterfallAvailabilityCalendar } from '../WaterfallForm/WaterfallAvailabilityCalendar'
import { WaterfallUnitAvailabilityCalendar } from '../WaterfallForm/WaterfallUnitAvailabilityCalendar'
import { IServiceProps, IUnitProps } from '../../../components/Services/types'
import { useWebba5Booking } from './useWebba5Booking'

type BookingState = ReturnType<typeof useWebba5Booking>

export const Webba5ScheduleStep = ({ booking }: { booking: BookingState }) => {
    const wording = useWording()
    const durationLabel = booking.selectedService?.duration
        ? minutesToText(Number(booking.selectedService.duration), {
              h: wording.hour,
              min: wording.minute,
              d: wording.day || 'd',
          })
        : ''
    const summary = [booking.selectedItem?.label, durationLabel]
        .filter(Boolean)
        .join(' · ')
    const minQuantity = Math.max(1, Number(booking.selectedService?.min_quantity) || 1)
    const maxQuantity = Math.max(
        minQuantity,
        Number(booking.selectedService?.max_quantity) || 1
    )
    const quantity = Math.min(
        maxQuantity,
        Math.max(minQuantity, Number(booking.selectedService?.quantity) || minQuantity)
    )

    return (
        <div className="wbk_webba5_form__panel">
            <p className="wbk_webba5_form__kicker">
                {__('Make it fit your day', 'webba-booking-lite')}
            </p>
            <h2 className="wbk_webba5_form__heading">
                {booking.bookingMode === 'units'
                    ? __('Pick your dates.', 'webba-booking-lite')
                    : __('Pick a date & time.', 'webba-booking-lite')}
            </h2>
            {summary && <p className="wbk_webba5_form__selection">{summary}</p>}

            {booking.skipServiceStep &&
                booking.showStaffDropdown &&
                booking.selectedService && (
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

            {booking.skipServiceStep &&
                booking.selectedService &&
                maxQuantity > minQuantity && (
                    <label className="wbk_webba5_form__quantity wbk_webba5_form__quantity--schedule">
                        <span>{__('Quantity', 'webba-booking-lite')}</span>
                        <select
                            value={quantity}
                            onChange={(event) =>
                                booking.selectedService?.onUpdate({
                                    quantity: Number(event.target.value),
                                })
                            }
                        >
                            {Array.from(
                                { length: maxQuantity - minQuantity + 1 },
                                (_, index) => minQuantity + index
                            ).map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </label>
                )}

            {booking.bookingMode === 'services' && booking.selectedService && (
                <WaterfallAvailabilityCalendar
                    service={booking.selectedService as IServiceProps}
                    locationId={booking.locationId}
                    staffId={booking.staffIdForCalendar}
                    weekStart={booking.preset?.settings?.week_start}
                    selectFirstAvailableDate
                />
            )}
            {booking.bookingMode === 'units' && booking.selectedUnit && (
                <WaterfallUnitAvailabilityCalendar
                    unit={booking.selectedUnit as IUnitProps}
                    locationId={booking.locationId}
                    weekStart={booking.preset?.settings?.week_start}
                />
            )}

            <div className="wbk_webba5_form__actions">
                {!booking.skipServiceStep && (
                    <Webba5BackButton
                        label={wording.back || __('Back', 'webba-booking-lite')}
                        onClick={() => booking.openStep('service')}
                    />
                )}
                <Webba5ActionButton
                    label={__('Your details', 'webba-booking-lite')}
                    disabled={!booking.canContinueSchedule}
                    tooltip={
                        !booking.canContinueSchedule && booking.scheduleError
                            ? booking.scheduleError
                            : undefined
                    }
                    onClick={() => booking.openStep('details')}
                />
            </div>
        </div>
    )
}
