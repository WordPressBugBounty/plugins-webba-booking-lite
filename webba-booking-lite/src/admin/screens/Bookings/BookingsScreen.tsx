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
import iconExport from '../../../../public/images/export-arrow.png'
import apiFetch from '@wordpress/api-fetch'
import { useRoute } from '../../components/Router/useRoute'
import classNames from 'classnames'

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

    const columns = useMemo(() => {
        return generateColumnDefsFromModel(
            bookingsModel,
            {
                status: {
                    header: __('Status', 'webba-booking-lite'),
                    cell: StatusCell,
                },
                service_id: {
                    header: __('Service', 'webba-booking-lite'),
                    cell: ServiceName,
                },
            },
            {
                id: {
                    index: 0,
                    header: __('ID', 'webba-booking-lite'),
                    cell: ({ cell }) => cell.row.original.id,
                    accessorKey: 'id',
                },
                date_time: {
                    index: 1,
                    header: __('Date/Time', 'webba-booking-lite'),
                    cell: ({ cell }) =>
                        wbkFormat(
                            cell.row.original.time,
                            `${
                                settings ? settings.date_format : 'dd/mm/yyyy'
                            } ${settings ? settings.time_format : 'HH:mm'}`,
                            settings ? settings.timezone : 'UTC'
                        ),
                    accessorKey: 'time',
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
            const { onDelete, onDuplicate, onSubmit } = getCellActions({
                cell,
                collectionName: 'appointments',
            })

            return (
                <Menu
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
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
                {__('Cancelled Bookings', 'webba-booking-lite')}
                &nbsp;&#8594;
            </div>
        </TableProvider>
    )
}
