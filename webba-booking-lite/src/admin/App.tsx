import { getCoreRowModel, getExpandedRowModel } from '@tanstack/react-table'
import styles from './App.module.css'
import { Form } from './components/Form/Form'
import { createFieldsFromSchema } from './components/Form/utils'
import { useSidebar } from './components/Sidebar/SidebarContext'
import { Menu } from './components/WebbaDataTable/Menu'
import { Table } from './components/WebbaDataTable/Table'
import { useDynamicTable } from './components/WebbaDataTable/hooks/useDynamicTable'
import { generateColumns } from './components/WebbaDataTable/utils'
import { bookings } from './mocks/bookings'
import BookingSchema from '../schemas/appointments.json'
// @ts-ignore
import { store_name, default_state } from '../store/backend'
import { select, resolveSelect, dispatch } from '@wordpress/data'

const booking_columns = generateColumns(BookingSchema, {
    appointment_name: {
        cell: () => <span>override default cell here</span>,
    },
})

const getItems = async (model: string) => {
    return await resolveSelect(store_name).getItems(model)
}

const setItem = async (model: string, data: string) => {
    return await dispatch(store_name).setItem(model, JSON.parse(data))
}

const addItem = async (model: string, data: string) => {
    return await dispatch(store_name).addItem(model, JSON.parse(data))
}

const deleteItems = async (model: string, ids: number[]) => {
    return await dispatch(store_name).deleteItems(model, ids)
}

const App = () => {
    const sidebar = useSidebar()

    const { table, addRow, deleteRow, updateRow } = useDynamicTable({
        data: bookings,
        columns: booking_columns,
        enableExpanding: true,
        selectable: true,
        renderExpandableRow: (info) => (
            <div>
                <div>Places booked: {info.row.original.placesBooked}</div>
                <div>Created on {info.row.original.createdOn}</div>
                <div>Email: {info.row.original.email}</div>
            </div>
        ),
        renderMenu: (info) => (
            <Menu
                row={info.row}
                showExpand
                onDelete={() => deleteRow(info.row.index)}
                onDuplicate={() => addRow(info.row.original)}
                onEdit={() => {
                    sidebar.open(
                        <Form
                            entry={info.row.original}
                            fields={createFieldsFromSchema({
                                model: BookingSchema,
                                config: {
                                    id: {
                                        hidden: true,
                                    },
                                },
                            })}
                            onSubmit={(entry) =>
                                updateRow(info.row.index, entry)
                            }
                        />
                    )
                }}
            />
        ),
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })
    const handleGetServices = async () => {
        const services = await getItems('services')
    }
    const handleUpdateService = async () => {
        const data = {
            id: '1',
            name: 'Updated service name',
        }
        setItem('services', JSON.stringify(data))
    }
    const handelAddService = async () => {
        const data = {
            arrived_template: '0',
            booking_changed_template: '0',
            business_hours_v4: '{}',
            consecutive_timeslots: 'yes',
            date_range: '',
            description: '',
            duration: '60',
            email: 'demo@webba-boooking.com',
            extcalendar: '',
            extcalendar_group_mode: null,
            form: '5',
            gg_calendars: '',
            interval_between: '60',
            invoice_template: '0',
            min_quantity: '1',
            multi_mode_limit: null,
            multi_mode_low_limit: null,
            name: 'New service',
            notification_template: '1',
            payment_methods: '["woocommerce"]',
            prepare_time: '0',
            price: '100',
            pricing_rules: '',
            priority: '0',
            quantity: '1',
            reminder_template: '1',
            service_fee: '0',
            step: '60',
            users: '""',
            users_allow_edit: '',
            woo_product: '14',
            zoom: '',
        }
        addItem('services', JSON.stringify(data))
    }
    const handelDeleteService = async () => {
        deleteItems('services', [1])
    }

    return (
        <main className={styles.app}>
            <button onClick={handleGetServices}>Get services</button>
            <button onClick={handleUpdateService}>
                Update name of the service with ID 1
            </button>
            <button onClick={handelAddService}>Add services</button>
            <button onClick={handelDeleteService}>
                Delete services with ID 1
            </button>
            <Table title="Bookings" table={table} data={bookings} />
        </main>
    )
}

export default App
