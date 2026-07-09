import { __ } from '@wordpress/i18n'
import { SettingsSectionStepContent } from './SettingsSectionStepContent'

interface PaymentSettingsStepContentProps {
    guideUrl: string
    onSkip: () => void
}

export const PaymentSettingsStepContent = ({
    guideUrl,
    onSkip,
}: PaymentSettingsStepContentProps) => {
    return (
        <SettingsSectionStepContent
            sectionId="wbk_payment_settings_section"
            checklistStepId="payment_settings"
            guideUrl={guideUrl}
            emptyMessage={__(
                'Payment settings could not be loaded.',
                'webba-booking-lite'
            )}
            onSkip={onSkip}
        />
    )
}
