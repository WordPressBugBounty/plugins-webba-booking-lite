import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { IWebba5StepHeaderProps, Webba5StepId } from './types'

const STEPS: { id: Webba5StepId; label: string }[] = [
    { id: 'service', label: __('Service', 'webba-booking-lite') },
    { id: 'schedule', label: __('Schedule', 'webba-booking-lite') },
    { id: 'details', label: __('Details', 'webba-booking-lite') },
    { id: 'review', label: __('Review & Payment', 'webba-booking-lite') },
]

export const Webba5StepHeader = ({
    currentStep,
    serviceStepLocked,
    canOpenSchedule,
    canOpenDetails,
    canOpenReview,
    onStep,
}: IWebba5StepHeaderProps) => {
    const currentIndex = STEPS.findIndex((step) => step.id === currentStep)

    return (
        <ol className="wbk_webba5_form__steps">
            {STEPS.map((step, index) => {
                const isCurrent = step.id === currentStep
                const isComplete = index < currentIndex
                const canOpen =
                    (step.id === 'service' && !serviceStepLocked) ||
                    (step.id === 'schedule' && canOpenSchedule) ||
                    (step.id === 'details' && canOpenDetails) ||
                    (step.id === 'review' && canOpenReview)

                return (
                    <li key={step.id} className="wbk_webba5_form__step">
                        <button
                            type="button"
                            className={classNames('wbk_webba5_form__step-button', {
                                'wbk_webba5_form__step-button--current': isCurrent,
                                'wbk_webba5_form__step-button--complete': isComplete,
                            })}
                            disabled={!canOpen}
                            onClick={() => onStep(step.id)}
                        >
                            <span className="wbk_webba5_form__step-index">
                                {index + 1}
                            </span>
                            {step.label}
                        </button>
                    </li>
                )
            })}
        </ol>
    )
}
