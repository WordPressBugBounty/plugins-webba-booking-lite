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
import { useConfirmationPopup } from '../../ConfirmationPopup/ConfirmationPopupContext'

const openSettingsSectionInModal = (
    sectionId: string,
    section: ISettingsSection,
    sections: Record<string, ISettingsSection>,
    sidebar: ReturnType<typeof useSidebar>,
    setOptions: (section: string, data: any) => Promise<void>,
    setToastNotification: (payload: { type: string; message: string }) => void,
    showConfirmation: (data: any) => void
) => {
    const { fields, title, sections: subsectionTitles } = section
    const { model } = buildModelFromSettingsFields({ fields })
    const form = createFormFromModel(model)
    const menuSections = createFormMenuSectionsFromModel({
        model,
        form,
        modelName: 'settings',
    })
    const storedValues = fields.reduce((acc: any, field) => {
        acc[field.id] = field.value
        return acc
    }, {})

    sidebar.open(
        <Form
            name={title}
            id="edit-option-form"
            form={form}
            sections={menuSections}
            onSubmit={async (data) => {
                await setOptions(sectionId, data)
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
        (sectionId: string) => {
            const section = sections[sectionId]
            if (!section) return
            openSettingsSectionInModal(
                sectionId,
                section,
                sections,
                sidebar,
                setOptions,
                setToastNotification,
                showConfirmation
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

    return formattedSections.map(
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
                    sub_type: field.sub_type || '',
                    dependent_value: field.dependent_value || '',
                    searchable: field.searchable || false,
                },
                tab: field.tab || '',
                dependency: field.dependency || [],
                input_type: field.type,
                type: 'string',
                editable: true,
                hidden: false,
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
