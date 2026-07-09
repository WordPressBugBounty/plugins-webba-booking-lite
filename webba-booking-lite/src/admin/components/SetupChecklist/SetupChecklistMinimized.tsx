import { __, sprintf } from '@wordpress/i18n'
import type { SetupChecklistState } from './types'
import checkIcon from '../../../../public/images/icon-check-nobg.svg'
import accordionArrowIcon from '../../../../public/images/icon-accordion-arrow.svg'
import './SetupChecklist.scss'

interface SetupChecklistMinimizedProps {
    state: SetupChecklistState
    isPopupVisible: boolean
    onExpand: () => void
    onTogglePopup: () => void
    onDismiss: () => void
}

export const SetupChecklistMinimized = ({
    state,
    isPopupVisible,
    onExpand,
    onTogglePopup,
    onDismiss,
}: SetupChecklistMinimizedProps) => {
    const remainingCount = state.total_count - state.completed_count

    return (
        <div className="wbk_setupChecklist__minimizedWrapper">
            {isPopupVisible && (
            <button
                type="button"
                className="wbk_setupChecklist__minimizedCard"
                onClick={onExpand}
                aria-label={__('Open setup checklist', 'webba-booking-lite')}
            >
                <div className="wbk_setupChecklist__minimizedHeader">
                    <span className="wbk_setupChecklist__minimizedTitle">
                        {__('Getting Started with Webba Booking', 'webba-booking-lite')}
                    </span>
                    <span className="wbk_setupChecklist__minimizedPercent">
                        {sprintf(__('%d%%', 'webba-booking-lite'), state.progress_percent)}
                    </span>
                </div>
                <div
                    className="wbk_setupChecklist__minimizedProgressTrack"
                    style={
                        {
                            '--wbk-checklist-progress': `${state.progress_percent}%`,
                        } as React.CSSProperties
                    }
                >
                    <div className="wbk_setupChecklist__minimizedProgressFill" />
                </div>
                <ul className="wbk_setupChecklist__minimizedList">
                    {state.steps.map((step) => (
                        <li
                            key={step.id}
                            className={`wbk_setupChecklist__minimizedItem ${
                                step.status === 'completed'
                                    ? 'wbk_setupChecklist__minimizedItem--completed'
                                    : ''
                            }`}
                        >
                            {step.status === 'completed' ? (
                                <img
                                    className="wbk_setupChecklist__minimizedCheck"
                                    src={checkIcon}
                                    alt=""
                                />
                            ) : (
                                <span className="wbk_setupChecklist__minimizedCircle" />
                            )}
                            <span>{step.title}</span>
                        </li>
                    ))}
                </ul>
                <button
                    type="button"
                    className="wbk_setupChecklist__minimizedDismiss"
                    onClick={(event) => {
                        event.stopPropagation()
                        onDismiss()
                    }}
                >
                    {__('Dismiss Checklist', 'webba-booking-lite')}
                </button>
            </button>
            )}
            <div className="wbk_setupChecklist__minimizedFab">
                {remainingCount > 0 && (
                    <span className="wbk_setupChecklist__minimizedFabCount">
                        {remainingCount}
                    </span>
                )}
                <button
                    type="button"
                    className={`wbk_setupChecklist__minimizedFabButton ${
                        isPopupVisible
                            ? 'wbk_setupChecklist__minimizedFabButton--open'
                            : ''
                    }`}
                    onClick={onTogglePopup}
                    aria-label={
                        isPopupVisible
                            ? __('Hide setup checklist', 'webba-booking-lite')
                            : __('Show setup checklist', 'webba-booking-lite')
                    }
                    aria-expanded={isPopupVisible}
                >
                    <img src={accordionArrowIcon} alt="" />
                </button>
            </div>
        </div>
    )
}
