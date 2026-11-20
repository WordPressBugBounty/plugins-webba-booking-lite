import { __ } from '@wordpress/i18n'
import { ReactComponent as IconCheck } from '../../../../public/images/icon-check.svg'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { wbkFormatPrice } from '../../providers/BookingFormProvider/utils'
import { useWording } from '../../hooks/useWording'
import { usePackagePurchase } from './PackagePurchaseContext'
import '../BookingForm/ThankYou/ThankYou.scss'

export const PackageThankYou = () => {
    const wording = useWording()
    const { priceFormat } = useBookingContext()
    const {
        selectedProduct,
        purchaseResult,
        paymentMethod,
        paymentMethods,
    } = usePackagePurchase()

    const packageName =
        purchaseResult?.name || selectedProduct?.name || ''
    const visitCount =
        purchaseResult?.total_credits ??
        purchaseResult?.remaining_credits ??
        selectedProduct?.visit_count
    const amount = Number(
        purchaseResult?.amount_paid ?? selectedProduct?.price ?? 0
    )
    const itemLabel = visitCount
        ? `${packageName} (${visitCount} ${__(
              'visits',
              'webba-booking-lite'
          )})`
        : packageName
    const paymentMethodLabel =
        paymentMethods.find((method) => method.id === paymentMethod)?.name ||
        paymentMethod

    return (
        <div className="wbk_thank_you__wrapper">
            <div className="wbk_thank_you__native-scroll">
                <div className="wbk_thank_you__inner-wrapper">
                    <div className="wbk_thank_you__header">
                        <IconCheck />
                        <div className="wbk_thank_you__header__content">
                            <h1>
                                {wording?.appointment_confirmed ||
                                    __(
                                        'Thank you for your booking!',
                                        'webba-booking-lite'
                                    )}
                            </h1>
                            <p>
                                {wording?.look_forward_seeing_you ||
                                    __(
                                        'We look forward to seeing you.',
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
                                <p>{itemLabel}</p>
                                <strong>
                                    {amount > 0
                                        ? wbkFormatPrice(amount, priceFormat)
                                        : wording?.free ||
                                          __(
                                              'Free',
                                              'webba-booking-lite'
                                          )}
                                </strong>
                            </div>
                            <div className="wbk_thank_you__cart-items__item wbk_thank_you__cart-items__item--total">
                                <h4>
                                    {wording?.total_amount_paid ||
                                        __(
                                            'Paying now',
                                            'webba-booking-lite'
                                        )}
                                </h4>
                                <div className="wbk_thank_you__cart-items__total-right">
                                    <strong>
                                        {wbkFormatPrice(amount, priceFormat)}
                                    </strong>
                                </div>
                            </div>
                            {paymentMethodLabel && (
                                <div className="wbk_thank_you__cart-items__item">
                                    <p>
                                        {wording?.payment ||
                                            __(
                                                'Payment',
                                                'webba-booking-lite'
                                            )}
                                    </p>
                                    <strong>{paymentMethodLabel}</strong>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
