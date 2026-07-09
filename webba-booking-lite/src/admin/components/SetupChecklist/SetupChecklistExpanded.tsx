import { useLayoutEffect, useRef, useState } from 'react'
import { __, sprintf } from '@wordpress/i18n'
import { useDispatch, useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { SetupChecklistStepItem } from './SetupChecklistStepItem'
import { SetupChecklistAssistancePanel } from './SetupChecklistAssistancePanel'
import type { SetupChecklistState } from './types'
import closeIcon from '../../../../public/images/icon-close.svg'
import helpDocumentationIcon from '../../../../public/images/icon-help-documentation.svg'
import helpEmailIcon from '../../../../public/images/icon-email.svg'
import lockedIcon from '../../../../public/images/icon-pro-locked.svg'
import './SetupChecklist.scss'

interface SetupChecklistExpandedProps {
    state: SetupChecklistState
    pluginUrl: string
    isReviewMode: boolean
    reviewActiveStepId: string | null
    onReviewStepChange: (stepId: string) => void
    onClose: () => void
    onDismiss: () => void
    onSkipStep: (stepId: string) => Promise<void>
}

export const SetupChecklistExpanded = ({
    state,
    pluginUrl,
    isReviewMode,
    reviewActiveStepId,
    onReviewStepChange,
    onClose,
    onDismiss,
    onSkipStep,
}: SetupChecklistExpandedProps) => {
    const [showAssistance, setShowAssistance] = useState(false)
    const logoSrc = pluginUrl ? `${pluginUrl}/public/images/webba-icon.svg` : ''
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const previousActiveStepRef = useRef<string | null>(null)

    const { fetchSetupChecklist } = useDispatch(store_name) as {
        fetchSetupChecklist: () => Promise<SetupChecklistState>
    }

    const { plan_map, assistance_available } = useSelect(
        (select: any) => select(store_name).getPreset(),
        []
    ) as {
        plan_map?: Record<string, boolean>
        assistance_available?: boolean
    }

    const showUpgradeCard =
        plan_map?.pro !== true && plan_map?.premium !== true
    const showAssistanceCard = assistance_available === true
    const scrollTargetStepId = isReviewMode
        ? reviewActiveStepId
        : state.active_step

    useLayoutEffect(() => {
        if (!scrollTargetStepId) {
            return
        }

        const stepChanged = previousActiveStepRef.current !== scrollTargetStepId
        previousActiveStepRef.current = scrollTargetStepId

        if (!stepChanged) {
            return
        }

        const scrollContainer = scrollContainerRef.current
        if (!scrollContainer) {
            return
        }

        const stepElement = scrollContainer.querySelector(
            `[data-checklist-step="${scrollTargetStepId}"]`
        ) as HTMLElement | null

        if (!stepElement) {
            return
        }

        const frame = requestAnimationFrame(() => {
            const containerRect = scrollContainer.getBoundingClientRect()
            const stepRect = stepElement.getBoundingClientRect()
            const targetTop =
                stepRect.top - containerRect.top + scrollContainer.scrollTop - 16

            scrollContainer.scrollTo({
                top: Math.max(targetTop, 0),
                behavior: 'smooth',
            })
        })

        return () => cancelAnimationFrame(frame)
    }, [scrollTargetStepId])

    return (
        <div className="wbk_setupChecklist__expanded">
            <header className="wbk_setupChecklist__expandedHeader">
                <div className="wbk_setupChecklist__expandedHeaderLeft">
                    {logoSrc && (
                        <img
                            className="wbk_setupChecklist__expandedLogo"
                            src={logoSrc}
                            alt=""
                        />
                    )}
                    <div>
                        <h1 className="wbk_setupChecklist__expandedTitle">
                            {__('Setup Checklist', 'webba-booking-lite')}
                        </h1>
                        <p className="wbk_setupChecklist__expandedSubtitle">
                            {isReviewMode
                                ? __(
                                      'Review each setup step and revisit the related settings at any time.',
                                      'webba-booking-lite'
                                  )
                                : __(
                                      'Complete these steps to fully configure your booking system.',
                                      'webba-booking-lite'
                                  )}
                        </p>
                    </div>
                </div>
                <div className="wbk_setupChecklist__expandedHeaderActions">
                    <button
                        type="button"
                        className="wbk_setupChecklist__minimizeButton"
                        onClick={onClose}
                    >
                        {__('Minimize', 'webba-booking-lite')}
                    </button>
                </div>
            </header>

            <div
                ref={scrollContainerRef}
                className={`wbk_setupChecklist__expandedBody${
                    showAssistance
                        ? ' wbk_setupChecklist__expandedBody--assistance'
                        : ''
                }`}
            >
                {showAssistance ? (
                    <SetupChecklistAssistancePanel
                        onBack={() => setShowAssistance(false)}
                        onSetupComplete={() => {
                            fetchSetupChecklist()
                        }}
                    />
                ) : (
                    <>
                <div className="wbk_setupChecklist__mainColumn">
                    <div className="wbk_setupChecklist__progressSummary">
                        <span>
                            {sprintf(
                                __('%1$d of %2$d steps completed', 'webba-booking-lite'),
                                state.completed_count,
                                state.total_count
                            )}
                        </span>
                        <span>{state.progress_percent}%</span>
                    </div>
                    <div
                        className="wbk_setupChecklist__progressTrack"
                        style={
                            {
                                '--wbk-checklist-progress': `${state.progress_percent}%`,
                            } as React.CSSProperties
                        }
                    >
                        <div className="wbk_setupChecklist__progressFill" />
                    </div>

                    <div className="wbk_setupChecklist__steps">
                        {state.steps.map((step) => (
                            <SetupChecklistStepItem
                                key={step.id}
                                step={step}
                                shortcode={state.shortcode}
                                emailTemplates={state.email_templates || []}
                                isExpanded
                                isReviewMode={isReviewMode}
                                reviewActiveStepId={reviewActiveStepId}
                                onReviewStepChange={onReviewStepChange}
                                onSkipStep={onSkipStep}
                            />
                        ))}
                    </div>

                    <p className="wbk_setupChecklist__savedNote">
                        {__(
                            'Your progress is saved automatically.',
                            'webba-booking-lite'
                        )}
                    </p>
                </div>

                <aside className="wbk_setupChecklist__sidebar">
                    {/* TODO: add video when it's ready */}
                    {/* <div className="wbk_setupChecklist__sidebarSection">
                        <h2 className="wbk_setupChecklist__sidebarTitle">
                            {__('Setup Video', 'webba-booking-lite')}
                        </h2>
                        <a
                            className="wbk_setupChecklist__videoCard"
                            href={state.resources.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="wbk_setupChecklist__videoPlay" />
                        </a>
                        <p className="wbk_setupChecklist__videoCaption">
                            {__(
                                'Watch our quick walkthrough to set up Webba Booking from scratch in under 6 minutes.',
                                'webba-booking-lite'
                            )}
                        </p>
                    </div> */}

                    <div className="wbk_setupChecklist__sidebarSection">
                        <h2 className="wbk_setupChecklist__sidebarTitle">
                            {__('Resources', 'webba-booking-lite')}
                        </h2>
                        <a
                            className="wbk_setupChecklist__resourceLink"
                            href={state.resources.documentation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img src={helpDocumentationIcon} alt="" />
                            <span>
                                <strong>
                                    {__('Documentation', 'webba-booking-lite')}
                                </strong>
                                <small>
                                    {__(
                                        'Guides, references & API docs',
                                        'webba-booking-lite'
                                    )}
                                </small>
                            </span>
                        </a>
                        <a
                            className="wbk_setupChecklist__resourceLink"
                            href={state.resources.support_url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img src={helpEmailIcon} alt="" />
                            <span>
                                <strong>{__('Support', 'webba-booking-lite')}</strong>
                                <small>
                                    {__(
                                        'Our support team replies within 24h.',
                                        'webba-booking-lite'
                                    )}
                                </small>
                            </span>
                        </a>
                    </div>

                    {showAssistanceCard && (
                        <div className="wbk_setupChecklist__sidebarSection">
                            <h2 className="wbk_setupChecklist__sidebarTitle">
                                {__('AI Assistance', 'webba-booking-lite')}
                            </h2>
                            <div className="wbk_setupChecklist__assistanceCard">
                                {logoSrc && <img src={logoSrc} alt="" />}
                                <span>
                                    <strong>
                                        {__(
                                            'Need help setting up?',
                                            'webba-booking-lite'
                                        )}
                                    </strong>
                                    <small>
                                        {__(
                                            'Describe your business and let AI configure your booking setup.',
                                            'webba-booking-lite'
                                        )}
                                    </small>
                                </span>
                            </div>
                            <button
                                type="button"
                                className="wbk_setupChecklist__assistanceAction"
                                onClick={() => setShowAssistance(true)}
                            >
                                {__('Start AI Assistant', 'webba-booking-lite')}
                            </button>
                        </div>
                    )}

                    {showUpgradeCard && (
                    <a
                        className="wbk_setupChecklist__upgradeCard"
                        href={state.resources.pricing_url}
                    >
                        <img src={lockedIcon} alt="" />
                        <span>
                            <strong>{__('Upgrade to Pro', 'webba-booking-lite')}</strong>
                            <small>
                                {__(
                                    'Unlock calendar sync & payments.',
                                    'webba-booking-lite'
                                )}
                            </small>
                        </span>
                    </a>
                    )}
                </aside>
                    </>
                )}
            </div>

        </div>
    )
}
