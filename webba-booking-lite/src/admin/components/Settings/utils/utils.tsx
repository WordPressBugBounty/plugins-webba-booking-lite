import { useCallback } from 'react'
import { useDispatch, useSelect } from '@wordpress/data'
import { ISettingsField, ISettingsModelProps, ISettingsSection } from '../types'
import { store } from '../../../../store/backend'
import { useSidebar } from '../../Sidebar/SidebarContext'
import { Form } from '../../Form/Form'
import { __ } from '@wordpress/i18n'
import { usePreset } from '../../../hooks/usePreset'
import '../Settings.scss'
import openSettingsIcon from '../../../../../public/images/icon-arrow-open.svg'
import { createFormMenuSectionsFromModel } from '../../Form/utils/utils'
import { createFormFromModel } from '../../Form/lib/createForm'
import { ProFeatuerWrapper } from '../../ProFeatuerWrapper/ProFeatuerWrapper'
import { useFeatureDisplayConfig } from '../../../hooks/useFeatureDisplayConfig'
import { useConfirmationPopup } from '../../ConfirmationPopup/ConfirmationPopupContext'

const addConditionFieldNames = (
    condition: unknown,
    addMissingField: (fieldName?: string) => void
) => {
    if (!Array.isArray(condition) || condition.length === 0) {
        return
    }

    if (Array.isArray(condition[0])) {
        condition.forEach((item) => {
            if (Array.isArray(item) && typeof item[0] === 'string') {
                addMissingField(item[0])
            }
        })
        return
    }

    if (typeof condition[0] === 'string') {
        addMissingField(condition[0])
    }
}

const collectDependencyFieldNames = (
    field: ISettingsField,
    localFieldIds: Set<string>,
    missingFieldIds: Set<string>
) => {
    const addMissingField = (fieldName?: string) => {
        if (fieldName && !localFieldIds.has(fieldName)) {
            missingFieldIds.add(fieldName)
        }
    }

    addConditionFieldNames(field.dependency, addMissingField)
    addConditionFieldNames(field.dependent_value?.condition, addMissingField)
}

const getCrossSectionDependencyFields = (
    fields: ISettingsField[],
    sections: Record<string, ISettingsSection>
) => {
    const localFieldIds = new Set(fields.map((field) => field.id))
    const missingFieldIds = new Set<string>()

    fields.forEach((field) =>
        collectDependencyFieldNames(field, localFieldIds, missingFieldIds)
    )

    if (missingFieldIds.size === 0) {
        return []
    }

    const resolvedFields: ISettingsField[] = []

    Object.values(sections).forEach((settingsSection) => {
        settingsSection.fields?.forEach((field) => {
            if (!missingFieldIds.has(field.id)) {
                return
            }

            resolvedFields.push(field)
            missingFieldIds.delete(field.id)
        })
    })

    return resolvedFields
}

const openSettingsSectionInModal = (
    sectionId: string,
    section: ISettingsSection,
    sections: Record<string, ISettingsSection>,
    sidebar: ReturnType<typeof useSidebar>,
    setOptions: (section: string, data: any) => Promise<void>,
    setToastNotification: (payload: { type: string; message: string }) => void,
    showConfirmation: (data: any) => void,
    initialTab?: string,
    fieldOverrides?: Record<string, string>
) => {
    const { fields, title, sections: subsectionTitles } = section
    const crossSectionFields = getCrossSectionDependencyFields(fields, sections)
    const formFields = [...fields, ...crossSectionFields]
    const { model } = buildModelFromSettingsFields({ fields: formFields })

    crossSectionFields.forEach((field) => {
        const property = model.properties[field.id]

        if (!property) {
            return
        }

        property.editable = false
        property.hidden = true
        property.misc.hidden = true
        property.default_value = field.value ?? field.default ?? ''
    })

    const form = createFormFromModel(model)
    const menuSections = createFormMenuSectionsFromModel({
        model,
        form,
        modelName: 'settings',
    })
    const storedValues = formFields.reduce((acc: any, field) => {
        acc[field.id] = field.value ?? field.default ?? ''
        return acc
    }, {})

    if (fieldOverrides) {
        Object.assign(storedValues, fieldOverrides)
    }

    sidebar.open(
        <Form
            name={title}
            id="edit-option-form"
            form={form}
            sections={menuSections}
            onSubmit={async (data) => {
                const sectionData = { ...data }
                crossSectionFields.forEach((field) => {
                    delete sectionData[field.id]
                })
                await setOptions(sectionId, sectionData)
                setToastNotification({
                    type: 'success',
                    message: __('Changes were saved.', 'webba-booking-lite'),
                })
            }}
            defaultValue={storedValues}
            subsectionTitles={subsectionTitles}
            tooltipMode="description"
            onReset={() => {
                showConfirmation({
                    title: __(
                        'Are you sure you want to reset the settings to defaults?',
                        'webba-booking-lite'
                    ),
                    message: __(
                        'You will lose all changes you made to the settings.',
                        'webba-booking-lite'
                    ),
                    onConfirm: () => {
                        const defaults = fields.reduce((acc: any, field) => {
                            acc[field.id] = field.default
                            return acc
                        }, {})
                        form.patchValue(defaults)
                    },
                })
            }}
            tabs={sections[sectionId]?.tabs || {}}
            editorView={sections[sectionId]?.editor_view || 'form'}
            showTabularSearch={true}
            initialSection={initialTab}
        />,
        {
            view: 'modal',
            width:
                sections[sectionId]?.editor_view === 'tabular' ? 'large' : 'small',
        }
    )
}

export const useOpenSettingsSection = () => {
    const sections: Record<string, ISettingsSection> = useSelect(
        (select) => select(store).getOptions(),
        []
    )
    const { setOptions, setToastNotification } = useDispatch(store)
    const sidebar = useSidebar()
    const { show: showConfirmation } = useConfirmationPopup()

    return useCallback(
        (
            sectionId: string,
            initialTab?: string,
            fieldOverrides?: Record<string, string>
        ) => {
            const section = sections[sectionId]
            if (!section) return
            openSettingsSectionInModal(
                sectionId,
                section,
                sections,
                sidebar,
                setOptions,
                setToastNotification,
                showConfirmation,
                initialTab,
                fieldOverrides
            )
        },
        [
            sections,
            sidebar,
            setOptions,
            setToastNotification,
            showConfirmation,
        ]
    )
}

export const buildSettingsSections = () => {
    const sections: Record<string, ISettingsSection> = useSelect(
        (select) => select(store).getOptions(),
        []
    )
    const formattedSections = Object.values(sections)
    const { setOptions, setToastNotification } = useDispatch(store)
    const { plugin_url } = usePreset()
    const featureDisplayConfig = useFeatureDisplayConfig()
    const sidebar = useSidebar()
    const { show: showConfirmation } = useConfirmationPopup()

    const openSettings = (section: string) => {
        const sectionData = sections[section]
        if (!sectionData) return
        openSettingsSectionInModal(
            section,
            sectionData,
            sections,
            sidebar,
            setOptions,
            setToastNotification,
            showConfirmation
        )
    }

    return formattedSections
        .filter(({ required_plan }) => {
            if (!required_plan) {
                return true
            }

            return !featureDisplayConfig.hide_fields
        })
        .map(
        ({ id, icon, title, description, required_plan }) => {
            return (
                <div
                    key={id}
                    id={id}
                    className="wbk_settings__section"
                    onClick={() => openSettings(id)}
                >
                    {required_plan && (
                        <ProFeatuerWrapper requiredPlans={[required_plan]} />
                    )}
                    {plugin_url && icon && (
                        <div className="wbk_settings__icon">
                            <img
                                src={
                                    String(plugin_url) +
                                    `/public/images/settings/${icon}.svg`
                                }
                                alt={title}
                                className="wbk_settings__icon"
                            />
                        </div>
                    )}
                    <h2 className="wbk_settings__title">{title}</h2>
                    {description && (
                        <p className="wbk_settings__description">{description}</p>
                    )}

                    <div className="wbk_settings__actions">
                        <button>
                            {__('View Settings', 'webba-booking-lite')}
                            <img
                                src={openSettingsIcon}
                                alt={__('View Settings', 'webba-booking-lite')}
                            />
                        </button>
                    </div>
                </div>
            )
        }
    )
}

export const buildModelFromSettingsFields = ({
    fields,
}: ISettingsModelProps) => {
    const model = {
        properties: fields.reduce((acc: any, field) => {
            acc[field.id] = {
                title: field.title,
                misc: {
                    placeholder: field.placeholder,
                    default: field.default,
                    options: field?.extra || {},
                    validators: [],
                    checkboxValue: field?.checkbox_value || 'yes',
                    subsection: field?.subsection || '',
                    tooltip: field.tooltip || '',
                    multiple: field.type === 'select_multiple',
                    required_plan: field.required_plan || '',
                    available_in_old_free: field.available_in_old_free || false,
                    sub_type: field.sub_type || '',
                    dependent_value: field.dependent_value || '',
                    searchable: field.searchable || false,
                    radio_type: field.radio_type || '',
                    column_count: field.column_count || undefined,
                    max_length: field.max_length || undefined,
                },
                tab: field.tab || '',
                dependency: field.dependency || [],
                input_type: field.type,
                type: 'string',
                editable: true,
                hidden: false,
                required: Boolean(field.required),
                value: field.value,
                default_value: field.default || '',
            }
            return acc
        }, {}),
    }

    const defaultValues = fields.reduce((acc: any, field) => {
        acc[field.id] = field.value || field.default || ''
        return acc
    }, {})

    return {
        model,
        defaultValues,
    }
}
