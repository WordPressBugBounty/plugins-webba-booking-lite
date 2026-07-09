import { trackEvent } from '../../../utils/analytics'
import { WIZARD_STEP_TITLES, type WizardStepId } from './steps/steps'

export type WizardSetupMode = 'manual' | 'ai'
export type WizardTrackedStep = WizardStepId | 'ai'

const STEP_LABELS: Record<WizardTrackedStep, string> = {
    welcome: 'Welcome',
    businessInfo: 'Business Info',
    firstService: 'First Service',
    availability: 'Availability',
    choosePlan: 'Choose Plan',
    summary: 'Summary',
    ai: 'AI Setup',
}

const STEP_PASSED_EVENTS: Record<WizardStepId, string> = {
    welcome: 'Setup Wizard Welcome Passed',
    businessInfo: 'Setup Wizard Business Info Passed',
    firstService: 'Setup Wizard First Service Passed',
    availability: 'Setup Wizard Availability Passed',
    choosePlan: 'Setup Wizard Choose Plan Passed',
    summary: 'Setup Wizard Summary Passed',
}

const getStepTitle = (step: WizardTrackedStep) => {
    if (step === 'ai') {
        return 'AI Setup'
    }

    return WIZARD_STEP_TITLES[step] || step
}

const getStepLabel = (step: WizardTrackedStep) => STEP_LABELS[step] || step

export const trackWizardOpened = () => {
    trackEvent('Setup Wizard Opened')
}

export const trackWizardStepPassed = (
    step: WizardStepId,
    setupMode: WizardSetupMode,
    properties?: Record<string, unknown>
) => {
    trackEvent(STEP_PASSED_EVENTS[step], {
        step,
        step_title: getStepTitle(step),
        setup_mode: setupMode,
        ...properties,
    })
}

export const trackWizardStepBack = (
    fromStep: WizardTrackedStep,
    setupMode: WizardSetupMode
) => {
    trackEvent(`Setup Wizard ${getStepLabel(fromStep)} Back`, {
        step: fromStep,
        step_title: getStepTitle(fromStep),
        setup_mode: setupMode,
    })
}

export const trackWizardCompleted = (setupMode: WizardSetupMode) => {
    trackEvent('Setup Wizard Completed', {
        setup_mode: setupMode,
    })
}

export const trackWizardStepAction = (
    step: WizardTrackedStep,
    action: string,
    properties?: Record<string, unknown>
) => {
    trackEvent(`Setup Wizard ${getStepLabel(step)} Action`, {
        step,
        step_title: getStepTitle(step),
        action,
        ...properties,
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
