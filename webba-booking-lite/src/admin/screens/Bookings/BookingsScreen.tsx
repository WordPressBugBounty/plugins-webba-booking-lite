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
import './Bookings.scss'
import BookingsModel from '../../../schemas/appointments.json'
import { getCellActions } from '../../components/WebbaDataTable/helpers/getCellActions'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { __ } from '@wordpress/i18n'
import { StatusCell } from '../../components/WebbaDataTable/cells/Status/Status'
import { ServiceName } from '../../components/WebbaDataTable/cells/ServiceName/ServiceName'
import { FilterForm } from '../../components/Filter/FilterForm'
import { applyFiltersToFields } from '../../components/Filter/utils'
import { filterFields } from './FilterConfigs'
import { ExportCSV } from './ExportCSV'
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
import { formatPrice } from '../../utils/currency'
import { SuccessMessage } from '../../components/SuccessMessage/SuccessMessage'
import noItemsImage from '../../../../public/images/bookings-empty.png'
import { LocationNames } from '../../components/WebbaDataTable/cells/LocationNames/LocationNames'
import { UnitName } from '../../components/WebbaDataTable/cells/UnitName/UnitName'

export const bookingsModel = removePrefixesFromModelFields(
    BookingsModel,
    'appointment_'
)

const injectVirtualAppointmentFields = (model: any) => {
    const baseProperties = model?.properties || {}
    const nextProperties: Record<string, any> = {}

    Object.entries(baseProperties).forEach(([key, value]) => {
        nextProperties[key] = value

        if (key === 'day') {
            nextProperties.duration_virtual = {
                type: 'string',
                input_type: 'select',
                hidden: false,
                title: __('Duration', 'webba-booking-lite'),
                tab: '',
                misc: {
                    tooltip: __(
                        'Select duration for this unit booking.',
                        'webba-booking-lite'
                    ),
                    options: 'backend',
                    null_value: [__('Select...', 'webba-booking-lite')],
                },
                required: false,
                dependency: [['unit_id', '!=', '']],
                default_value: '',
                editable: true,
            }
        } else if (key === 'number_of_people') {
            nextProperties.available_offer_virtual = {
                type: 'string',
                input_type: 'select',
                hidden: false,
                title: __('Available offers', 'webba-booking-lite'),
                tab: '',
                misc: {
                    tooltip: __(
                        'Select one available offer for the chosen date and duration.',
                        'webba-booking-lite'
                    ),
                    options: 'backend',
                    null_value: [__('Select...', 'webba-booking-lite')],
                },
                required: false,
                dependency: [
                    ['unit_id', '!=', ''],
                    ['day', '!=', ''],
                    ['duration_virtual', '!=', ''],
                ],
                default_value: '',
                editable: true,
            }
        }
    })

    return {
        ...model,
        properties: nextProperties,
    } as any
}

const normalizeBookingPayload = (data: Record<string, any>) => {
    const minutesPerDay = 24 * 60
    const payload = { ...data }
    const durationVirtual = payload.duration_virtual
    const availableOfferVirtual = payload.available_offer_virtual

    if (
        payload.unit_id &&
        (payload.duration === undefined || payload.duration === '') &&
        durationVirtual
    ) {
        payload.duration = durationVirtual
    }

    if (
        payload.unit_id &&
        typeof availableOfferVirtual === 'string' &&
        availableOfferVirtual.includes('|')
    ) {
        const [offerStart, offerEnd] = availableOfferVirtual.split('|')
        if (offerStart) {
            payload.day = offerStart
        }
        if (offerStart && offerEnd) {
            const startDate = new Date(`${offerStart}T00:00:00`)
            const endDate = new Date(`${offerEnd}T00:00:00`)
            if (
                !Number.isNaN(startDate.getTime()) &&
                !Number.isNaN(endDate.getTime())
            ) {
                const durationInDays =
                    Math.floor(
                        (endDate.getTime() - startDate.getTime()) /
                        (24 * 60 * 60 * 1000)
                    ) + 1
                if (durationInDays > 0) {
                    payload.duration = String(durationInDays * minutesPerDay)
                }
            }
        }
    }

    // In unit mode, time field is hidden. Send midnight timestamp from selected day.
    if (
        payload.unit_id &&
        (payload.time === undefined || payload.time === '' || payload.time === null) &&
        typeof payload.day === 'string' &&
        payload.day !== ''
    ) {
        const selectedDayTimestamp = new Date(`${payload.day}T00:00:00`).getTime()
        if (!Number.isNaN(selectedDayTimestamp)) {
            payload.time = String(Math.floor(selectedDayTimestamp / 1000))
        }
    }

    delete payload.duration_virtual
    delete payload.available_offer_virtual

    return payload
}

export const BookingsScreen = () => {
    const { deleteItems, addItem, setToastNotification } = useDispatch(store)
    const sidebar = useSidebar()
    const { plugin_url, settings, plan_map, services } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const [currentFilters, setCurrentFilters] = useState<
        { name: string; value: any }[]
    >([])
    const { setRoute, route } = useRoute()
    const [downloadPending, setDownloadPending] = useState(false)

    // @ts-ignore
    const loading = useSelect(
        (select) => select(store).getLoadingState('appointments'),
        []
    )
    const bookings = useSelect(
        // @ts-ignore
        (select) => select(store_name).getItems('appointments'),
        []
    )
    const [search, setSearch] = useState('')
    const formModel = useMemo(() => {
        let model: any = JSON.parse(
            JSON.stringify(bookingsModel)
        )
        model = injectVirtualAppointmentFields(model)
        const servicesWithoutStaff = Array.isArray(services)
            ? services.filter(
                (service: any) =>
                    !Array.isArray(service.staff_members) ||
                    service.staff_members.length === 0
            )
            : []

        const staffField = model?.properties?.staff_member_id
        if (staffField) {
            staffField.required = true
            const unitModeDependency: [string, string, string] = [
                'unit_id',
                '<=',
                '0',
            ]
            if (servicesWithoutStaff.length > 0) {
                ; (staffField as any).dependency = [
                    unitModeDependency,
                    ...servicesWithoutStaff.map(
                        (service: any) =>
                            [
                                'service_id',
                                '!=',
                                String(service.id),
                            ] as [string, string, string]
                    ),
                ]
            } else {
                ; (staffField as any).dependency = [unitModeDependency]
            }
        }

        return model
    }, [services])
    const form = useMemo(() => createFormFromModel(formModel), [formModel])
    const menuSections = useMemo(
        () =>
            createFormMenuSectionsFromModel({
                model: formModel,
                form,
                modelName: 'appointments',
            }),
        [formModel, form]
    )
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
                staff_member_id: {
                    cell: ({ cell }) => {
                        const { staff_member_id } = cell.row.original
                        const staff_members = useSelect((select) => select(store).getItems('staff_members'), [])
                        return staff_members.find((staff_member: any) => staff_member.id === staff_member_id)?.name || __('Unknown', 'webba-booking-lite')
                    },
                },
                location_id: {
                    cell: LocationNames
                },
                unit_id: {
                    cell: UnitName
                }
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

                        return moment_price > 0
                            ? formatPrice(
                                amount_paid,
                                settings?.price_format,
                                settings?.price_separator,
                                settings?.price_fractional
                            )
                            : __('Free', 'webba-booking-lite')
                    },
                },
            }
        )
    }, [settings])

    const servicesInCurrentBookings = useMemo(() => {
        if (!Array.isArray(services) || !Array.isArray(bookings)) return []

        const bookedServiceIds = new Set<string>()
        bookings.forEach((booking: any) => {
            const serviceId = booking?.service_id
            if (serviceId === undefined || serviceId === null) return
            const normalizedId = String(serviceId)
            if (normalizedId !== '') {
                bookedServiceIds.add(normalizedId)
            }
        })

        return services.filter((service: any) =>
            bookedServiceIds.has(String(service?.id))
        )
    }, [services, bookings])

    const filteredColumns = useMemo(() => {
        return columns.filter((column) => {
            if (column.id === 'staff_member_id') {
                const anyServiceHasStaff = servicesInCurrentBookings.some(
                    (service: any) =>
                        Array.isArray(service.staff_members) &&
                        service.staff_members.length > 0
                )

                if (!anyServiceHasStaff) {
                    return false
                }
            } else if (column.id === 'location_id') {
                const anyServiceHasLocation = servicesInCurrentBookings.some(
                    (service: any) =>
                        Array.isArray(service.locations) &&
                        service.locations.length > 0
                )

                if (!anyServiceHasLocation) {
                    return false
                }
            }
            return true
        })
    }, [servicesInCurrentBookings, columns])

    const dynamicTable = useWbkTable({
        columns: filteredColumns,
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
                                    await onSubmit(normalizeBookingPayload(data))
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
            return await addItem('appointments', data)
        } catch (e) {
            console.error('failed to add booking', e)
        }
    }

    const filterForm = (
        <FilterForm
            fields={filterFields}
            model="appointments"
            onFiltersChange={setCurrentFilters}
            columnCount={5}
        />
    )
    const searchField = (
        <SearchField name="search" onChange={setSearch} label="Search" />
    )

    const exportCSV = useCallback(() => {
        const selectedIds = dynamicTable
            .getSelectedRowModel()
            .rows.map((row) => row.original.id)
        const initialFilterFields = applyFiltersToFields(
            filterFields,
            currentFilters
        )
        sidebar.open(
            <ExportCSV
                selectedIds={selectedIds}
                filterFields={initialFilterFields}
            />,
            {
                view: 'modal',
                width: 'medium',
                height: 'auto',
                position: 'center',
            }
        )
    }, [sidebar, dynamicTable, currentFilters])

    const exportButton = useMemo(() => {
        return (
            <Button
                onClick={exportCSV}
                type="no-border"
                className="wbk_bookings__exportButton"
                isLoading={downloadPending}
            >
                {__('Export to CSV file', 'webba-booking-lite')}
                <img
                    src={iconExport}
                    alt={__('Export icon', 'webba-booking-lite')}
                />
            </Button>
        )
    }, [downloadPending, exportCSV])
    const exportButtonRequiredPlans = ['standard', 'premium']
    const isExportButtonAvailable =
        plan_map &&
        exportButtonRequiredPlans.some((plan) => plan_map[plan] === true)

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
                                return await addBooking(normalizeBookingPayload(data))
                            }}
                            defaultValue={
                                {} as FormValueFromModel<typeof bookingsModel>
                            }
                        />
                    )
                }
                noItemsImageUrl={
                    noItemsImage
                }
                filter={filterForm}
                search={searchField}
                isItemsForbidden={isForbidden(bookings)}
                exportButton={
                    isExportButtonAvailable && exportButton
                        ? exportButton
                        : undefined
                }
                forcePermission={true}
            />
            <SuccessMessage />
            <FailedMessage />
        </TableProvider>
    )
}
