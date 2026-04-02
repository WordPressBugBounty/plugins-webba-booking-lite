import { getFilteredRowModel } from '@tanstack/react-table'
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
import { emailTemplatesModel } from './model'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { __ } from '@wordpress/i18n'
import { EmailTestButton } from '../../components/WebbaDataTable/cells/EmailTestButton/EmailTestButton'
import { EmailType } from '../../components/WebbaDataTable/cells/EmailType/EmailType'
import { EmailReceivers } from '../../components/WebbaDataTable/cells/EmailReceivers/EmailReceivers'
import { EmailStatus } from '../../components/WebbaDataTable/cells/EmailStatus/EmailStatus'
import { SearchField } from '../../components/Filter/Fields/SearchField/SearchField'
import { useState } from 'react'
import metadata from '../../../schemas/email_templates.json'
import noItemsImage from '../../../../public/images/bookings-empty.png'

const columns = generateColumnDefsFromModel(
    emailTemplatesModel,
    {},
    {
        enabled: { index: 0, cell: EmailStatus },
        type: { index: 1, cell: EmailType },
        name: { index: 2 },
        recipients: { index: 3, cell: EmailReceivers },
        test: {
            index: 4,
            header: '',
            cell: EmailTestButton,
            enableSorting: false,
        },
    }
)

const form = createFormFromModel(emailTemplatesModel)

const formSections = createFormMenuSectionsFromModel({
    model: emailTemplatesModel,
    form,
    modelName: 'email_templates',
})

export const EmailTemplateScreen = () => {
    const { deleteItems, addItem } = useDispatch(store)
    const { emailTemplates, isLoading } = useSelect(
        (select) => ({
            emailTemplates: select(store).getItems('email_templates'),
            isLoading: select(store).getLoadingState('email_templates'),
        }),
        []
    )
    const sidebar = useSidebar()
    const { plugin_url, settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const typeOptions = useSelect(
        (select) =>
            // @ts-ignore
            select(store).getFieldOptions('email_templates', 'type', []),
        []
    )

    const customGlobalFilterFn = (
        row: any,
        columnId: any,
        filterValue: any
    ) => {
        if (!filterValue) return true
        const searchTerm = String(filterValue).toLowerCase()
        return Object.entries(row.original).some(([fieldName, value]) => {
            if (typeof value === 'string' || typeof value === 'number') {
                const fields: Record<string, any> = metadata?.properties
                const fieldSchema = fields[fieldName]

                if (
                    fieldSchema?.input_type === 'select' ||
                    fieldSchema?.input_type === 'multicheckbox'
                ) {
                    const options: Record<string, string> =
                        fieldSchema?.misc?.options
                    const backendOptions =
                        fieldName === 'type' ? typeOptions : null

                    if (backendOptions && typeof backendOptions === 'object') {
                        const displayLabel = backendOptions[value]
                        if (
                            displayLabel &&
                            String(displayLabel)
                                .toLowerCase()
                                .includes(searchTerm)
                        ) {
                            return true
                        }
                    }

                    if (options) {
                        for (const key in options) {
                            if (key === value) {
                                return String(options[key])
                                    .toLowerCase()
                                    .includes(searchTerm)
                            }
                        }
                    }
                }

                return String(value).toLowerCase().includes(searchTerm)
            }
            return false
        })
    }
    const [search, setSearch] = useState('')
    const searchField = (
        <SearchField name="search" onChange={setSearch} label="Search" />
    )

    const table = useWbkTable({
        columns,
        data: emailTemplates,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderMenu: ({ cell }) => {
            const { onDelete, onDuplicate, onSubmit } = getCellActions({
                cell,
                collectionName: 'email_templates',
            })

            return (
                <Menu
                    collectionName="email_templates"
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                name={__(
                                    'Edit Email Template',
                                    'webba-booking-lite'
                                )}
                                id="edit-emailTemplate-form"
                                form={form}
                                defaultValue={cell.row.original}
                                sections={formSections}
                                onSubmit={async (data) => {
                                    await onSubmit(data)
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
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setSearch,
        globalFilterFn: customGlobalFilterFn,
        state: {
            globalFilter: search,
        },
    })

    const onDeleteSelected = async () => {
        const selectedRowsIds = table
            .getSelectedRowModel()
            .rows.filter((row) => row.original?.is_default != 'yes')
            .map((row) => row.original.id)

        if (!selectedRowsIds.length) {
            return
        }

        await deleteItems('email_templates', selectedRowsIds)
    }

    const addModelItem = async (data: any) => {
        try {
            return await addItem('email_templates', data)
        } catch (e) {
            console.error('failed to add emailTemplate', e)
        }
    }

    return (
        <Table
            title={__('Email notifications', 'webba-booking-lite')}
            addButtonTitle={__('Add Email Template', 'webba-booking-lite')}
            table={table}
            loading={isLoading}
            onDeleteSelected={onDeleteSelected}
            horizontalOverflow={true}
            search={searchField}
            onAdd={() =>
                sidebar.open(
                    <Form
                        name={__('Add Email Template', 'webba-booking-lite')}
                        id="add-emailTemplate-form"
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
    )
}
