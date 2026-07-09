import { useCallback, useState } from 'react'
import { __ } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { ProFeatuerWrapper } from '../ProFeatuerWrapper/ProFeatuerWrapper'
import { EmailNotificationsStepContent } from './EmailNotificationsStepContent'
import { AdvancedBookingRulesStepContent } from './AdvancedBookingRulesStepContent'
import { PaymentSettingsStepContent } from './PaymentSettingsStepContent'
import { SetupChecklistLockedStepContent } from './SetupChecklistLockedStepContent'
import { SkipStepButton } from './SkipStepButton'
import type { SetupChecklistEmailTemplate, SetupChecklistStep } from './types'
import checkIcon from '../../../../public/images/icon-check-nobg.svg'
import clipboardIcon from '../../../../public/images/icon-clipboard.svg'
import './SetupChecklist.scss'

interface SetupChecklistStepItemProps {
    step: SetupChecklistStep
    shortcode: string
    emailTemplates: SetupChecklistEmailTemplate[]
    isExpanded: boolean
    isReviewMode?: boolean
    reviewActiveStepId?: string | null
    onReviewStepChange?: (stepId: string) => void
    onSkipStep: (stepId: string) => Promise<void>
}

const hasRequiredPlan = (
    requiredPlans: string[],
    planMap: Record<string, boolean>
): boolean => {
    if (!requiredPlans.length) {
        return true
    }
    return requiredPlans.some((plan) => planMap[plan] === true)
}

export const SetupChecklistStepItem = ({
    step,
    shortcode,
    emailTemplates,
    isExpanded,
    isReviewMode = false,
    reviewActiveStepId = null,
    onReviewStepChange,
    onSkipStep,
}: SetupChecklistStepItemProps) => {
    const { plan_map } = useSelect(
        (select: any) => select(store_name).getPreset(),
        []
    ) as { plan_map?: Record<string, boolean> }

    const [copied, setCopied] = useState(false)
    const [isSkipping, setIsSkipping] = useState(false)
    const planMap = plan_map || {}
    const planAvailable = hasRequiredPlan(step.required_plans, planMap)
    const isActive = isReviewMode
        ? step.id === reviewActiveStepId
        : step.status === 'in_progress'
    const showDetails = isExpanded && isActive

    const handleReviewStepSelect = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            if (!isReviewMode || !onReviewStepChange) {
                return
            }

            const target = event.target as HTMLElement
            if (target.closest('a, button')) {
                return
            }

            onReviewStepChange(step.id)
        },
        [isReviewMode, onReviewStepChange, step.id]
    )

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(shortcode).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }, [shortcode])

    const handleSkip = useCallback(async () => {
        setIsSkipping(true)
        try {
            await onSkipStep(step.id)
        } finally {
            setIsSkipping(false)
        }
    }, [onSkipStep, step.id])

    const statusLabel = step.skipped
        ? __('Skipped', 'webba-booking-lite')
        : step.status === 'completed'
          ? isReviewMode && isActive
              ? __('Reviewing', 'webba-booking-lite')
              : __('Completed', 'webba-booking-lite')
          : step.status === 'in_progress'
            ? __('In Progress', 'webba-booking-lite')
            : __('Pending', 'webba-booking-lite')

    const statusBadgeClass = step.skipped
        ? 'wbk_setupChecklist__statusBadge--skipped'
        : `wbk_setupChecklist__statusBadge--${step.status}`

    return (
        <div
            data-checklist-step={step.id}
            className={`wbk_setupChecklist__step ${
                step.status === 'completed'
                    ? 'wbk_setupChecklist__step--completed'
                    : ''
            } ${isActive ? 'wbk_setupChecklist__step--active' : ''} ${
                isReviewMode ? 'wbk_setupChecklist__step--reviewable' : ''
            }`}
        >
            <div
                className="wbk_setupChecklist__stepHeader"
                onClick={isReviewMode ? handleReviewStepSelect : undefined}
                onKeyDown={
                    isReviewMode
                        ? (event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault()
                                  onReviewStepChange?.(step.id)
                              }
                          }
                        : undefined
                }
                role={isReviewMode ? 'button' : undefined}
                tabIndex={isReviewMode ? 0 : undefined}
                aria-expanded={isReviewMode ? isActive : undefined}
            >
                <div className="wbk_setupChecklist__stepCheck">
                    {step.status === 'completed' ? (
                        <img src={checkIcon} alt="" />
                    ) : (
                        <span className="wbk_setupChecklist__stepCircle" />
                    )}
                </div>
                <div className="wbk_setupChecklist__stepContent">
                    <div className="wbk_setupChecklist__stepTitleRow">
                        <h3 className="wbk_setupChecklist__stepTitle">
                            {step.action_url ? (
                                <a
                                    href={step.action_url}
                                    className={`wbk_setupChecklist__stepTitleLink${
                                        step.status === 'completed'
                                            ? ' wbk_setupChecklist__stepTitleLink--done'
                                            : ''
                                    }`}
                                >
                                    {step.title}
                                </a>
                            ) : (
                                step.title
                            )}
                        </h3>
                        <div className="wbk_setupChecklist__stepBadges">
                            {!planAvailable && step.required_plans.length > 0 && (
                                <ProFeatuerWrapper
                                    requiredPlans={step.required_plans}
                                    variant="badge"
                                />
                            )}
                            {isExpanded && (
                                <span
                                    className={`wbk_setupChecklist__statusBadge ${statusBadgeClass}`}
                                >
                                    {statusLabel}
                                </span>
                            )}
                        </div>
                    </div>
                    {isExpanded && (
                        <p className="wbk_setupChecklist__stepDescription">
                            {step.description}
                        </p>
                    )}
                    {showDetails && step.id === 'embed_form' && (
                        <div className="wbk_setupChecklist__stepActions">
                            <div className="wbk_setupChecklist__shortcodeBlock">
                                <code className="wbk_setupChecklist__shortcode">
                                    {shortcode}
                                </code>
                                <button
                                    type="button"
                                    className="wbk_setupChecklist__copyButton"
                                    onClick={handleCopy}
                                >
                                    <img src={clipboardIcon} alt="" />
                                    {copied
                                        ? __('Copied!', 'webba-booking-lite')
                                        : __('Copy', 'webba-booking-lite')}
                                </button>
                            </div>
                            <div className="wbk_setupChecklist__actionRow">
                                <a
                                    className="wbk_setupChecklist__primaryButton"
                                    href={step.action_url}
                                >
                                    {__('Go to Pages', 'webba-booking-lite')}
                                </a>
                                {step.guide_url && (
                                    <a
                                        className="wbk_setupChecklist__secondaryLink"
                                        href={step.guide_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {__('View Guide', 'webba-booking-lite')}
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                    {showDetails && step.id === 'email_notifications' && (
                        <EmailNotificationsStepContent
                            templates={emailTemplates}
                            actionUrl={step.action_url}
                            guideUrl={step.guide_url}
                        />
                    )}
                    {showDetails &&
                        !planAvailable &&
                        step.required_plans.length > 0 && (
                        <SetupChecklistLockedStepContent
                            requiredPlans={step.required_plans}
                            guideUrl={step.guide_url}
                            skippable={step.skippable}
                            isSkipping={isSkipping}
                            onSkip={handleSkip}
                        />
                    )}
                    {showDetails && step.id === 'payment_settings' && planAvailable && (
                        <PaymentSettingsStepContent
                            guideUrl={step.guide_url}
                            onSkip={handleSkip}
                        />
                    )}
                    {showDetails && step.id === 'advanced_booking_rules' && (
                        <AdvancedBookingRulesStepContent
                            guideUrl={step.guide_url}
                            onSkip={handleSkip}
                        />
                    )}
                    {showDetails &&
                        planAvailable &&
                        step.id !== 'embed_form' &&
                        step.id !== 'email_notifications' &&
                        step.id !== 'payment_settings' &&
                        step.id !== 'advanced_booking_rules' && (
                        <div className="wbk_setupChecklist__stepActions">
                            <div className="wbk_setupChecklist__actionRow">
                                <a
                                    className="wbk_setupChecklist__primaryButton"
                                    href={step.action_url}
                                >
                                    {step.id === 'create_service'
                                        ? __('Go to Services', 'webba-booking-lite')
                                        : step.id === 'connect_calendar'
                                          ? __('Go to Connected Calendars', 'webba-booking-lite')
                                          : __('Go to Settings', 'webba-booking-lite')}
                                </a>
                                {step.skippable && (
                                    <SkipStepButton
                                        onSkip={handleSkip}
                                        disabled={isSkipping}
                                    />
                                )}
                                {step.guide_url && (
                                    <a
                                        className="wbk_setupChecklist__secondaryLink"
                                        href={step.guide_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {__('View Guide', 'webba-booking-lite')}
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
