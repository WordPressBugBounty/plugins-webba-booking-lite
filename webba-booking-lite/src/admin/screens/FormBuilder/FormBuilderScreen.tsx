import { FormBuilder } from '../../components/FormBuilder/FormBuilder'
import { generateColumnDefsFromModel } from '../../components/WebbaDataTable/utils'
import { formsModel } from './model'
import { safeParse } from '../../components/Form/utils/utils'
import { useDispatch, useSelect } from '@wordpress/data'
import { store, store_name } from '../../../store/backend'
import { useSidebar } from '../../components/Sidebar/SidebarContext'
import { useWbkTable } from '../../components/WebbaDataTable/hooks/useWbkTable'
import { getCellActions } from '../../components/WebbaDataTable/helpers/getCellActions'
import { Menu } from '../../components/WebbaDataTable/Menu'
import { __ } from '@wordpress/i18n'
import { Table } from '../../components/WebbaDataTable/Table'
import { useMemo } from 'react'
import './FormBuilderScreen.scss'
import { SuccessMessage } from '../../components/SuccessMessage/SuccessMessage'
import noItemsImage from '../../../../public/images/bookings-empty.png'
import { ProFeatureBanner } from '../../components/ProFeatureBanner/ProFeatureBanner'

const columns = generateColumnDefsFromModel(formsModel)

const FORM_BUILDER_REQUIRED_PLANS = [
    'standard',
    'premium',
    'pro',
    'proextended',
]

export const FormBuilderScreen = () => {
    const { deleteItems, addItem, setToastNotification } = useDispatch(store)
    const sidebar = useSidebar()

    const { forms, isLoading } = useSelect(
        (select) => ({
            forms: select(store).getItems('forms'),
            isLoading: select(store).getLoadingState('forms'),
        }),
        []
    )

    const { settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )

    const { plan_map } = useSelect((select) => select(store).getPreset(), [])
    const isFormBuilderAvailable = useMemo(
        () =>
            plan_map &&
            FORM_BUILDER_REQUIRED_PLANS.some((plan) => plan_map[plan]),
        [plan_map]
    )

    const openUpgradePanel = () => {
        sidebar.open(
            <ProFeatureBanner
                featureKey="forms"
                requiredPlans={FORM_BUILDER_REQUIRED_PLANS}
                onClose={sidebar.close}
            />,
            { width: 'medium', view: 'modal' }
        )
    }

    const openFormBuilder = ({
        onSave,
        initialState,
        buttonTitle,
        allowAddField = true,
        allowDeleteFields = true,
    }: {
        onSave: (data: any) => void
        initialState?: {
            name: string
            fields: any[]
        }
        buttonTitle: string
        allowAddField?: boolean
        allowDeleteFields?: boolean
    }) => {
        sidebar.open(
            <FormBuilder
                onSave={onSave}
                initialState={initialState}
                buttonTitle={buttonTitle}
                allowAddField={allowAddField}
                allowDeleteFields={allowDeleteFields}
            />
        )
    }

    const table = useWbkTable({
        columns,
        data: forms,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderMenu: ({ cell }) => {
            const { onDelete, onDuplicate, onSubmit } = getCellActions({
                cell,
                collectionName: 'forms',
            })
            const isDefault = cell.row.original?.is_default === 'yes'
            const canCustomizeOnly = !isFormBuilderAvailable && isDefault

            return (
                <Menu
                    collectionName="forms"
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        if (!isFormBuilderAvailable && !isDefault) {
                            openUpgradePanel()
                            return
                        }

                        const { value } = safeParse(cell.row.original.fields)

                        if (value) {
                            openFormBuilder({
                                onSave: (data) => {
                                    try {
                                        let fieldsToSave = data.fields

                                        if (typeof fieldsToSave === 'string') {
                                            try {
                                                fieldsToSave =
                                                    JSON.parse(fieldsToSave)
                                            } catch (e) {
                                                console.error(
                                                    'Fields already stringified but invalid JSON:',
                                                    e
                                                )
                                            }
                                        }

                                        const fieldsJson =
                                            JSON.stringify(fieldsToSave)

                                        JSON.parse(fieldsJson)

                                        onSubmit({
                                            name: data.name,
                                            fields: fieldsJson,
                                        })
                                        setToastNotification({
                                            type: 'success',
                                            message: __(
                                                'Changes were saved.',
                                                'webba-booking-lite'
                                            ),
                                        })
                                    } catch (error) {
                                        console.error(
                                            'Error saving form:',
                                            error
                                        )
                                        setToastNotification({
                                            type: 'error',
                                            message: __(
                                                'Failed to save form. Please check your field values.',
                                                'webba-booking-lite'
                                            ),
                                        })
                                    }
                                },
                                initialState: {
                                    name: cell.row.original.name,
                                    fields: value,
                                },
                                buttonTitle: __(
                                    'Save form',
                                    'webba-booking-lite'
                                ),
                                allowAddField: !canCustomizeOnly,
                                allowDeleteFields: !canCustomizeOnly,
                            })
                        }
                    }}
                />
            )
        },
    })

    const onDeleteSelected = async () => {
        const selectedRowsIds = table
            .getSelectedRowModel()
            .rows.filter((row) => row.original?.is_default != 'yes')
            .map((row) => row.original.id)

        if (!selectedRowsIds.length) {
            return
        }

        await deleteItems('forms', selectedRowsIds)
    }

    const addModelItem = async (data: any) => {
        try {
            let fieldsToSave = data.fields

            if (typeof fieldsToSave === 'string') {
                try {
                    fieldsToSave = JSON.parse(fieldsToSave)
                } catch (e) {
                    console.error(
                        'Fields already stringified but invalid JSON:',
                        e
                    )
                }
            }

            const fieldsJson = JSON.stringify(fieldsToSave)

            JSON.parse(fieldsJson)

            await addItem('forms', {
                name: data.name,
                fields: fieldsJson,
            })
        } catch (e) {
            console.error('failed to add form', e)
        }
    }

    return (
        <>
            <div className="wbk_formBuilderScreen__wrapper">
                <Table
                    title={__('Booking forms', 'webba-booking-lite')}
                    addButtonTitle={__('Add Form', 'webba-booking-lite')}
                    table={table}
                    loading={isLoading}
                    onDeleteSelected={onDeleteSelected}
                    onAdd={() => {
                        if (!isFormBuilderAvailable) {
                            openUpgradePanel()
                            return
                        }

                        openFormBuilder({
                            onSave: addModelItem,
                            buttonTitle: __(
                                'Create form',
                                'webba-booking-lite'
                            ),
                        })
                    }}
                    noItemsImageUrl={noItemsImage}
                />
            </div>
            <SuccessMessage />
        </>
    )
}
