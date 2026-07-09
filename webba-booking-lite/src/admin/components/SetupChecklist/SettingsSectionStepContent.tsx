import { useCallback, useEffect, useMemo, useState } from 'react'
import { __ } from '@wordpress/i18n'
import { useDispatch, useSelect } from '@wordpress/data'
import { store, store_name } from '../../../store/backend'
import { FormProvider } from '../Form/lib/FormProvider'
import { createFormFromModel } from '../Form/lib/createForm'
import { getFormState } from '../Form/lib/utils'
import { createFormMenuSectionsFromModel } from '../Form/utils/utils'
import { buildModelFromSettingsFields } from '../Settings/utils/utils'
import { Loading } from '../Loading/Loading'
import type { ISettingsSection } from '../Settings/types'
import './SettingsSectionStepContent.scss'
import { capitalize } from '../../utils/capitalize'

interface SettingsSectionStepContentProps {
    sectionId: string
    checklistStepId: string
    guideUrl: string
    emptyMessage: string
    onSkip: () => void
}

export const SettingsSectionStepContent = ({
    sectionId,
    checklistStepId,
    guideUrl,
    emptyMessage,
    onSkip,
}: SettingsSectionStepContentProps) => {
    const [activeTab, setActiveTab] = useState('general')
    const [isSaving, setIsSaving] = useState(false)
    const [isSkipping, setIsSkipping] = useState(false)

    const settingsSection = useSelect((select: any) => {
        const options = select(store).getOptions() as Record<
            string,
            ISettingsSection
        >
        return options?.[sectionId] || null
    }, [sectionId])

    const isOptionsLoading = useSelect(
        (select: any) => select(store).getLoadingState('options'),
        []
    )

    const { setOptions, completeSetupChecklistStep } = useDispatch(
        store_name
    ) as {
        setOptions: (
            section: string,
            formData: Record<string, unknown>
        ) => Promise<void>
        completeSetupChecklistStep: (stepId: string) => Promise<void>
    }

    const { model, defaultValues } = useMemo(() => {
        if (!settingsSection?.fields?.length) {
            return { model: { properties: {} }, defaultValues: {} }
        }
        return buildModelFromSettingsFields({ fields: settingsSection.fields })
    }, [settingsSection])

    const form = useMemo(() => createFormFromModel(model), [model])

    const tabSections = useMemo(
        () =>
            createFormMenuSectionsFromModel({
                model,
                form,
                modelName: 'settings',
            }),
        [model, form]
    )

    const tabLabels = settingsSection?.tabs || {}

    useEffect(() => {
        if (Object.keys(defaultValues).length) {
            form.patchValue(defaultValues)
        }
    }, [defaultValues, form])

    useEffect(() => {
        const availableTabs = Object.keys(tabSections).filter(
            (tabId) => (tabSections[tabId] || []).length > 0
        )
        if (availableTabs.length && !availableTabs.includes(activeTab)) {
            setActiveTab(availableTabs[0])
        }
    }, [activeTab, tabSections])

    const handleConfirm = useCallback(async () => {
        const { values, isValid } = getFormState(form)
        if (!isValid) {
            return
        }

        setIsSaving(true)
        try {
            await setOptions(sectionId, values)
            await completeSetupChecklistStep(checklistStepId)
        } finally {
            setIsSaving(false)
        }
    }, [checklistStepId, completeSetupChecklistStep, form, sectionId, setOptions])

    const handleSkip = useCallback(async () => {
        setIsSkipping(true)
        try {
            await onSkip()
        } finally {
            setIsSkipping(false)
        }
    }, [onSkip])

    if (isOptionsLoading && !settingsSection) {
        return <Loading minHeight="120px" />
    }

    if (!settingsSection?.fields?.length) {
        return (
            <div className="wbk_settingsSectionStep">
                <p className="wbk_settingsSectionStep__empty">{emptyMessage}</p>
            </div>
        )
    }

    const activeFields = tabSections[activeTab] || []
    const availableTabs = Object.keys(tabSections).filter(
        (tabId) => (tabSections[tabId] || []).length > 0
    )

    return (
        <div className="wbk_settingsSectionStep">
            <FormProvider form={form} tooltipMode="description">
                {availableTabs.length > 1 && (
                    <div className="wbk_settingsSectionStep__tabs">
                        {availableTabs.map((tabId) => (
                            <button
                                key={tabId}
                                type="button"
                                className={`wbk_settingsSectionStep__tab ${activeTab === tabId
                                        ? 'wbk_settingsSectionStep__tab--active'
                                        : ''
                                    }`}
                                onClick={() => setActiveTab(tabId)}
                            >
                                {capitalize(tabLabels[tabId]?.title || tabId)}
                            </button>
                        ))}
                    </div>
                )}
                <div className="wbk_settingsSectionStep__fields">
                    {activeFields.map((field) => (
                        <div
                            key={field.name}
                            className="wbk_settingsSectionStep__field"
                        >
                            {field.element}
                        </div>
                    ))}
                </div>
            </FormProvider>
            <div className="wbk_settingsSectionStep__actionRow">
                <button
                    type="button"
                    className="wbk_settingsSectionStep__primaryButton"
                    onClick={handleConfirm}
                    disabled={isSaving || isSkipping}
                >
                    {isSaving
                        ? __('Saving...', 'webba-booking-lite')
                        : __('Confirm', 'webba-booking-lite')}
                </button>
                <button
                    type="button"
                    className="wbk_settingsSectionStep__skipButton"
                    onClick={handleSkip}
                    disabled={isSaving || isSkipping}
                >
                    {isSkipping
                        ? __('Skipping...', 'webba-booking-lite')
                        : __('Skip', 'webba-booking-lite')}
                </button>
                {guideUrl && (
                    <a
                        className="wbk_settingsSectionStep__secondaryLink"
                        href={guideUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {__('View Guide', 'webba-booking-lite')}
                    </a>
                )}
            </div>
        </div>
    )
}
