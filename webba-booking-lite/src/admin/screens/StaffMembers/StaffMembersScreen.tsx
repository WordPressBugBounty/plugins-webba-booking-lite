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
import { staffMembersModel } from './model'
import './StaffMembersScreen.scss'
import { SuccessMessage } from '../../components/SuccessMessage/SuccessMessage'
import { FailedMessage } from '../../components/FailedMessage/FailedMessage'
import { isForbidden } from '../../utils/errors'
import { ServiceNames } from '../../components/WebbaDataTable/cells/ServiceNames/ServiceNames'
import { LocationNames } from '../../components/WebbaDataTable/cells/LocationNames/LocationNames'
import { ServiceImageCell } from '../../components/WebbaDataTable/cells/ServiceImageCell/ServiceImageCell'
import { ProFeatuerWrapper } from '../../components/ProFeatuerWrapper/ProFeatuerWrapper'


export const StaffMembersScreen = () => {
    const columns = generateColumnDefsFromModel(staffMembersModel, {
        photo: {
            cell: ServiceImageCell
        },
        services: {
            cell: ServiceNames
        },
        locations: {
            cell: LocationNames
        }
    })

    const form = createFormFromModel(staffMembersModel)

    const formSections = createFormMenuSectionsFromModel({
        model: staffMembersModel,
        form,
        modelName: 'staff_members',
    })

    const { deleteItems, addItem, setToastNotification } = useDispatch(store)
    const { staffMembers, isLoading } = useSelect(
        (select) => ({
            staffMembers: select(store).getItems('staff_members'),
            isLoading: select(store).getLoading(),
        }),
        []
    )
    const sidebar = useSidebar()
    const { plugin_url, settings, plan_map } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const isProPlan = plan_map && ['premium', 'pro'].some((plan) => plan_map[plan] === true)

    const table = useWbkTable({
        columns,
        data: staffMembers,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderMenu: ({ cell }) => {
            const { onDelete, onDuplicate, onSubmit } = getCellActions({
                cell,
                collectionName: 'staff_members',
            })

            return (
                <Menu
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                name={__('Edit Staff Member', 'webba-booking-lite')}
                                id="edit-staff-member-form"
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

        await deleteItems('staff_members', selectedRowsIds)
    }

    const addModelItem = async (data: any) => {
        try {
            await addItem('staff_members', data)
        } catch (e) {
            console.error('failed to add staff member', e)
        }
    }

    return (
        <>
            <div className="wbk_staff_members_screen">
                {!isProPlan && <ProFeatuerWrapper requiredPlans={['pro']} />}
                <Table
                    title={__('Staff Members', 'webba-booking-lite')}
                    addButtonTitle={__('Add staff member', 'webba-booking-lite')}
                    table={table}
                    loading={isLoading}
                    onDeleteSelected={onDeleteSelected}
                    onAdd={() =>
                        sidebar.open(
                            <Form
                                name={__('Add staff member', 'webba-booking-lite')}
                                id="add-staff-member-form"
                                form={form}
                                sections={formSections}
                                onSubmit={async (data) => {
                                    await addModelItem(data)
                                    sidebar.close()
                                }}
                                tooltipMode='description'
                            />
                        )
                    }
                    noItemsImageUrl={
                        plugin_url + '/public/images/bookings-empty.png'
                    }
                    isItemsForbidden={isForbidden(staffMembers)}
                />
            </div>
            <SuccessMessage />
            <FailedMessage />
        </>
    )
}

