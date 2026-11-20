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
import { customerPackagesModel } from './model'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { __ } from '@wordpress/i18n'
import { useMemo } from 'react'
import { LockedTableSection } from '../../components/LockedTableSection/LockedTableSection'
import { SuccessMessage } from '../../components/SuccessMessage/SuccessMessage'
import noItemsImage from '../../../../public/images/bookings-empty.png'
import { formatPrice } from '../../utils/currency'
import { GrantPackageForm } from './GrantPackageForm/GrantPackageForm'
import { wbkFormat } from '../../components/Form/utils/dateTime'
import { StatusCell } from '../../components/WebbaDataTable/cells/Status/Status'
import { CustomerPackageDetail } from '../../components/WebbaDataTable/cells/CustomerPackageDetail/CustomerPackageDetail'

const form = createFormFromModel(customerPackagesModel)
const formSections = createFormMenuSectionsFromModel({
    model: customerPackagesModel,
    form,
    modelName: 'customer_packages',
})

const packageStatusOptions: Record<string, string> = {
    active: __('Active', 'webba-booking-lite'),
    exhausted: __('Exhausted', 'webba-booking-lite'),
    expired: __('Expired', 'webba-booking-lite'),
    cancelled: __('Cancelled', 'webba-booking-lite'),
    suspended: __('Suspended', 'webba-booking-lite'),
}

const formatDateTimeCell = (
    value: unknown,
    dateFormat?: string,
    timeFormat?: string,
    timezone?: string
) => {
    const numeric = Number(value)
    if (!value || !Number.isFinite(numeric) || numeric <= 0) {
        return '—'
    }

    try {
        const date = wbkFormat(
            numeric,
            dateFormat || 'dd/mm/yyyy',
            timezone || 'UTC'
        )
        const time = wbkFormat(
            numeric,
            timeFormat || 'HH:mm',
            timezone || 'UTC'
        )
        return (
            <div className="wbk_table__noWrapContainer">
                <p className="wbk_table__rowItemTitle">{date}</p>
                <p className="wbk_table__rowItemContent">{time}</p>
            </div>
        )
    } catch {
        return String(value)
    }
}

export const CustomerPackagesScreen = () => {
    const { deleteItems, setToastNotification } = useDispatch(store)
    const { customerPackages, isLoading } = useSelect(
        (select) => ({
            customerPackages: select(store).getItems('customer_packages'),
            isLoading: select(store).getLoadingState('customer_packages'),
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
            generateColumnDefsFromModel(customerPackagesModel, {
                amount_paid: {
                    cell: ({ cell }) => {
                        const amount = Number(cell.row.original.amount_paid)
                        return amount > 0
                            ? formatPrice(
                                  amount,
                                  settings?.price_format,
                                  settings?.price_separator,
                                  settings?.price_fractional
                              )
                            : __('Free', 'webba-booking-lite')
                    },
                },
                status: {
                    cell: (ctx) => (
                        <StatusCell
                            {...ctx}
                            collectionName="customer_packages"
                            options={packageStatusOptions}
                        />
                    ),
                },
                expires_at: {
                    cell: ({ cell }) =>
                        formatDateTimeCell(
                            cell.row.original.expires_at,
                            settings?.date_format,
                            settings?.time_format,
                            settings?.timezone
                        ),
                },
                purchased_at: {
                    cell: ({ cell }) =>
                        formatDateTimeCell(
                            cell.row.original.purchased_at,
                            settings?.date_format,
                            settings?.time_format,
                            settings?.timezone
                        ),
                },
                activated_at: {
                    cell: ({ cell }) =>
                        formatDateTimeCell(
                            cell.row.original.activated_at,
                            settings?.date_format,
                            settings?.time_format,
                            settings?.timezone
                        ),
                },
            }),
        [settings]
    )

    const table = useWbkTable({
        columns,
        data: customerPackages,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderMenu: ({ cell }) => {
            const { onDelete, onSubmit } = getCellActions({
                cell,
                collectionName: 'customer_packages',
            })

            return (
                <Menu
                    onDelete={onDelete}
                    onDuplicate={() => {}}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                name={__(
                                    'Edit customer package',
                                    'webba-booking-lite'
                                )}
                                id="edit-customer-package-form"
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
                            />
                        )
                    }}
                />
            )
        },
        renderExpandableRow: CustomerPackageDetail,
    })

    const onDeleteSelected = async () => {
        const selectedRowsIds = table
            .getSelectedRowModel()
            .rows.map((row) => row.original.id)

        if (!selectedRowsIds.length) {
            return
        }

        await deleteItems('customer_packages', selectedRowsIds)
    }

    return (
        <>
            <LockedTableSection
                isLocked={!isAvailable}
                requiredPlans={requiredPlans}
                featureKey="packages"
            >
                <Table
                    title={__('Customer packages', 'webba-booking-lite')}
                    addButtonTitle={__('Grant package', 'webba-booking-lite')}
                    description={__(
                        'View and manage purchased or granted visit packages.',
                        'webba-booking-lite'
                    )}
                    table={table}
                    loading={isLoading}
                    onDeleteSelected={onDeleteSelected}
                    onAdd={() =>
                        sidebar.open(
                            <GrantPackageForm onDone={() => sidebar.close()} />
                        )
                    }
                    noItemsImageUrl={noItemsImage}
                />
            </LockedTableSection>
            <SuccessMessage />
        </>
    )
}
