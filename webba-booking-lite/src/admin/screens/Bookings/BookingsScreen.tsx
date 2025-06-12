import {
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
} from '@tanstack/react-table'
import { select, useDispatch, useSelect } from '@wordpress/data'
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
    minutesToText,
    removePrefixesFromModelFields,
} from '../../components/WebbaDataTable/utils'
import styles from './Bookings.module.scss'
import BookingsModel from '../../../schemas/appointments.json'
import { getCellActions } from '../../components/WebbaDataTable/helpers/getCellActions'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { __ } from '@wordpress/i18n'
import { StatusCell } from '../../components/WebbaDataTable/cells/Status/Status'
import { ServiceName } from '../../components/WebbaDataTable/cells/ServiceName/ServiceName'
import { FilterForm } from '../../components/Filter/FilterForm'
import { filterFields } from './FilterConfigs'
import { BookingDetail } from '../../components/WebbaDataTable/cells/BookingDetail/BookingDetail'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SearchField } from '../../components/Filter/Fields/SearchField/SearchField'
import { wbkFormat } from '../../components/Form/utils/dateTime'
import { FormValueFromModel } from '../../components/Form/lib/types'
import { isForbidden } from '../../utils/errors'
import { FailedMessage } from '../../components/FailedMessage/FailedMessage'
import { Button } from '../../components/Button/Button'
import iconExport from '../../../../public/images/icon-export.svg'
import apiFetch from '@wordpress/api-fetch'
import { useRoute } from '../../components/Router/useRoute'
import classNames from 'classnames'
import { BookingTime } from '../../components/WebbaDataTable/cells/BookingTime/BookingTime'
import { CustomerName } from '../../components/WebbaDataTable/cells/CustomerName/CustomerName'
import { DurationCell } from '../../components/WebbaDataTable/cells/DurationCell/DurationCell'

export const bookingsModel = removePrefixesFromModelFields(
    BookingsModel,
    'appointment_'
)

export const form = createFormFromModel(bookingsModel)

export const menuSections = createFormMenuSectionsFromModel({
    model: bookingsModel,
    form,
    modelName: 'appointments',
})

export const BookingsScreen = () => {
    const { deleteItems, addItem } = useDispatch(store)
    const sidebar = useSidebar()
    const { plugin_url, settings, is_pro } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const { setRoute, route } = useRoute()
    const [downloadPending, setDownloadPending] = useState(false)

    // @ts-ignore
    const loading = useSelect((select) => select(store_name).getLoading(), [])
    const bookings = useSelect(
        // @ts-ignore
        (select) => select(store_name).getItems('appointments'),
        []
    )
    const [search, setSearch] = useState('')
    const customGlobalFilterFn = (
        row: any,
        columnId: any,
        filterValue: any
    ) => {
        if (!filterValue) return true
        return Object.values(row.original).some((value) => {
            if (typeof value === 'string' || typeof value === 'number') {
                return String(value)
                    .toLowerCase()
                    .includes(String(filterValue).toLowerCase())
            }
            return false
        })
    }

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
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onCancel={onCancel}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                id="edit-booking-form"
                                name={__('Edit Booking', 'webba-booking-lite')}
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
        globalFilterFn: customGlobalFilterFn,
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

    const addBooking = async (data: any) => {
        try {
            await addItem('appointments', data)
        } catch (e) {
            console.error('failed to add booking', e)
        }
    }

    const filterForm = <FilterForm fields={filterFields} model="appointments" />
    const searchField = (
        <SearchField name="search" onChange={setSearch} label="Search" />
    )

    const exportCSV = useCallback(async () => {
        setDownloadPending(true)
        const { url }: { url: string } = await apiFetch({
            path: 'wbk/v1/csv-export',
            method: 'POST',
            data: {
                filters: select(store_name).getFilters('appointments'),
            },
        })
        setDownloadPending(false)
        const link = document.createElement('a')
        link.href = url
        link.click()
    }, [])

    const exportButton = useMemo(() => {
        return (
            <Button
                onClick={exportCSV}
                type="no-border"
                className={styles.exportButton}
                isLoading={downloadPending}
            >
                {__('Export to CSV file', 'webba-booking-lite')}
                <img
                    src={iconExport}
                    alt={__('Export icon', 'webba-booking-lite')}
                />
            </Button>
        )
    }, [downloadPending])

    return (
        <TableProvider table={dynamicTable}>
            <Table
                title={__('Bookings', 'webba-booking-lite')}
                collectionName="appointments"
                addButtonTitle={__('Add booking', 'webba-booking-lite')}
                table={dynamicTable}
                loading={loading}
                onDeleteSelected={onDeleteSelected}
                onAdd={() =>
                    sidebar.open(
                        <Form
                            id="add-booking-form"
                            name={__('Add Booking', 'webba-booking-lite')}
                            form={form}
                            sections={menuSections}
                            onSubmit={async (data) => {
                                await addBooking(data)
                                sidebar.close()
                            }}
                            defaultValue={
                                {} as FormValueFromModel<typeof bookingsModel>
                            }
                        />
                    )
                }
                noItemsImageUrl={
                    plugin_url + '/public/images/bookings-empty.png'
                }
                filter={filterForm}
                search={searchField}
                isItemsForbidden={isForbidden(bookings)}
                exportButton={is_pro && exportButton}
                forcePermission={true}
            />
            <FailedMessage />
            <div
                className={classNames(
                    styles.buttonNavigation,
                    styles.red,
                    styles.right
                )}
                onClick={() => setRoute('cancelled-bookings')}
            >
                {__('Cancelled Bookings (legacy)', 'webba-booking-lite')}
                &nbsp;&#8594;
            </div>
        </TableProvider>
    )
}
