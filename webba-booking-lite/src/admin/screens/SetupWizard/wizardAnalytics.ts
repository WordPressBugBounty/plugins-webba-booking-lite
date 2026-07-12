import { trackEvent } from '../../../utils/analytics'
import { WIZARD_STEP_TITLES, type WizardStepId } from './steps/steps'

export type WizardSetupMode = 'manual' | 'ai'
export type WizardTrackedStep = WizardStepId | 'ai'

const STEP_RENDERED_EVENTS: Record<WizardTrackedStep, string> = {
    welcome: 'Setup Wizard Welcome Rendered',
    businessInfo: 'Setup Wizard Business Info Rendered',
    firstService: 'Setup Wizard First Service Rendered',
    availability: 'Setup Wizard Availability Rendered',
    choosePlan: 'Setup Wizard Choose Plan Rendered',
    summary: 'Setup Wizard Summary Rendered',
    ai: 'Setup Wizard AI Opened',
}

const getStepTitle = (step: WizardTrackedStep) => {
    if (step === 'ai') {
        return 'AI Setup'
    }

    return WIZARD_STEP_TITLES[step] || step
}

export const trackWizardStepRendered = (
    step: WizardTrackedStep,
    setupMode: WizardSetupMode
) => {
    trackEvent(STEP_RENDERED_EVENTS[step], {
        step,
        step_title: getStepTitle(step),
        setup_mode: setupMode,
    })
}

export const trackWizardCompleted = (setupMode: WizardSetupMode) => {
    trackEvent('Setup Wizard Completed', {
        setup_mode: setupMode,
    })
}

export type WizardSkipLinkClass =
    | 'wbk_setupWizard__skipLink__WelcomeScreen'
    | 'wbk_setupWizard__skipLink__AISetup'
    | 'wbk_setupWizard__skipLink__wizardBottom'

const SKIP_LINK_EVENTS: Record<WizardSkipLinkClass, string> = {
    wbk_setupWizard__skipLink__WelcomeScreen:
        'Setup Wizard Welcome Skip Clicked',
    wbk_setupWizard__skipLink__AISetup: 'Setup Wizard AI Setup Skip Clicked',
    wbk_setupWizard__skipLink__wizardBottom:
        'Setup Wizard Manual Skip Clicked',
}

export const trackWizardSkipLinkClick = (
    linkClass: WizardSkipLinkClass,
    properties?: Record<string, unknown>
) => {
    trackEvent(SKIP_LINK_EVENTS[linkClass], {
        link_class: linkClass,
        ...properties,
    })
}
