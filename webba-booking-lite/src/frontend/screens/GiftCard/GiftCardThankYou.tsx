import { __ } from '@wordpress/i18n'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { wbkFormatPrice } from '../../providers/BookingFormProvider/utils'
import { useWording } from '../../hooks/useWording'
import { ReactComponent as IconCheck } from '../../../../public/images/icon-check.svg'
import '../BookingForm/ThankYou/ThankYou.scss'

export interface IGiftCardResult {
    id?: number
    code?: string
    amount?: number
    payment_method?: string
    payment_id?: string
    buyer_email?: string
    buyer_name?: string
    recipient_name?: string
    recipient_email?: string
}

interface IGiftCardThankYouProps {
    giftCard: IGiftCardResult
    paymentMethod?: string
}

const formatGiftCardItemLabel = (
    wording: Record<string, string>,
    recipientName?: string
) => {
    if (recipientName) {
        return (
            wording?.gift_card_for ||
            __('Gift card for #recipient_name', 'webba-booking-lite')
        ).replace(/#recipient_name/g, recipientName)
    }

    return wording?.gift_card || __('Gift card', 'webba-booking-lite')
}

export const GiftCardThankYou = ({
    giftCard,
    paymentMethod,
}: IGiftCardThankYouProps) => {
    const wording = useWording()
    const { priceFormat } = useBookingContext()
    const amount = Number(giftCard?.amount || 0)

    return (
        <div className="wbk_thank_you__wrapper">
            <div className="wbk_thank_you__native-scroll">
                <div className="wbk_thank_you__inner-wrapper">
                    <div className="wbk_thank_you__header wbk_thank_you__header--visible">
                        <IconCheck
                            aria-label={
                                wording?.payment_successful ||
                                __(
                                    'Payment successful',
                                    'webba-booking-lite'
                                )
                            }
                        />
                        <div className="wbk_thank_you__header__content">
                            <h3>
                                {wording?.payment_successful ||
                                    __(
                                        'Payment successful',
                                        'webba-booking-lite'
                                    )}
                            </h3>
                            <p>
                                {wording?.gift_card_thank_you_message ||
                                    __(
                                        'Thank you for your gift card purchase. A confirmation email will be sent to you, and the recipient will receive their gift on the selected date.',
                                        'webba-booking-lite'
                                    )}
                            </p>
                        </div>
                    </div>

                    <div className="wbk_thank_you__panel-wrapper">
                        <h4>
                            {wording?.cost_breakdown ||
                                __('Cost Breakdown', 'webba-booking-lite')}
                        </h4>
                        <div className="wbk_thank_you__cart-items">
                            <div className="wbk_thank_you__cart-items__item">
                                <p>
                                    {formatGiftCardItemLabel(
                                        wording,
                                        giftCard?.recipient_name
                                    )}
                                </p>
                                <strong>
                                    {wbkFormatPrice(amount, priceFormat)}
                                </strong>
                            </div>
                            {giftCard?.code && (
                                <div className="wbk_thank_you__cart-items__item">
                                    <p>
                                        {wording?.gift_card_code ||
                                            __(
                                                'Gift card code',
                                                'webba-booking-lite'
                                            )}
                                    </p>
                                    <strong>{giftCard.code}</strong>
                                </div>
                            )}
                            <div className="wbk_thank_you__cart-items__item wbk_thank_you__cart-items__item--total">
                                <h4>
                                    {wording?.total_amount_paid ||
                                        __(
                                            'Total amount',
                                            'webba-booking-lite'
                                        )}
                                </h4>
                                <strong>
                                    {wbkFormatPrice(amount, priceFormat)}
                                </strong>
                            </div>
                            {paymentMethod && (
                                <div className="wbk_thank_you__cart-items__item">
                                    <p>
                                        {wording?.payment ||
                                            __(
                                                'Payment',
                                                'webba-booking-lite'
                                            )}
                                    </p>
                                    <strong>
                                        {paymentMethod.charAt(0).toUpperCase() +
                                            paymentMethod.slice(1)}
                                    </strong>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
