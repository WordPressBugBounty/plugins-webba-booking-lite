import type { WizardStepId } from './steps/steps'

export interface WizardFormValue {
    email?: string
    wbk_sidebar_help_email?: string
    wbk_sidebar_help_phone?: string
    timezone?: string
    currency?: string
    service_name?: string
    service_description?: string
    service_price?: string
    service_hide_price?: string
    service_duration?: number
    service_interval?: string
    service_buffer?: number
    service_advance?: number
    wbk_global_working_hours?: string
    [key: string]: unknown
}

export interface WizardStepProps {
    stepId: WizardStepId
    onNext?: () => void
    onPrev?: () => void
    isFirst?: boolean
    isLast?: boolean
}

