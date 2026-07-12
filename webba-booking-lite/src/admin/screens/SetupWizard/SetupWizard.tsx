import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { __ } from '@wordpress/i18n'
import { useSelect, useDispatch } from '@wordpress/data'
import { proxy, useSnapshot } from 'valtio'
import { store_name } from '../../../store/backend'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { FormProvider } from '../../components/Form/lib/FormProvider'
import { getFormState } from '../../components/Form/lib/utils'
import {
    getWizardModel,
    getFirstServiceFields,
    getAvailabilityFields,
    WIZARD_STEP_ORDER,
    WIZARD_STEP_TITLES,
} from './steps/steps'
import { WelcomeStep } from './steps/WelcomeStep/WelcomeStep'
import { BusinessInfoStep } from './steps/BusinessInfoStep/BusinessInfoStep'
import { FirstServiceStep } from './steps/FirstServiceStep/FirstServiceStep'
import { AvailabilityStep } from './steps/AvailabilityStep/AvailabilityStep'
import { ChoosePlanStep } from './steps/ChoosePlanStep/ChoosePlanStep'
import { SummaryStep } from './steps/SummaryStep/SummaryStep'
import type { WizardServiceType, WizardStepId } from './steps/steps'
import { AssistanceScreen } from '../Assistance/AssistanceScreen'
import { trackAssistanceWizardSkipped } from '../Assistance/assistanceAnalytics'
import type { AssistanceScreenHandle } from '../Assistance/types'
import arrowRightIcon from '../../../../public/images/icon-arrow-right.svg'
import {
    trackWizardCompleted,
    trackWizardSkipLinkClick,
    trackWizardStepRendered,
} from './wizardAnalytics'
import './SetupWizard.scss'

type SetupWizardMode = 'ai' | 'manual'
const BUSINESS_INFO_FIELDS = [
    'email',
    'wbk_sidebar_help_email',
    'wbk_sidebar_help_phone',
    'timezone',
] as const

const getStepFieldNames = (
    stepId: WizardStepId | undefined,
    serviceType: WizardServiceType
): readonly string[] => {
    if (!stepId) {
        return []
    }

    if (stepId === 'firstService') {
        return getFirstServiceFields(serviceType)
    }

    if (stepId === 'availability') {
        return getAvailabilityFields(serviceType)
    }

    if (stepId === 'businessInfo') {
        return BUSINESS_INFO_FIELDS
    }

    return []
}

const isStepValid = (
    form: ReturnType<typeof createFormFromModel>,
    stepId: WizardStepId | undefined,
    serviceType: WizardServiceType
): boolean => {
    const fieldNames = getStepFieldNames(stepId, serviceType)
    if (!fieldNames.length) {
        return true
    }

    return fieldNames.every((fieldName) => {
        const field = form.fields[fieldName]
        if (!field || field.isIgnored.value) {
            return true
        }

        return field.errors.value.length === 0
    })
}

const WizardNextButton = ({
    form,
    currentStepId,
    loading,
    onClick,
}: {
    form: ReturnType<typeof createFormFromModel>
    currentStepId: WizardStepId | undefined
    loading: boolean
    onClick: () => void
}) => {
    const validationProxy = useMemo(
        () =>
            proxy({
                serviceType: form.fields.service_type?.value,
                fields: Object.fromEntries(
                    Object.keys(form.fields).map((fieldName) => [
                        fieldName,
                        {
                            errors: form.fields[fieldName].errors,
                            isIgnored: form.fields[fieldName].isIgnored,
                        },
                    ])
                ),
            }),
        [form]
    )
    const validationSnapshot = useSnapshot(validationProxy)

    const serviceType = ((validationSnapshot.serviceType?.value as WizardServiceType) ||
        'hourly') as WizardServiceType
    const fieldNames = getStepFieldNames(currentStepId, serviceType)

    const isValid = fieldNames.every((fieldName) => {
        const field = validationSnapshot.fields[fieldName]
        if (!field || field.isIgnored?.value) {
            return true
        }

        return (field.errors?.value || []).length === 0
    })

    return (
        <button
            type="button"
            className="wbk_setupWizard__buttonPrimary"
            onClick={onClick}
            disabled={loading || !isValid}
        >
            {loading
                ? __('Saving…', 'webba-booking-lite')
                : __('Next', 'webba-booking-lite')}
        </button>
    )
}

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
    const { admin_url, settings, wording, plugin_url, plan_map, assistance_available } =
        useSelect((select: any) => select(store_name).getPreset(), []) as {
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
        assistance_available?: boolean
    }
    const { submitWizardInitialSetup, submitWizardFinalSetup } =
        useDispatch(store_name) as {
            submitWizardInitialSetup: (data: Record<string, unknown>) => Promise<{ status?: string; shortcode?: string }>
            submitWizardFinalSetup: (payload: { final_action: 'finalize' | 'setup_advanced' }) => Promise<{ status?: string; url?: string }>
        }

    const wizardModel = useMemo(() => getWizardModel(), [])
    const form = useMemo(
        () => createFormFromModel(wizardModel),
        [wizardModel]
    )
    const modelProperties = wizardModel.properties

    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [setupMode, setSetupMode] = useState<SetupWizardMode>('manual')
    const [loading, setLoading] = useState(false)
    const [summaryShortcode, setSummaryShortcode] = useState('[webba_booking]')
    const [slideDirection, setSlideDirection] = useState<'forward' | 'backward' | null>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const assistanceRef = useRef<AssistanceScreenHandle>(null)
    const aiSetupCompletedRef = useRef(false)

    useEffect(() => {
        contentRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    }, [currentStepIndex, setupMode])

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

    useEffect(() => {
        if (setupMode === 'ai') {
            trackWizardStepRendered('ai', 'ai')
            return
        }

        if (currentStepId) {
            trackWizardStepRendered(currentStepId, setupMode)
        }
    }, [setupMode, currentStepId])
    const isFirstStep = currentStepIndex === 0
    const isLastStep = currentStepIndex === stepOrder.length - 1
    const isSummaryStep = currentStepId === 'summary'
    const showNav =
        !isFirstStep && !isSummaryStep && currentStepId !== 'welcome'

    const totalSteps = stepOrder.length

    const collectFormData = useCallback(() => {
        const { values } = getFormState(form)
        const data: Record<string, string | number | unknown> = {}
        for (const key of Object.keys(values)) {
            if (key === 'id') continue
            const v = values[key]
            if (v === undefined || v === null) continue
            if (key === 'wbk_global_working_hours') {
                const arr =
                    typeof v === 'string'
                        ? (() => {
                              try {
                                  return JSON.parse(v)
                              } catch {
                                  return v
                              }
                          })()
                        : v
                data[key] = Array.isArray(arr) ? arr : v
                continue
            }
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
        const serviceType = ((form.fields.service_type?.value?.value as WizardServiceType) ||
            'hourly') as WizardServiceType
        if (!isStepValid(form, currentStepId, serviceType)) {
            return
        }

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
    }, [currentStepIndex, totalSteps, stepOrder, submitInitialSetup, form, currentStepId, setupMode])

    const goPrev = useCallback(() => {
        if (currentStepIndex > 0) {
            setSlideDirection('backward')
            setCurrentStepIndex(currentStepIndex - 1)
        }
    }, [currentStepIndex])

    const handleClose = useCallback(async () => {
        trackWizardCompleted(setupMode)
        setLoading(true)
        const url = await submitFinalSetup()
        setLoading(false)
        if (url) window.location.href = url
    }, [setupMode, submitFinalSetup])

    const handleSkipToManualSetup = useCallback(() => {
        setSetupMode('manual')
        setCurrentStepIndex(1)
        setSlideDirection('forward')
    }, [])

    const handleLaunchAiSetup = useCallback(() => {
        setSetupMode('ai')
        setSlideDirection(null)
    }, [])

    const handleAiSetupComplete = useCallback(async () => {
        if (aiSetupCompletedRef.current) {
            return
        }
        aiSetupCompletedRef.current = true
        setLoading(true)
        const url = await submitFinalSetup()
        setLoading(false)
        if (url) {
            // window.location.href = url
        }
    }, [submitFinalSetup])

    const dashboardUrl =
        admin_url ? `${admin_url}admin.php?page=wbk-dashboard&tab=dashboard` : '#'

    if (setupMode === 'ai') {
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
                        <div className="wbk_setupWizard__pageTitle">
                            {__('AI Setup', 'webba-booking-lite')}
                        </div>
                    </header>

                    <div className="wbk_setupWizard__content wbk_setupWizard__content--ai">
                        <AssistanceScreen
                            ref={assistanceRef}
                            variant="wizard"
                            onSetupComplete={handleAiSetupComplete}
                        />
                    </div>

                    <footer className="wbk_setupWizard__footer">
                        <a
                            href={dashboardUrl}
                            className="wbk_setupWizard__skipLink__AISetup"
                            onClick={(event) => {
                                event.preventDefault()
                                const payload =
                                    assistanceRef.current?.getSkipTrackingPayload()
                                let navigated = false
                                const navigate = () => {
                                    if (navigated) return
                                    navigated = true
                                    window.location.href = dashboardUrl
                                }
                                trackAssistanceWizardSkipped(
                                    payload,
                                    undefined,
                                    navigate
                                )
                                window.setTimeout(navigate, 1000)
                            }}
                        >
                            {__(
                                "Skip wizard, I'll configure later",
                                'webba-booking-lite'
                            )}
                        </a>
                        <button
                            type="button"
                            className="wbk_setupWizard__manualSetupLink"
                            onClick={handleSkipToManualSetup}
                        >
                            <span>
                                {__(
                                    'Use advanced manual setup instead',
                                    'webba-booking-lite'
                                )}
                            </span>
                            <img
                                src={arrowRightIcon}
                                alt=""
                                className="wbk_setupWizard__manualSetupLinkIcon"
                            />
                        </button>
                    </footer>
                </div>
            </div>
        )
    }

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
                                onLaunchManual={goNext}
                                onLaunchAi={
                                    assistance_available
                                        ? handleLaunchAiSetup
                                        : undefined
                                }
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
                        <a
                            href={dashboardUrl}
                            className="wbk_setupWizard__skipLink__wizardBottom"
                            onClick={() => {
                                trackWizardSkipLinkClick(
                                    'wbk_setupWizard__skipLink__wizardBottom',
                                    {
                                        step: currentStepId,
                                        step_title: stepTitle,
                                        setup_mode: setupMode,
                                    }
                                )
                            }}
                        >
                            {__(
                                "Skip wizard, I'll configure later",
                                'webba-booking-lite'
                            )}
                        </a>
                        <div className="wbk_setupWizard__buttonsBlock">
                            <button
                                type="button"
                                className="wbk_setupWizard__buttonSecondary"
                                onClick={goPrev}
                            >
                                {__('Previous', 'webba-booking-lite')}
                            </button>
                            <WizardNextButton
                                form={form}
                                currentStepId={currentStepId}
                                loading={loading}
                                onClick={goNext}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
