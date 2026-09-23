import { __ } from '@wordpress/i18n'
import { GiftCardPolicyAccordionProps } from './types'

export const GiftCardPolicyAccordion = ({
    html,
}: GiftCardPolicyAccordionProps) => {
    if (!html) {
        return null
    }

    return (
        <details className="wbk_gift_card__policy">
            <summary className="wbk_gift_card__policy-toggle">
                {__('Gift card policy', 'webba-booking-lite')}
            </summary>
            <div
                className="wbk_gift_card__policy-content"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </details>
    )
}
