import { FormBuilder } from '../../components/FormBuilder/FormBuilder'
import { generateColumnDefsFromModel } from '../../components/WebbaDataTable/utils'
import { formsModel } from './model'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import {
    createFormMenuSectionsFromModel,
    safeParse,
} from '../../components/Form/utils/utils'
import { useDispatch, useSelect } from '@wordpress/data'
import { store, store_name } from '../../../store/backend'
import { useSidebar } from '../../components/Sidebar/SidebarContext'
import { useWbkTable } from '../../components/WebbaDataTable/hooks/useWbkTable'
import { getCellActions } from '../../components/WebbaDataTable/helpers/getCellActions'
import { Menu } from '../../components/WebbaDataTable/Menu'
import { Form } from '../../components/Form/Form'
import { __ } from '@wordpress/i18n'
import { Table } from '../../components/WebbaDataTable/Table'
import { useMemo } from 'react'
import { ProFeatuerWrapper } from '../../components/ProFeatuerWrapper/ProFeatuerWrapper'
import './FormBuilderScreen.scss'
import { SuccessMessage } from '../../components/SuccessMessage/SuccessMessage'
import noItemsImage from '../../../../public/images/bookings-empty.png'

const columns = generateColumnDefsFromModel(formsModel)

const form = createFormFromModel(formsModel)

const formSections = createFormMenuSectionsFromModel({
    model: formsModel,
    form,
    modelName: 'forms',
})

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

    const { plugin_url, settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )

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

            return (
                <Menu
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        const { value } = safeParse(cell.row.original.fields)

                        if (value) {
                            sidebar.open(
                                <FormBuilder
                                    onSave={(data) => {
                                        try {
                                            let fieldsToSave = data.fields
                                            
                                            if (typeof fieldsToSave === 'string') {
                                                try {
                                                    fieldsToSave = JSON.parse(fieldsToSave)
                                                } catch (e) {
                                                    console.error('Fields already stringified but invalid JSON:', e)
                                                }
                                            }
                                            
                                            const fieldsJson = JSON.stringify(fieldsToSave)
                                            
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
                                            console.error('Error saving form:', error)
                                            setToastNotification({
                                                type: 'error',
                                                message: __(
                                                    'Failed to save form. Please check your field values.',
                                                    'webba-booking-lite'
                                                ),
                                            })
                                        }
                                    }}
                                    initialState={{
                                        name: cell.row.original.name,
                                        fields: value,
                                    }}
                                    buttonTitle={__(
                                        'Save form',
                                        'webba-booking-lite'
                                    )}
                                />
                            )
                        }
                    }}
                />
            )
        },
    })

    const onDeleteSelected = async () => {
        const selectedRowsIds = table
            .getSelectedRowModel()
            .rows.map((row) => row.original.id)

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
                    console.error('Fields already stringified but invalid JSON:', e)
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

    const { plan_map } = useSelect((select) => select(store).getPreset(), [])
    const requiredPlans = ['pro', 'standard', 'premium']
    const isFormBuilderAvailable = useMemo(
        () => plan_map && requiredPlans.some((plan) => plan_map[plan]),
        [plan_map, requiredPlans]
    )

    return (
        <>
            <div className="wbk_formBuilderScreen__wrapper">
                {!isFormBuilderAvailable && (
                    <ProFeatuerWrapper
                        requiredPlans={['standard', 'premium', 'pro']}
                    />
                )}
                <Table
                    title={__('Booking forms', 'webba-booking-lite')}
                    addButtonTitle={__('Add Form', 'webba-booking-lite')}
                    table={table}
                    loading={isLoading}
                    onDeleteSelected={onDeleteSelected}
                    onAdd={() =>
                        sidebar.open(
                            <FormBuilder
                                onSave={addModelItem}
                                buttonTitle={__(
                                    'Create form',
                                    'webba-booking-lite'
                                )}
                            />
                        )
                    }
                    noItemsImageUrl={
                        noItemsImage
                    }
                />
            </div>
            <SuccessMessage />
        </>
    )
}
