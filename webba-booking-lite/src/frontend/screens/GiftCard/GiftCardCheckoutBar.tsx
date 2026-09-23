import { __, sprintf } from '@wordpress/i18n'
import { Button } from '../../components/Button/Button'
import { ReactComponent as GoNextIcon } from '../../../../public/images/icon-go-next.svg'
import { GiftCardPolicyAccordion } from './GiftCardPolicyAccordion'
import { GiftCardCheckoutBarProps } from './types'

export const GiftCardCheckoutBar = ({
    formattedAmount,
    recipientName,
    sendTiming,
    sendOnLabel,
    canPurchase,
    purchasing,
    onPurchase,
    policyHtml,
    showPurchaseButton = true,
}: GiftCardCheckoutBarProps) => {
    const displayName =
        recipientName.trim() || __('the recipient', 'webba-booking-lite')
    const buttonLabel = formattedAmount
        ? sprintf(
            __('Buy %s gift card', 'webba-booking-lite'),
            formattedAmount
        )
        : __('Buy gift card', 'webba-booking-lite')
    const footerText =
        sendTiming === 'later' && sendOnLabel
            ? sprintf(
                __('The gift card will be emailed to %s on %s.', 'webba-booking-lite'),
                displayName,
                sendOnLabel
            )
            : sprintf(
                __(
                    'The gift card will be emailed to %s immediately after purchase.',
                    'webba-booking-lite'
                ),
                displayName
            )

    return (
        <>
            <div className="wbk_gift_card__checkout">
                {formattedAmount && (
                    <div className="wbk_gift_card__amount-summary">
                        {__('Total', 'webba-booking-lite')}{' '}
                        <strong>{formattedAmount}</strong>
                    </div>
                )}
                {showPurchaseButton && (
                    <div className="wbk_navigation__wrapper wbk_gift_card__checkout-bar">
                        <GiftCardPolicyAccordion html={policyHtml} />
                        <Button
                            onClick={onPurchase}
                            classes="wbk_navigation__button-next"
                            disabled={!canPurchase || purchasing}
                            showLoading={purchasing}
                            svgIcon={
                                GoNextIcon as React.FunctionComponent<
                                    React.SVGAttributes<SVGElement>
                                >
                            }
                            iconLocation="right"
                        >
                            {buttonLabel}
                        </Button>
                    </div>
                )}
            </div>
            <p className="wbk_gift_card__checkout-note">{footerText}</p>
        </>
    )
}
