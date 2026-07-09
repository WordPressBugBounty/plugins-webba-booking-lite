import { useRef } from 'react'
import { __ } from '@wordpress/i18n'
import { AssistanceScreen } from '../../screens/Assistance/AssistanceScreen'
import { trackAssistanceSkipped } from '../../screens/Assistance/assistanceAnalytics'
import type { AssistanceScreenHandle } from '../../screens/Assistance/types'
import arrowLeftIcon from '../../../../public/images/icon-arrow-left.svg'
import './SetupChecklist.scss'

interface SetupChecklistAssistancePanelProps {
    onBack: () => void
    onSetupComplete: () => void
}

export const SetupChecklistAssistancePanel = ({
    onBack,
    onSetupComplete,
}: SetupChecklistAssistancePanelProps) => {
    const assistanceRef = useRef<AssistanceScreenHandle>(null)

    const handleSetupComplete = () => {
        onSetupComplete()
        onBack()
    }

    return (
        <div className="wbk_setupChecklist__assistancePanel">
            <div className="wbk_setupChecklist__assistanceHeader">
                <button
                    type="button"
                    className="wbk_setupChecklist__assistanceBack"
                    onClick={() => {
                        trackAssistanceSkipped(
                            'checklist',
                            assistanceRef.current?.getSkipTrackingPayload()
                        )
                        onBack()
                    }}
                >
                    <img src={arrowLeftIcon} alt="" />
                    {__('Back to checklist', 'webba-booking-lite')}
                </button>
                <h2 className="wbk_setupChecklist__assistanceTitle">
                    {__('AI Assistance', 'webba-booking-lite')}
                </h2>
            </div>
            <div className="wbk_setupChecklist__assistanceBody">
                <AssistanceScreen
                    ref={assistanceRef}
                    variant="checklist"
                    onSetupComplete={handleSetupComplete}
                />
            </div>
        </div>
    )
}
