import { useMemo, useState } from 'react'
import { __ } from '@wordpress/i18n'
import { Button } from '../../components/Button/Button'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { wbkFormatPrice } from '../../providers/BookingFormProvider/utils'
import { useWording } from '../../hooks/useWording'
import type { IPaymentMethod } from '../../components/PaymentSelector/types'
import '../BookingForm/ThankYou/ThankYou.scss'
import '../BookingForm/LandingPages/LandingPage.scss'

interface IGiftCardPaymentHandlerProps {
    paymentMethod: string
    paymentUrl: string
    amount: number
    paymentMethods: IPaymentMethod[]
    recipientName?: string
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

/**
 * Intermediate screen after initiating PayPal / Mollie / WooCommerce —
 * mirrors booking PaymentHandler before redirect.
 */
export const GiftCardPaymentHandler = ({
    paymentMethod,
    paymentUrl,
    amount,
    paymentMethods,
    recipientName,
}: IGiftCardPaymentHandlerProps) => {
    const wording = useWording()
    const { priceFormat } = useBookingContext()
    const [buttonLoading, setButtonLoading] = useState(false)

    const paymentMethodObj = useMemo(
        () =>
            paymentMethods.find(
                (pm) => pm.id === paymentMethod || pm.name === paymentMethod
            ),
        [paymentMethods, paymentMethod]
    )
    const paymentIcon = paymentMethodObj?.icon || ''
    const paymentTitle = paymentMethodObj
        ? (wording?.pay_with || __('Pay with', 'webba-booking-lite')) +
          ' ' +
          (paymentMethodObj.name.charAt(0).toUpperCase() +
              paymentMethodObj.name.slice(1))
        : wording?.payment || __('Payment', 'webba-booking-lite')

    const handlePay = () => {
        if (!paymentUrl) {
            return
        }
        setButtonLoading(true)
        if (paymentMethod === 'woocommerce' || paymentMethod === 'mollie') {
            window.location.href = paymentUrl
            return
        }
        window.open(paymentUrl, '_blank')
        setButtonLoading(false)
    }

    // WooCommerce: auto-redirect like booking PaymentHandler
    if (paymentMethod === 'woocommerce' && paymentUrl) {
        window.location.href = paymentUrl
        return null
    }

    return (
        <div className="wbk_thank_you__wrapper">
            <div className="wbk_thank_you__native-scroll">
                <div className="wbk_thank_you__inner-wrapper">
                    <div className="wbk_thank_you__header">
                        {paymentIcon && (
                            <img
                                src={paymentIcon}
                                alt={paymentMethod}
                                style={{ width: 56, height: 56 }}
                            />
                        )}
                        <div className="wbk_thank_you__header__content">
                            <h3>{paymentTitle}</h3>
                            <p>
                                {wording?.please_complete_payment_confirm_gift_card ||
                                    __(
                                        'Please complete your payment to confirm your gift card purchase.',
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
                                        recipientName
                                    )}
                                </p>
                                <strong>
                                    {wbkFormatPrice(amount, priceFormat)}
                                </strong>
                            </div>
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
                        </div>
                    </div>

                    <div className="wbk_landing_page__action-button-container">
                        <Button
                            type="primary"
                            title={
                                wording?.pay ||
                                __('Pay', 'webba-booking-lite')
                            }
                            showLoading={buttonLoading}
                            onClick={handlePay}
                            disabled={buttonLoading || !paymentUrl}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
