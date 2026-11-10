import { __ } from '@wordpress/i18n'
import { Stripe } from '../../PaymentHandler/payments/Stripe/Stripe'
import { StripeWrapper } from '../../PaymentHandler/payments/Stripe/StripeWrapper'
import { StripeBillingFields } from '../../PaymentHandler/payments/Stripe/StripeBillingFields'
import type { IPaymentStepStripeSectionProps } from '../../types'

export const PaymentStepStripeSection = ({
    clientSecret,
    selectedMethod,
    onLoadingChange,
    stripeWrapperRef,
    formData,
    setFormData,
    stripeFields,
    chargeAgreement,
}: IPaymentStepStripeSectionProps) => {
    return (
        <div
            className="wbk_step__stripe-wrapper"
            key={clientSecret}
            ref={stripeWrapperRef}
        >
            <StripeWrapper clientSecret={clientSecret}>
                <Stripe
                    selectedMethod={selectedMethod}
                    onLoadingChange={onLoadingChange}
                />
                {selectedMethod === 'stripe' &&
                    stripeFields &&
                    stripeFields.length > 0 && (
                        <StripeBillingFields
                            stripeFields={stripeFields}
                            formData={formData}
                            setFormData={setFormData}
                        />
                    )}
                {chargeAgreement?.enabled && (
                    <p
                        className="wbk_step__stripe-charge-agreement"
                        style={{
                            marginTop: '12px',
                            fontSize: '14px',
                            lineHeight: 1.45,
                            color: '#3c434a',
                        }}
                    >
                        {chargeAgreement.message ||
                            __(
                                'By confirming, you authorize us to save your card and charge the amount shown according to the stated timing. Your booking will not be marked as paid until the charge succeeds.',
                                'webba-booking-lite'
                            )}
                    </p>
                )}
            </StripeWrapper>
        </div>
    )
}
