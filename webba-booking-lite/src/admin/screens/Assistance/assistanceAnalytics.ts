import { trackEvent } from '../../../utils/analytics'
import type {
    AssistanceScreenVariant,
    AssistanceSkipTrackingPayload,
} from './types'

export const buildAssistanceSkipProperties = (
    payload: AssistanceSkipTrackingPayload
) => ({
    conversation_json: JSON.stringify(payload),
    message_count: payload.conversation.length,
})

export const trackAssistanceOpened = (variant: AssistanceScreenVariant) => {
    trackEvent('AI Assistance Opened', {
        variant,
    })
}

export const trackAssistanceSkipped = (
    variant: AssistanceScreenVariant,
    payload?: AssistanceSkipTrackingPayload,
    properties?: Record<string, unknown>,
    callback?: () => void
) => {
    trackEvent(
        'AI Assistance Skipped',
        {
            variant,
            ...(payload ? buildAssistanceSkipProperties(payload) : {}),
            ...properties,
        },
        callback
    )
}

export const trackAssistanceCompleted = (
    variant: AssistanceScreenVariant,
    properties?: Record<string, unknown>
) => {
    trackEvent('AI Assistance Completed', {
        variant,
        ...properties,
    })
}

export const trackAssistanceWizardPromptSent = (
    payload: AssistanceSkipTrackingPayload
) => {
    trackEvent('Setup Wizard AI Prompt Sent', {
        step: 'ai',
        step_title: 'AI Setup',
        setup_mode: 'ai',
        ...buildAssistanceSkipProperties(payload),
    })
}

export const trackAssistanceWizardSuggestionApplied = (
    properties?: Record<string, unknown>
) => {
    trackEvent('Setup Wizard AI Suggestion Applied', {
        step: 'ai',
        step_title: 'AI Setup',
        setup_mode: 'ai',
        ...properties,
    })
}

export const trackAssistanceWizardSkipped = (
    payload?: AssistanceSkipTrackingPayload,
    properties?: Record<string, unknown>,
    callback?: () => void
) => {
    trackEvent(
        'Setup Wizard AI Skipped',
        {
            step: 'ai',
            step_title: 'AI Setup',
            setup_mode: 'ai',
            ...(payload ? buildAssistanceSkipProperties(payload) : {}),
            ...properties,
        },
        callback
    )
}
