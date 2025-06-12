import { getFilteredRowModel } from '@tanstack/react-table'
import { useDispatch, useSelect } from '@wordpress/data'
import { store, store_name } from '../../../store/backend'
import { Form } from '../../components/Form/Form'
import { createFormMenuSectionsFromModel } from '../../components/Form/utils/utils'
import { useSidebar } from '../../components/Sidebar/SidebarContext'
import { TableProvider } from '../../components/WebbaDataTable/context/TableProvider'
import { useWbkTable } from '../../components/WebbaDataTable/hooks/useWbkTable'
import { Menu } from '../../components/WebbaDataTable/Menu'
import { Table } from '../../components/WebbaDataTable/Table'
import {
    generateColumnDefsFromModel,
    removePrefixesFromModelFields,
} from '../../components/WebbaDataTable/utils'
import BookingsModel from '../../../schemas/appointments.json'
import { getCellActions } from '../../components/WebbaDataTable/helpers/getCellActions'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { __ } from '@wordpress/i18n'
import { StatusCell } from '../../components/WebbaDataTable/cells/Status/Status'
import { ServiceName } from '../../components/WebbaDataTable/cells/ServiceName/ServiceName'
import { BookingDetail } from '../../components/WebbaDataTable/cells/BookingDetail/BookingDetail'
import { useMemo, useState } from 'react'
import { wbkFormat } from '../../components/Form/utils/dateTime'
import { getUnixTime } from 'date-fns'
import styles from './Dashboard.module.scss'
import helloIcon from '../../../../public/images/hello-dashboard.png'
import { CustomerName } from '../../components/WebbaDataTable/cells/CustomerName/CustomerName'
import { BookingTime } from '../../components/WebbaDataTable/cells/BookingTime/BookingTime'
import { DurationCell } from '../../components/WebbaDataTable/cells/DurationCell/DurationCell'

export const bookingsModel = removePrefixesFromModelFields(
    BookingsModel,
    'appointment_'
)

const form = createFormFromModel(bookingsModel)

const menuSections = createFormMenuSectionsFromModel({
    model: bookingsModel,
    form,
    modelName: 'appointments',
})

export const RecentBookings = () => {
    const { deleteItems, addItem } = useDispatch(store)
    const sidebar = useSidebar()
    // @ts-ignore
    const loading = useSelect((select) => select(store_name).getLoading(), [])
    const [start, end] = useMemo(
        () => [getUnixTime(new Date()) - 86400, getUnixTime(new Date())],
        []
    )

    const bookings = useSelect(
        (select) =>
            // @ts-ignore
            select(store_name).getItems('appointments', [
                {
                    name: 'appointment_created_on',
                    value: [start, end],
                },
                {
                    name: 'appointment_day',
                    ignore: true,
                },
            ]),
        []
    )
    const [search, setSearch] = useState('')
    const { settings, plugin_url } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )

    const columns = useMemo(() => {
        return generateColumnDefsFromModel(
            bookingsModel,
            {
                name: {
                    cell: CustomerName,
                },
                status: {
                    cell: StatusCell,
                },
                service_id: {
                    cell: ServiceName,
                },
            },
            {
                id: {
                    index: 0,
                    header: __('ID', 'webba-booking-lite'),
                    cell: ({ cell }) => cell.row.original.id,
                },
                time: {
                    index: 1,
                    header: __('Date/Time', 'webba-booking-lite'),
                    cell: BookingTime,
                },
                duration: {
                    index: 2,
                    header: __('Duration', 'webba-booking-lite'),
                    cell: DurationCell,
                },
                amount_paid: {
                    index: 5,
                    cell: ({ row }) => {
                        const { amount_paid, moment_price } = row.original

                        return (amount_paid && amount_paid > 0) ||
                            moment_price > 0
                            ? settings?.price_format.replace(
                                  '#price',
                                  amount_paid || 0
                              )
                            : __('Free', 'webba-booking-lite')
                    },
                },
            }
        )
    }, [settings])

    const dynamicTable = useWbkTable({
        columns,
        data: bookings,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderMenu: ({ cell }) => {
            const { onDelete, onDuplicate, onSubmit, onCancel } =
                getCellActions({
                    cell,
                    collectionName: 'appointments',
                })

            return (
                <Menu
                    collectionName="appointments"
                    onCancel={onCancel}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                id="edit-booking-form"
                                name="Edit Booking"
                                defaultValue={cell.row.original}
                                form={form}
                                sections={menuSections}
                                onSubmit={async (data) => {
                                    await onSubmit(data)
                                    sidebar.close()
                                }}
                                onDelete={async () => {
                                    await onDelete()
                                    sidebar.close()
                                }}
                                onDuplicate={onDuplicate}
                            />
                        )
                    }}
                />
            )
        },
        getFilteredRowModel: getFilteredRowModel(),
        renderExpandableRow: BookingDetail,
        state: {
            globalFilter: search,
        },
        onGlobalFilterChange: setSearch,
        globalFilterFn: 'includesString',
        filterFromLeafRows: true,
        maxLeafRowFilterDepth: 2,
    })

    const onDeleteSelected = async () => {
        const selectedRowsIds = dynamicTable
            .getSelectedRowModel()
            .rows.map((row) => row.original.id)

        if (!selectedRowsIds.length) {
            return
        }

        await deleteItems('appointments', selectedRowsIds)
    }

    return (
        <div className={styles.recentBookings}>
            <div className={styles.welcomeMessage}>
                <h2>
                    <img
                        src={helloIcon}
                        alt={__('Shaking hand', 'webba-booking-lite')}
                    />
                    {__('Hello', 'webba-booking-lite')}
                </h2>
                <p>
                    {bookings.length > 0
                        ? __(
                              `You have ${bookings.length} new bookings in the past 24 hours`,
                              'webba-booking-lite'
                          )
                        : __(
                              'No bookings in the last 24 hours',
                              'webba-booking-lite'
                          )}
                </p>
            </div>
            <TableProvider table={dynamicTable}>
                <Table
                    title={__(
                        'Bookings made in the last 24 hours',
                        'webba-booking-lite'
                    )}
                    table={dynamicTable}
                    loading={loading}
                    onDeleteSelected={onDeleteSelected}
                    noItemsImageUrl={
                        plugin_url + '/public/images/bookings-empty.png'
                    }
                />
            </TableProvider>{' '}
        </div>
    )
}
