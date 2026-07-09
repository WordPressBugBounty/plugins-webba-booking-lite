import { __ } from '@wordpress/i18n'
import { SettingsSectionStepContent } from './SettingsSectionStepContent'

interface AdvancedBookingRulesStepContentProps {
    guideUrl: string
    onSkip: () => void
}

export const AdvancedBookingRulesStepContent = ({
    guideUrl,
    onSkip,
}: AdvancedBookingRulesStepContentProps) => {
    return (
        <SettingsSectionStepContent
            sectionId="wbk_advanced_booking_rules_section"
            checklistStepId="advanced_booking_rules"
            guideUrl={guideUrl}
            emptyMessage={__(
                'Advanced booking rules could not be loaded.',
                'webba-booking-lite'
            )}
            onSkip={onSkip}
        />
    )
}
