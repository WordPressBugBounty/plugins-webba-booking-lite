import { useMemo } from 'react'
import { __ } from '@wordpress/i18n'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { Webba5ActionButton } from './Webba5ActionButton'
import { Webba5BackButton } from './Webba5BackButton'
import { wbkFormat } from '../../../../admin/components/Form/utils/dateTime'
import { useLocale } from '../../../hooks/useLocale'
import { getDateFnsLocale } from '../../../../utilities/timezones'
import { useWording } from '../../../hooks/useWording'
import { useBookingSummaryTotal } from '../../../hooks/useBookingSummaryTotal'
import { getSelectedStaffLabel } from '../../../components/StaffSelector/utils'
import { IStaffOption } from '../../../components/StaffSelector/types'
import { PaymentStep } from '../steps/PaymentStep'
import { useWebba5Booking } from './useWebba5Booking'

type BookingState = ReturnType<typeof useWebba5Booking>

export const Webba5ReviewStep = ({ booking }: { booking: BookingState }) => {
    const wording = useWording()
    const { formData, timeFormat, userTimezone, preset, loading } =
        useBookingContext()
    const { locale } = useLocale()
    const dateFnsLocale = useMemo(
        () => getDateFnsLocale(locale),
        [locale]
    )
    const { totalFormatted, hideAllPrices } = useBookingSummaryTotal()
    const places = booking.selectedService?.places || []
    const dateLabel = places
        .map((place) =>
            wbkFormat(place.timeslot, 'M j, Y', userTimezone, {
                locale: dateFnsLocale,
            })
        )
        .filter((value, index, list) => list.indexOf(value) === index)
        .join(', ')
    const timeLabel = places
        .map((place) =>
            wbkFormat(place.timeslot, timeFormat, userTimezone, {
                locale: dateFnsLocale,
            })
        )
        .join(' · ')
    const range = (
        formData as { range?: { start?: string; end?: string } }
    )?.range
    const stayLabel =
        booking.bookingMode === 'units' && range?.start && range?.end
            ? `${range.start} – ${range.end}`
            : ''
    const formStaff =
        typeof formData?.staff === 'object' && formData.staff !== null
            ? (formData.staff as Record<string, string | null>)
            : undefined
    const staffLabel = booking.selectedService
        ? getSelectedStaffLabel({
              staffMembers: preset?.staff_members as IStaffOption[] | undefined,
              serviceId: booking.selectedService.id,
              places: booking.selectedService.places,
              staffId: booking.selectedStaffId,
              formStaff,
              anyAvailableLabel:
                  wording.any_available ||
                  __('Any available', 'webba-booking-lite'),
          })
        : null

    const rows = [
        {
            label:
                booking.bookingMode === 'units'
                    ? wording.unit || __('Unit', 'webba-booking-lite')
                    : wording.service || __('Service', 'webba-booking-lite'),
            value: booking.selectedItem?.label || '',
        },
        {
            label: __('Date', 'webba-booking-lite'),
            value: booking.bookingMode === 'units' ? stayLabel : dateLabel,
        },
        booking.bookingMode === 'services'
            ? {
                  label: __('Time', 'webba-booking-lite'),
                  value: timeLabel,
              }
            : null,
        staffLabel
            ? {
                  label:
                      wording.staff_member ||
                      __('Team member', 'webba-booking-lite'),
                  value: staffLabel,
              }
            : null,
        !hideAllPrices && totalFormatted
            ? {
                  label: wording.total || __('Booking total', 'webba-booking-lite'),
                  value: totalFormatted,
              }
            : null,
    ].filter((row): row is { label: string; value: string } => !!row?.value)

    return (
        <div className="wbk_webba5_form__panel">
            <p className="wbk_webba5_form__kicker">
                {__('Review & Payment', 'webba-booking-lite')}
            </p>
            <h2 className="wbk_webba5_form__heading">
                {__("Here's your booking.", 'webba-booking-lite')}
            </h2>

            <dl className="wbk_webba5_form__summary">
                {rows.map((row) => (
                    <div key={row.label} className="wbk_webba5_form__summary-row">
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                    </div>
                ))}
            </dl>

            {!hideAllPrices && totalFormatted && (
                <div className="wbk_webba5_form__total">
                    <span>
                        {wording.total || __('Total', 'webba-booking-lite')}
                    </span>
                    <strong>{totalFormatted}</strong>
                </div>
            )}

            {booking.showPaymentStep && !loading?.bookingFields && (
                <div className="wbk_webba5_form__section">
                    <PaymentStep />
                </div>
            )}

            <div className="wbk_webba5_form__actions">
                <Webba5BackButton
                    label={wording.back || __('Back', 'webba-booking-lite')}
                    onClick={() => booking.openStep('details')}
                />
                <Webba5ActionButton
                    label={wording.book || __('Confirm booking', 'webba-booking-lite')}
                    disabled={!booking.canSubmit}
                    loading={booking.isSubmitting}
                    tooltip={
                        !booking.canSubmit && booking.submitError
                            ? booking.submitError
                            : undefined
                    }
                    onClick={() => {
                        void booking.handleSubmit()
                    }}
                />
            </div>
        </div>
    )
}
