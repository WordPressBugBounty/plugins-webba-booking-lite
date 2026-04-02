import { getCoreRowModel, getSortedRowModel } from '@tanstack/react-table'
import { useDispatch, useSelect } from '@wordpress/data'
import { store, store_name } from '../../../store/backend'
import { Form } from '../../components/Form/Form'
import {
    createEmptyObjectFromSchema,
    createFormMenuSectionsFromModel,
} from '../../components/Form/utils/utils'
import { useSidebar } from '../../components/Sidebar/SidebarContext'
import { getCellActions } from '../../components/WebbaDataTable/helpers/getCellActions'
import { useWbkTable } from '../../components/WebbaDataTable/hooks/useWbkTable'
import { Menu } from '../../components/WebbaDataTable/Menu'
import { Table } from '../../components/WebbaDataTable/Table'
import { generateColumnDefsFromModel } from '../../components/WebbaDataTable/utils'
import { couponsModel } from './model'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { __ } from '@wordpress/i18n'
import { useMemo } from 'react'
import './CouponsScreen.scss'
import { ProFeatuerWrapper } from '../../components/ProFeatuerWrapper/ProFeatuerWrapper'
import { SuccessMessage } from '../../components/SuccessMessage/SuccessMessage'
import noItemsImage from '../../../../public/images/bookings-empty.png'

const columns = generateColumnDefsFromModel(couponsModel)

const form = createFormFromModel(couponsModel)

const formSections = createFormMenuSectionsFromModel({
    model: couponsModel,
    form,
    modelName: 'coupons',
})

export const CouponsScreen = () => {
    const { deleteItems, addItem, setToastNotification } = useDispatch(store)
    const { coupons, isLoading } = useSelect(
        (select) => ({
            coupons: select(store).getItems('coupons'),
            isLoading: select(store).getLoadingState('coupons'),
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
    const isCouponsAvailable = useMemo(
        () => plan_map && requiredPlans.some((plan) => plan_map[plan] === true),
        [requiredPlans, plan_map]
    )

    const table = useWbkTable({
        columns,
        data: coupons,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderMenu: ({ cell }) => {
            const { onDelete, onDuplicate, onSubmit } = getCellActions({
                cell,
                collectionName: 'coupons',
            })

            return (
                <Menu
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                name={__('Edit Coupon', 'webba-booking-lite')}
                                id="edit-coupon-form"
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

        await deleteItems('coupons', selectedRowsIds)
    }

    const addModelItem = async (data: any) => {
        try {
            return await addItem('coupons', data)
        } catch (e) {
            console.error('failed to add coupon', e)
        }
    }

    return (
        <>
            <div className="wbk_couponsScreen__wrapper">
                {!isCouponsAvailable && (
                    <ProFeatuerWrapper requiredPlans={['premium', 'pro']} />
                )}
                <Table
                    title={__('Coupons', 'webba-booking-lite')}
                    addButtonTitle={__('Add coupon', 'webba-booking-lite')}
                    table={table}
                    loading={isLoading}
                    onDeleteSelected={onDeleteSelected}
                    onAdd={() =>
                        sidebar.open(
                            <Form
                                name={__('Add coupon', 'webba-booking-lite')}
                                id="add-coupon-form"
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
