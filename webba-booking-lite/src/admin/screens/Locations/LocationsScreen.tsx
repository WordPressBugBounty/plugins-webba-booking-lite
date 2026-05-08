import { useDispatch, useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { store, store_name } from '../../../store/backend'
import { Form } from '../../components/Form/Form'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { createFormMenuSectionsFromModel } from '../../components/Form/utils/utils'
import { useSidebar } from '../../components/Sidebar/SidebarContext'
import { getCellActions } from '../../components/WebbaDataTable/helpers/getCellActions'
import { useWbkTable } from '../../components/WebbaDataTable/hooks/useWbkTable'
import { Menu } from '../../components/WebbaDataTable/Menu'
import { Table } from '../../components/WebbaDataTable/Table'
import { generateColumnDefsFromModel } from '../../components/WebbaDataTable/utils'
import { locationsModel } from './model'
import './LocationsScreen.scss'
import { SuccessMessage } from '../../components/SuccessMessage/SuccessMessage'
import { FailedMessage } from '../../components/FailedMessage/FailedMessage'
import { isForbidden } from '../../utils/errors'
import { ProFeatuerWrapper } from '../../components/ProFeatuerWrapper/ProFeatuerWrapper'

export const LocationsScreen = () => {
    const { plugin_url, settings, staff_members, services, plan_map } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const isProPlan = plan_map && ['premium', 'pro'].some((plan) => plan_map[plan] === true)
    const columns = generateColumnDefsFromModel(locationsModel, {}, {
        services: {
            header: __('Services', 'webba-booking-lite'),
            cell: ({ cell }) => services && services.filter(({ locations }: any) => locations?.length > 0 && locations.includes(cell.row.original.id)).map(({ label }: any) => label).join(', ')
        },
        staff_members: {
            header: __('Staff members', 'webba-booking-lite'),
            cell: ({ cell }) => staff_members && staff_members.filter(({ locations }: any) => locations?.length > 0 && locations.includes(Number(cell.row.original.id))).map(({ label }: any) => label).join(', ')
        }
    })

    const form = createFormFromModel(locationsModel)

    const formSections = createFormMenuSectionsFromModel({
        model: locationsModel,
        form,
        modelName: 'locations',
    })

    const { deleteItems, addItem, setToastNotification } = useDispatch(store)
    const { locations, isLoading } = useSelect(
        (select) => ({
            locations: select(store).getItems('locations'),
            isLoading: select(store).getLoading(),
        }),
        []
    )
    const sidebar = useSidebar()

    const table = useWbkTable({
        columns,
        data: locations,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderMenu: ({ cell }) => {
            const { onDelete, onDuplicate, onSubmit } = getCellActions({
                cell,
                collectionName: 'locations',
            })

            return (
                <Menu
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                name={__('Edit Location', 'webba-booking-lite')}
                                id="edit-location-form"
                                form={form}
                                defaultValue={cell.row.original}
                                sections={formSections}
                                onSubmit={async (data) => {
                                    await onSubmit(data)
                                    setToastNotification({
                                        type: 'success',
                                        message: __(
                                            'Changes were saved.',
                                            'webba-booking-lite'
                                        ),
                                    })
                                    sidebar.close()
                                }}
                                onDelete={async () => {
                                    await onDelete()
                                    sidebar.close()
                                }}
                                onDuplicate={async () => {
                                    await onDuplicate()
                                    sidebar.close()
                                }}
                                tooltipMode='description'
                            />
                        )
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

        await deleteItems('locations', selectedRowsIds)
    }

    const addModelItem = async (data: any) => {
        try {
            await addItem('locations', data)
        } catch (e) {
            console.error('failed to add location', e)
        }
    }

    return (
        <>
            <div className="wbk_locations_screen">
                {!isProPlan && <ProFeatuerWrapper requiredPlans={['pro']} />}
                <Table
                    title={__('Locations', 'webba-booking-lite')}
                    addButtonTitle={__('Add location', 'webba-booking-lite')}
                    table={table}
                    loading={isLoading}
                    onDeleteSelected={onDeleteSelected}
                    onAdd={() =>
                        sidebar.open(
                            <Form
                                tooltipMode='description'
                                name={__('Add location', 'webba-booking-lite')}
                                id="add-location-form"
                                form={form}
                                sections={formSections}
                                onSubmit={async (data) => {
                                    await addModelItem(data)
                                    sidebar.close()
                                }}
                            />
                        )
                    }
                    noItemsImageUrl={
                        plugin_url + '/public/images/bookings-empty.png'
                    }
                    isItemsForbidden={isForbidden(locations)}
                />
            </div>
            <SuccessMessage />
            <FailedMessage />
        </>
    )
}

