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
            </StripeWrapper>
        </div>
    )
}
