import { useDispatch, useSelect } from '@wordpress/data'
import { store, store_name } from '../../../store/backend'
import { Form } from '../../components/Form/Form'
import { createFormMenuSectionsFromModel } from '../../components/Form/utils/utils'
import { useSidebar } from '../../components/Sidebar/SidebarContext'
import { getCellActions } from '../../components/WebbaDataTable/helpers/getCellActions'
import { useWbkTable } from '../../components/WebbaDataTable/hooks/useWbkTable'
import { Menu } from '../../components/WebbaDataTable/Menu'
import { Table } from '../../components/WebbaDataTable/Table'
import { generateColumnDefsFromModel } from '../../components/WebbaDataTable/utils'
import { packageProductsModel } from './model'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { __ } from '@wordpress/i18n'
import { useMemo } from 'react'
import { LockedTableSection } from '../../components/LockedTableSection/LockedTableSection'
import { SuccessMessage } from '../../components/SuccessMessage/SuccessMessage'
import noItemsImage from '../../../../public/images/bookings-empty.png'
import { PackageProductDetail } from '../../components/WebbaDataTable/cells/PackageProductDetail/PackageProductDetail'
import { StatusCell } from '../../components/WebbaDataTable/cells/Status/Status'
import { formatPrice } from '../../utils/currency'

const form = createFormFromModel(packageProductsModel)
const formSections = createFormMenuSectionsFromModel({
    model: packageProductsModel,
    form,
    modelName: 'package_products',
})

const packageStatusOptions: Record<string, string> = {
    draft: __('Draft', 'webba-booking-lite'),
    published: __('Published', 'webba-booking-lite'),
    archived: __('Archived', 'webba-booking-lite'),
}

export const PackageProductsScreen = () => {
    const { deleteItems, addItem, setToastNotification } = useDispatch(store)
    const { packageProducts, isLoading } = useSelect(
        (select) => ({
            packageProducts: select(store).getItems('package_products'),
            isLoading: select(store).getLoadingState('package_products'),
        }),
        []
    )
    const sidebar = useSidebar()
    const { plan_map, settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const requiredPlans = ['premium', 'pro', 'proextended']
    const isAvailable = useMemo(
        () => plan_map && requiredPlans.some((plan) => plan_map[plan] === true),
        [requiredPlans, plan_map]
    )

    const columns = useMemo(
        () =>
            generateColumnDefsFromModel(packageProductsModel, {
                price: {
                    cell: ({ cell }) =>
                        Number(cell.row.original.price) > 0
                            ? formatPrice(
                                  cell.row.original.price,
                                  settings?.price_format,
                                  settings?.price_separator,
                                  settings?.price_fractional
                              )
                            : __('Free', 'webba-booking-lite'),
                },
                status: {
                    cell: (ctx) => (
                        <StatusCell
                            {...ctx}
                            collectionName="package_products"
                            options={packageStatusOptions}
                        />
                    ),
                },
            }),
        [settings]
    )

    const table = useWbkTable({
        columns,
        data: packageProducts,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderMenu: ({ cell }) => {
            const { onDelete, onDuplicate, onSubmit } = getCellActions({
                cell,
                collectionName: 'package_products',
            })

            return (
                <Menu
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                name={__(
                                    'Edit package product',
                                    'webba-booking-lite'
                                )}
                                id="edit-package-product-form"
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
        renderExpandableRow: PackageProductDetail,
    })

    const onDeleteSelected = async () => {
        const selectedRowsIds = table
            .getSelectedRowModel()
            .rows.map((row) => row.original.id)

        if (!selectedRowsIds.length) {
            return
        }

        await deleteItems('package_products', selectedRowsIds)
    }

    const addModelItem = async (data: any) => {
        try {
            return await addItem('package_products', data)
        } catch (e) {
            console.error('failed to add package product', e)
        }
    }

    return (
        <>
            <LockedTableSection
                isLocked={!isAvailable}
                requiredPlans={requiredPlans}
                featureKey="packages"
            >
                <Table
                    title={__('Package products', 'webba-booking-lite')}
                    addButtonTitle={__(
                        'Add package product',
                        'webba-booking-lite'
                    )}
                    description={__(
                        'Create visit packages customers can purchase and redeem on bookings.',
                        'webba-booking-lite'
                    )}
                    table={table}
                    loading={isLoading}
                    onDeleteSelected={onDeleteSelected}
                    onAdd={() =>
                        sidebar.open(
                            <Form
                                name={__(
                                    'Add package product',
                                    'webba-booking-lite'
                                )}
                                id="add-package-product-form"
                                form={form}
                                sections={formSections}
                                onSubmit={async (data) => {
                                    return await addModelItem(data)
                                }}
                            />
                        )
                    }
                    noItemsImageUrl={noItemsImage}
                />
            </LockedTableSection>
            <SuccessMessage />
        </>
    )
}
