import { getCoreRowModel, getSortedRowModel } from '@tanstack/react-table'
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
import { ggcalendarsModel } from './model'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { GoogleAuthCell } from '../../components/WebbaDataTable/cells/GoogleAuth/GoogleAuth'
import { __ } from '@wordpress/i18n'
import styles from './GGCalendars.module.scss'

const columns = generateColumnDefsFromModel(ggcalendarsModel, {
    access_token: {
        cell: GoogleAuthCell,
    },
})

const form = createFormFromModel(ggcalendarsModel)

const formSections = createFormMenuSectionsFromModel({
    model: ggcalendarsModel,
    form,
    modelName: 'gg_calendars',
})

export const GGCalendarsScreen = () => {
    const { deleteItems, addItem } = useDispatch(store)
    const { ggcalendars, isLoading } = useSelect(
        (select) => ({
            ggcalendars: select(store).getItems('gg_calendars'),
            isLoading: select(store).getLoading(),
        }),
        []
    )
    const sidebar = useSidebar()
    const { plugin_url, settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )

    const table = useWbkTable({
        columns,
        data: ggcalendars,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderMenu: ({ cell }) => {
            const { onDelete, onDuplicate, onSubmit } = getCellActions({
                cell,
                collectionName: 'gg_calendars',
            })

            return (
                <Menu
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                name={__(
                                    'Edit Google Calendar',
                                    'webba-booking-lite'
                                )}
                                id="edit-ggcalendar-form"
                                form={form}
                                defaultValue={cell.row.original}
                                sections={formSections}
                                onSubmit={async (data) => {
                                    await onSubmit(data)
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

        await deleteItems('gg_calendars', selectedRowsIds)
    }

    const addModelItem = async (data: any) => {
        try {
            await addItem('gg_calendars', data)
        } catch (e) {
            console.error('failed to add ggcalendar', e)
        }
    }

    return (
        <Table
            title={__('Google Calendars', 'webba-booking-lite')}
            addButtonTitle={__('Add Google Calendar', 'webba-booking-lite')}
            table={table}
            loading={isLoading}
            onDeleteSelected={onDeleteSelected}
            onAdd={() =>
                sidebar.open(
                    <Form
                        name={__('Add Google Calendar', 'webba-booking-lite')}
                        id="add-ggcalendar-form"
                        form={form}
                        sections={formSections}
                        onSubmit={async (data) => {
                            await addModelItem(data)
                            sidebar.close()
                        }}
                    />
                )
            }
            noItemsImageUrl={plugin_url + '/public/images/bookings-empty.png'}
            className={styles.table}
        />
    )
}
