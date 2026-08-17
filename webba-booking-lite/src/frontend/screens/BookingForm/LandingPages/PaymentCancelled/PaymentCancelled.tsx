import { __ } from '@wordpress/i18n'
import '../../ThankYou/ThankYou.scss'
import '../LandingPage.scss'
import iconCancel from '../../../../../../public/images/icon-cancel-red.svg'
import classNames from 'classnames'

const PaymentCancelledInner = () => {
    return (
        <div className={'wbk_thank_you__wrapper'}>
            <div className={'wbk_thank_you__native-scroll'}>
                <div className={'wbk_thank_you__inner-wrapper'}>
                    <div
                        className={classNames(
                            'wbk_thank_you__header',
                            'wbk_thank_you__header--visible'
                        )}
                    >
                        <div className={'wbk_cancel_icon_bg'}>
                            <img
                                src={iconCancel}
                                alt={__(
                                    'Payment cancelled',
                                    'webba-booking-lite'
                                )}
                            />
                        </div>
                        <div className={'wbk_thank_you__header__content'}>
                            <h3>
                                {__('Payment Cancelled', 'webba-booking-lite')}
                            </h3>
                            <p>
                                {__(
                                    'Your payment was cancelled. If this was a mistake, you can try again or contact support for assistance.',
                                    'webba-booking-lite'
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const PaymentCancelled = () => <PaymentCancelledInner />
