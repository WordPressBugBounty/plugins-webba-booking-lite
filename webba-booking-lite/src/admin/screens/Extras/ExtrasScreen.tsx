import { useDispatch, useSelect } from '@wordpress/data'
import { store, store_name } from '../../../store/backend'
import { Form } from '../../components/Form/Form'
import {
    createFormMenuSectionsFromModel,
} from '../../components/Form/utils/utils'
import { useSidebar } from '../../components/Sidebar/SidebarContext'
import { getCellActions, syncConnectedTables } from '../../components/WebbaDataTable/helpers/getCellActions'
import { useWbkTable } from '../../components/WebbaDataTable/hooks/useWbkTable'
import { Menu } from '../../components/WebbaDataTable/Menu'
import { Table } from '../../components/WebbaDataTable/Table'
import { generateColumnDefsFromModel, removePrefixesFromModelFields } from '../../components/WebbaDataTable/utils'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { __ } from '@wordpress/i18n'
import { useMemo } from 'react'
import './ExtrasScreen.scss'
import { ProFeatuerWrapper } from '../../components/ProFeatuerWrapper/ProFeatuerWrapper'
import { SuccessMessage } from '../../components/SuccessMessage/SuccessMessage'
import noItemsImage from '../../../../public/images/bookings-empty.png'
import extrasModelRaw from '../../../schemas/extras.json'
import { ServiceImageCell } from '../../components/WebbaDataTable/cells/ServiceImageCell/ServiceImageCell'
import { wbkFormatPrice } from '../../../frontend/providers/BookingFormProvider/utils'


const extrasModel = removePrefixesFromModelFields(extrasModelRaw, 'extra_')
const columns = generateColumnDefsFromModel(extrasModel, {
    image: {
        cell: ServiceImageCell
    },
    price: {
        cell: ({ cell }) => {
            return wbkFormatPrice(cell.row.original.price, '$#price')
        }
    }
})

const form = createFormFromModel(extrasModel)

const formSections = createFormMenuSectionsFromModel({
    model: extrasModel,
    form,
    modelName: 'extras',
})

export const ExtrasScreen = () => {
    const { deleteItems, addItem, setToastNotification } = useDispatch(store)
    const { extras, isLoading } = useSelect(
        (select) => ({
            extras: select(store).getItems('extras'),
            isLoading: select(store).getLoadingState('extras'),
        }),
        []
    )
    const sidebar = useSidebar()
    const { plugin_url, settings, plan_map } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const requiredPlans = ['premium', 'pro']
    const isExtrasAvailable = useMemo(
        () => plan_map && requiredPlans.some((plan) => plan_map[plan] === true),
        [requiredPlans, plan_map]
    )

    const table = useWbkTable({
        columns,
        data: extras,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderMenu: ({ cell }) => {
            const { onDelete, onDuplicate, onSubmit } = getCellActions({
                cell,
                collectionName: 'extras',
            })

            return (
                <Menu
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                name={__('Edit Extra', 'webba-booking-lite')}
                                id="edit-extra-form"
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
                                }}
                                onDelete={async () => {
                                    await onDelete()
                                    sidebar.close()
                                }}
                                onDuplicate={async () => {
                                    await onDuplicate()
                                    sidebar.close()
                                }}
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

        await deleteItems('extras', selectedRowsIds)
    }

    const addModelItem = async (data: any) => {
        try {
            const response = await addItem('extras', data)

            const extraServiceIds = response?.services ?? response?.extra_services
            if (extraServiceIds !== undefined) {
                await syncConnectedTables(
                    response.id,
                    extraServiceIds,
                    'services',
                    'extras'
                )
            }

            const extraUnitIds = response?.units ?? response?.extra_units
            if (extraUnitIds !== undefined) {
                await syncConnectedTables(
                    response.id,
                    extraUnitIds,
                    'units',
                    'extras'
                )
            }

            return response
        } catch (e) {
            console.error('failed to add extra', e)
        }
    }

    return (
        <>
            <div className="wbk_extrasScreen__wrapper">
                {!isExtrasAvailable && (
                    <ProFeatuerWrapper requiredPlans={['premium', 'pro']} />
                )}
                <Table
                    title={__('Extras', 'webba-booking-lite')}
                    addButtonTitle={__('Add extra', 'webba-booking-lite')}
                    description={__('Enhance your booking by adding optional services or equipment to your service/rental. Your customers will be able to add these extras to their reservation during the booking process', 'webba-booking-lite')}
                    table={table}
                    loading={isLoading}
                    onDeleteSelected={onDeleteSelected}
                    onAdd={() =>
                        sidebar.open(
                            <Form
                                name={__('Add extra', 'webba-booking-lite')}
                                id="add-extra-form"
                                form={form}
                                sections={formSections}
                                onSubmit={async (data) => {
                                    return await addModelItem(data)
                                }}
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
