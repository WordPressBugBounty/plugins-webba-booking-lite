import { __, sprintf } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { processUpgradeMessage } from '../../../utilities/planHelper'
import { SkipStepButton } from './SkipStepButton'
import './SetupChecklistLockedStepContent.scss'

interface SetupChecklistLockedStepContentProps {
    requiredPlans: string[]
    guideUrl?: string
    skippable?: boolean
    isSkipping?: boolean
    onSkip?: () => void
}

export const SetupChecklistLockedStepContent = ({
    requiredPlans,
    guideUrl,
    skippable = false,
    isSkipping = false,
    onSkip,
}: SetupChecklistLockedStepContentProps) => {
    const { admin_url, plan_map, wording } = useSelect(
        (select: any) => select(store_name).getPreset(),
        []
    ) as {
        admin_url?: string
        plan_map?: Record<string, boolean>
        wording?: { plan_required_message?: string }
    }

    const upgradeMessage = processUpgradeMessage(
        requiredPlans,
        plan_map || {},
        String(
            wording?.plan_required_message ||
                __('Available in #plan', 'webba-booking-lite')
        )
    )

    return (
        <div className="wbk_setupChecklistLockedStep">
            <p className="wbk_setupChecklistLockedStep__message">
                {upgradeMessage}
            </p>
            <div className="wbk_setupChecklist__actionRow">
                <a
                    className="wbk_setupChecklist__primaryButton"
                    href={sprintf(
                        '%sadmin.php?page=wbk-main-pricing',
                        admin_url || ''
                    )}
                >
                    {__('View Plans', 'webba-booking-lite')}
                </a>
                {skippable && onSkip && (
                    <SkipStepButton onSkip={onSkip} disabled={isSkipping} />
                )}
                {guideUrl && (
                    <a
                        className="wbk_setupChecklist__secondaryLink"
                        href={guideUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {__('View Guide', 'webba-booking-lite')}
                    </a>
                )}
            </div>
        </div>
    )
}
