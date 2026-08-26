import { useDispatch } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { useMemo } from 'react'
import { store } from '../../../store/backend'
import { FormBuilder } from '../FormBuilder/FormBuilder'
import { Form } from '../Form/Form'
import { createFormFromModel } from '../Form/lib/createForm'
import { createFormMenuSectionsFromModel } from '../Form/utils/utils'
import { SidebarContextValue } from '../Sidebar/types'
import { syncConnectedTables } from '../WebbaDataTable/helpers/getCellActions'
import { getAddableModelConfig } from './modelRegistry'
import { AddModelItemPopupProps } from './types'

const stringifyFormFields = (fields: unknown) => {
    let fieldsToSave = fields

    if (typeof fieldsToSave === 'string') {
        try {
            fieldsToSave = JSON.parse(fieldsToSave)
        } catch (e) {
            console.error('Fields already stringified but invalid JSON:', e)
        }
    }

    const fieldsJson = JSON.stringify(fieldsToSave)
    JSON.parse(fieldsJson)

    return fieldsJson
}

const syncCreatedItemRelations = async (
    modelName: string,
    item: Record<string, any>
) => {
    if (!item?.id) {
        return
    }

    if (modelName === 'extras') {
        const extraServiceIds = item.services ?? item.extra_services
        if (extraServiceIds !== undefined) {
            await syncConnectedTables(
                item.id,
                extraServiceIds,
                'services',
                'extras'
            )
        }

        const extraUnitIds = item.units ?? item.extra_units
        if (extraUnitIds !== undefined) {
            await syncConnectedTables(item.id, extraUnitIds, 'units', 'extras')
        }
    }

    if (modelName === 'services') {
        if (item.categories !== undefined) {
            await syncConnectedTables(
                item.id,
                item.categories,
                'service_categories',
                'list'
            )
        }

        const serviceExtras = item.extras ?? item.service_extras
        if (serviceExtras !== undefined) {
            await syncConnectedTables(
                item.id,
                serviceExtras,
                'extras',
                'services'
            )
        }
    }

    if (modelName === 'units') {
        const unitExtras = item.extras ?? item.unit_extras
        if (unitExtras !== undefined) {
            await syncConnectedTables(item.id, unitExtras, 'extras', 'units')
        }
    }

    if (modelName === 'service_categories' && item.list !== undefined) {
        await syncConnectedTables(item.id, item.list, 'services', 'categories')
    }
}

export const AddModelItemPopup = ({
    modelName,
    onCreated,
}: AddModelItemPopupProps) => {
    const config = getAddableModelConfig(modelName)
    const { addItem, setToastNotification } = useDispatch(store)
    const form = useMemo(
        () =>
            config?.model && config.editor === 'form'
                ? createFormFromModel(config.model)
                : null,
        [config]
    )
    const sections = useMemo(() => {
        if (!config?.model || !form) {
            return {}
        }

        return createFormMenuSectionsFromModel({
            model: config.model,
            form,
            modelName: config.modelName,
        })
    }, [config, form])

    const handleCreated = (item: Record<string, any>) => {
        onCreated(item)
        setToastNotification({
            type: 'success',
            message: __('Changes were saved.', 'webba-booking-lite'),
        })
    }

    if (!config) {
        return null
    }

    if (config.editor === 'formBuilder') {
        return (
            <FormBuilder
                buttonTitle={__('Create form', 'webba-booking-lite')}
                onSave={async (data) => {
                    try {
                        const response = await addItem('forms', {
                            name: data.name,
                            fields: stringifyFormFields(data.fields),
                        })

                        if (response?.id) {
                            handleCreated(response)
                        }
                    } catch (e) {
                        console.error('failed to add form', e)
                    }
                }}
            />
        )
    }

    if (!form) {
        return null
    }

    return (
        <Form
            name={config.title}
            id={config.formId}
            form={form}
            sections={sections}
            tooltipMode="description"
            onSubmit={async (data) => {
                try {
                    const response = await addItem(config.modelName, data)

                    if (response?.id) {
                        await syncCreatedItemRelations(
                            config.modelName,
                            response
                        )
                        handleCreated(response)
                    }

                    return response
                } catch (e) {
                    console.error(`failed to add ${config.modelName}`, e)
                }
            }}
        />
    )
}

export const openAddModelItemPopup = (
    sidebar: SidebarContextValue,
    props: AddModelItemPopupProps
) => {
    const config = getAddableModelConfig(props.modelName)

    sidebar.open(<AddModelItemPopup {...props} />, {
        nested: true,
        width: config?.width || 'small',
    })
}
