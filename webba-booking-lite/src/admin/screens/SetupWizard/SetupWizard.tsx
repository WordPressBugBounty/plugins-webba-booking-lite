import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { __ } from '@wordpress/i18n'
import { useSelect, useDispatch } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { FormProvider } from '../../components/Form/lib/FormProvider'
import { getFormState } from '../../components/Form/lib/utils'
import {
    getWizardModel,
    WIZARD_STEP_ORDER,
    WIZARD_STEP_TITLES,
} from './steps/steps'
import { WelcomeStep } from './steps/WelcomeStep/WelcomeStep'
import { BusinessInfoStep } from './steps/BusinessInfoStep/BusinessInfoStep'
import { FirstServiceStep } from './steps/FirstServiceStep/FirstServiceStep'
import { AvailabilityStep } from './steps/AvailabilityStep/AvailabilityStep'
import { ChoosePlanStep } from './steps/ChoosePlanStep/ChoosePlanStep'
import { SummaryStep } from './steps/SummaryStep/SummaryStep'
import type { WizardStepId } from './steps/steps'
import './SetupWizard.scss'

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'د.إ',
    AUD: 'A$',
    BGN: 'лв',
    BRL: 'R$',
    CAD: 'C$',
    CHF: 'Fr',
    CNY: '¥',
    CZK: 'Kč',
    DKK: 'kr',
    HKD: 'HK$',
    HRK: 'kn',
    HUF: 'Ft',
    IDR: 'Rp',
    ILS: '₪',
    INR: '₹',
    ISK: 'kr',
    JPY: '¥',
    KRW: '₩',
    MXN: '$',
    MYR: 'RM',
    NOK: 'kr',
    NZD: 'NZ$',
    PHP: '₱',
    PLN: 'zł',
    RON: 'lei',
    RUB: '₽',
    SEK: 'kr',
    SGD: 'S$',
    THB: '฿',
    TRY: '₺',
    ZAR: 'R',
}

export const SetupWizard = () => {
    const { admin_url, settings, wording, plugin_url, plan_map } = useSelect(
        (select: any) => select(store_name).getPreset(),
        []
    ) as {
        admin_url?: string
        settings?: {
            admin_email?: string
            timezone?: string
            wbk_global_working_hours?: string
            wbk_holydays?: string
        }
        wording?: { help_email?: string; help_phone?: string }
        plugin_url?: string
        plan_map?: Record<string, boolean>
    }
    const { submitWizardInitialSetup, submitWizardFinalSetup } =
        useDispatch(store_name) as {
            submitWizardInitialSetup: (data: Record<string, string | number>) => Promise<{ status?: string; shortcode?: string }>
            submitWizardFinalSetup: (payload: { final_action: 'finalize' | 'setup_advanced' }) => Promise<{ status?: string; url?: string }>
        }

    const wizardModel = useMemo(() => getWizardModel(), [])
    const form = useMemo(
        () => createFormFromModel(wizardModel),
        [wizardModel]
    )
    const modelProperties = wizardModel.properties

    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [loading, setLoading] = useState(false)
    const [summaryShortcode, setSummaryShortcode] = useState('[webba_booking]')
    const [slideDirection, setSlideDirection] = useState<'forward' | 'backward' | null>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        contentRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    }, [currentStepIndex])

    useEffect(() => {
        if (!settings && !wording) return
        const patch: Record<string, unknown> = {}
        if (settings?.admin_email) patch.email = settings.admin_email
        if (settings?.timezone) patch.timezone = settings.timezone
        if (wording?.help_email) patch.wbk_sidebar_help_email = wording.help_email
        if (wording?.help_phone) patch.wbk_sidebar_help_phone = wording.help_phone
        if (settings?.wbk_global_working_hours) {
            const raw = settings.wbk_global_working_hours
            patch.wbk_global_working_hours =
                typeof raw === 'string' && raw.trim()
                    ? (() => {
                          try {
                              return JSON.parse(raw) as unknown
                          } catch {
                              return raw
                          }
                      })()
                    : raw
        }
        if (settings?.wbk_holydays && typeof settings.wbk_holydays === 'string') {
            const dates = settings.wbk_holydays
                .split(',')
                .map((d) => d.trim())
                .filter(Boolean)
            if (dates.length > 0) {
                patch.closed_dates = dates
                    .map((ymd) => {
                        const [y, m, d] = ymd.split('-')
                        if (y && m && d) return `${parseInt(m, 10)}/${parseInt(d, 10)}/${y}`
                        return ymd
                    })
                    .join(', ')
            }
        }
        if (Object.keys(patch).length) form.patchValue(patch)
    }, [settings, wording, form])

    const hasHigherPlanThanStart = useMemo(() => {
        if (!plan_map || typeof plan_map !== 'object') return false
        return (
            plan_map.standard === true ||
            plan_map.premium === true ||
            plan_map.pro === true
        )
    }, [plan_map])

    const stepOrder = useMemo(
        () =>
            hasHigherPlanThanStart
                ? (WIZARD_STEP_ORDER as readonly string[]).filter(
                      (id) => id !== 'choosePlan'
                  ) as WizardStepId[]
                : ([...WIZARD_STEP_ORDER] as WizardStepId[]),
        [hasHigherPlanThanStart]
    )

    useEffect(() => {
        if (currentStepIndex >= stepOrder.length) {
            setCurrentStepIndex(Math.max(0, stepOrder.length - 1))
        }
    }, [stepOrder.length, currentStepIndex])

    const currentStepId = stepOrder[currentStepIndex] as WizardStepId | undefined
    const stepTitle = currentStepId
        ? WIZARD_STEP_TITLES[currentStepId] || ''
        : ''
    const isFirstStep = currentStepIndex === 0
    const isLastStep = currentStepIndex === stepOrder.length - 1
    const isSummaryStep = currentStepId === 'summary'
    const showNav =
        !isFirstStep && !isSummaryStep && currentStepId !== 'welcome'

    const totalSteps = stepOrder.length

    const collectFormData = useCallback(() => {
        const { values } = getFormState(form)
        const data: Record<string, string | number> = {}
        for (const key of Object.keys(values)) {
            if (key === 'id') continue
            const v = values[key]
            if (v === undefined || v === null) continue
            if (typeof v === 'object' && !Array.isArray(v)) {
                data[key] = JSON.stringify(v) as string
            } else {
                data[key] = v as string | number
            }
        }
        const closedDatesVal = values.closed_dates
        if (closedDatesVal && typeof closedDatesVal === 'string' && closedDatesVal.trim()) {
            const dates = closedDatesVal.split(',').map((d) => d.trim()).filter(Boolean)
            if (dates.length > 0) {
                data.closed_dates = JSON.stringify(
                    dates.map((d) => ({ start: d, end: d }))
                )
            }
        }
        const currency = data.currency as string
        if (currency) {
            data.currency_symbol = (CURRENCY_SYMBOLS[currency] || currency) as string
        }
        return data
    }, [form])

    const submitInitialSetup = useCallback(async (): Promise<{ shortcode?: string } | false> => {
        try {
            const data = collectFormData()
            const result = await submitWizardInitialSetup(data)
            if (result?.status === 'success') return result
            return false
        } catch {
            return false
        }
    }, [submitWizardInitialSetup, collectFormData])

    const submitFinalSetup = useCallback(async (): Promise<string | null> => {
        try {
            const result = await submitWizardFinalSetup({ final_action: 'finalize' })
            if (result?.status === 'success' && result?.url) return result.url
            return admin_url ? `${admin_url}admin.php?page=wbk-dashboard&tab=dashboard` : null
        } catch {
            return admin_url ? `${admin_url}admin.php?page=wbk-dashboard&tab=dashboard` : null
        }
    }, [submitWizardFinalSetup, admin_url])

    const goNext = useCallback(async () => {
        const nextIndex = currentStepIndex + 1
        if (nextIndex >= totalSteps) return

        setSlideDirection('forward')

        const nextStepId = stepOrder[nextIndex]
        if (nextStepId === 'summary') {
            setLoading(true)
            const result = await submitInitialSetup()
            setLoading(false)
            if (result !== false) {
                if (result?.shortcode) setSummaryShortcode(result.shortcode)
                setCurrentStepIndex(nextIndex)
            }
        } else {
            setCurrentStepIndex(nextIndex)
        }
    }, [currentStepIndex, totalSteps, stepOrder, submitInitialSetup])

    const goPrev = useCallback(() => {
        if (currentStepIndex > 0) {
            setSlideDirection('backward')
            setCurrentStepIndex(currentStepIndex - 1)
        }
    }, [currentStepIndex])

    const handleClose = useCallback(async () => {
        setLoading(true)
        const url = await submitFinalSetup()
        setLoading(false)
        if (url) window.location.href = url
    }, [submitFinalSetup])

    const dashboardUrl =
        admin_url ? `${admin_url}admin.php?page=wbk-dashboard&tab=dashboard` : '#'

    return (
        <div className="wbk_setupWizard__mainBlock">
            <div className="wbk_setupWizard__wrapper">
                <header className="wbk_setupWizard__header">
                    <div className="wbk_setupWizard__headerTitleWrapper">
                        {plugin_url && (
                            <a
                                href="https://webba-booking.com/"
                                target="_blank"
                                rel="noopener"
                                className="wbk_setupWizard__logo"
                            >
                                <img
                                    src={`${plugin_url}/public/images/webba-icon.svg`}
                                    alt="Webba Booking"
                                    width={32}
                                    height={32}
                                />
                            </a>
                        )}
                        <div className="wbk_setupWizard__pageSubtitle">
                            {__('Setup Wizard', 'webba-booking-lite')}
                        </div>
                    </div>
                    <div className="wbk_setupWizard__pageTitle">{stepTitle}</div>
                </header>

                <div className="wbk_setupWizard__progressWrapper">
                    <ul className="wbk_setupWizard__progressSteps">
                        {stepOrder.map((_, i) => (
                            <li
                                key={i}
                                className={`${i === currentStepIndex ? 'wbk_setupWizard__progressStep--active' : ''} ${i < currentStepIndex ? 'wbk_setupWizard__progressStep--done' : ''}`}
                            >
                                {i < currentStepIndex ? (
                                    <span className="wbk_setupWizard__checkmark" />
                                ) : (
                                    i + 1
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div
                    ref={contentRef}
                    className={`wbk_setupWizard__content ${currentStepId === 'welcome' ? 'wbk_setupWizard__content--contentWelcome' : ''}`}
                >
                    <div
                        key={currentStepIndex}
                        className={`wbk_setupWizard__stepTransition ${slideDirection === 'forward' ? 'wbk_setupWizard__stepForward' : ''} ${slideDirection === 'backward' ? 'wbk_setupWizard__stepBackward' : ''}`}
                    >
                        <FormProvider form={form} tooltipMode="tooltip">
                            {currentStepId === 'welcome' && (
                            <WelcomeStep
                                onLaunch={goNext}
                                skipUrl={dashboardUrl}
                            />
                        )}
                        {currentStepId === 'businessInfo' && (
                            <BusinessInfoStep
                                form={form}
                                modelProperties={modelProperties}
                            />
                        )}
                        {currentStepId === 'firstService' && (
                            <FirstServiceStep
                                form={form}
                                modelProperties={modelProperties}
                            />
                        )}
                        {currentStepId === 'availability' && (
                            <AvailabilityStep
                                form={form}
                                modelProperties={modelProperties}
                            />
                        )}
                        {currentStepId === 'choosePlan' && (
                            <ChoosePlanStep onContinue={goNext} />
                        )}
                        {currentStepId === 'summary' && (
                            <SummaryStep
                                shortcode={summaryShortcode}
                                dashboardUrl={dashboardUrl}
                                onClose={handleClose}
                                pluginUrl={plugin_url}
                            />
                        )}
                        </FormProvider>
                    </div>
                </div>

                {showNav && (
                    <div className="wbk_setupWizard__navigation">
                        <div className="wbk_setupWizard__buttonsBlock">
                            <button
                                type="button"
                                className="wbk_setupWizard__buttonSecondary"
                                onClick={goPrev}
                            >
                                {__('Previous', 'webba-booking-lite')}
                            </button>
                            <button
                                type="button"
                                className="wbk_setupWizard__buttonPrimary"
                                onClick={goNext}
                                disabled={loading}
                            >
                                {loading
                                    ? __('Saving…', 'webba-booking-lite')
                                    : __('Next', 'webba-booking-lite')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
