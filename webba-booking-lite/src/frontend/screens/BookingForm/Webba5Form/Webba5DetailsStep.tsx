import { __ } from '@wordpress/i18n'
import { useWording } from '../../../hooks/useWording'
import { ExtrasStep } from '../steps/ExtrasStep'
import { WaterfallCheckoutFields } from '../WaterfallForm/WaterfallCheckoutFields'
import { Webba5ActionButton } from './Webba5ActionButton'
import { Webba5BackButton } from './Webba5BackButton'
import { useWebba5Booking } from './useWebba5Booking'

type BookingState = ReturnType<typeof useWebba5Booking>

export const Webba5DetailsStep = ({ booking }: { booking: BookingState }) => {
    const wording = useWording()

    return (
        <div className="wbk_webba5_form__panel">
            <p className="wbk_webba5_form__kicker">
                {__('Almost there', 'webba-booking-lite')}
            </p>
            <h2 className="wbk_webba5_form__heading">
                {__('Your details.', 'webba-booking-lite')}
            </h2>

            {booking.hasExtras && (
                <div className="wbk_webba5_form__section">
                    <ExtrasStep />
                </div>
            )}

            <div className="wbk_webba5_form__section">
                <WaterfallCheckoutFields />
            </div>

            <div className="wbk_webba5_form__actions">
                <Webba5BackButton
                    label={wording.back || __('Back', 'webba-booking-lite')}
                    onClick={() => booking.openStep('schedule')}
                />
                <Webba5ActionButton
                    label={__('Review & Payment', 'webba-booking-lite')}
                    disabled={!booking.canContinueDetails}
                    tooltip={
                        !booking.canContinueDetails && booking.detailsError
                            ? booking.detailsError
                            : undefined
                    }
                    onClick={() => booking.openStep('review')}
                />
            </div>
        </div>
    )
}
