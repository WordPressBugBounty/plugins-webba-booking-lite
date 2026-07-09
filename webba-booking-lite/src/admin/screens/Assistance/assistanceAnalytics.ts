import { trackEvent } from '../../../utils/analytics'
import type {
    AssistanceScreenVariant,
    AssistanceSkipTrackingPayload,
} from './types'

export const trackAssistanceOpened = (variant: AssistanceScreenVariant) => {
    trackEvent('AI Assistance Opened', {
        variant,
    })
}

export const buildAssistanceSkipProperties = (
    payload: AssistanceSkipTrackingPayload
) => ({
    conversation_json: JSON.stringify(payload),
    message_count: payload.conversation.length,
})

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
