import { useDispatch, useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { store, store_name } from '../../../store/backend'
import { Form } from '../../components/Form/Form'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { createFormMenuSectionsFromModel } from '../../components/Form/utils/utils'
import { useSidebar } from '../../components/Sidebar/SidebarContext'
import { ServiceNames } from '../../components/WebbaDataTable/cells/ServiceNames/ServiceNames'
import { getCellActions } from '../../components/WebbaDataTable/helpers/getCellActions'
import { useWbkTable } from '../../components/WebbaDataTable/hooks/useWbkTable'
import { Menu } from '../../components/WebbaDataTable/Menu'
import { Table } from '../../components/WebbaDataTable/Table'
import { generateColumnDefsFromModel } from '../../components/WebbaDataTable/utils'
import { serviceCategoriesModel, servicesModel } from './model'
import { ServiceDetail } from '../../components/WebbaDataTable/cells/ServiceDetail/ServiceDetail'
import { useState } from 'react'
import { SearchField } from '../../components/Filter/Fields/SearchField/SearchField'
import { getFilteredRowModel } from '@tanstack/react-table'
import { isForbidden } from '../../utils/errors'
import { FailedMessage } from '../../components/FailedMessage/FailedMessage'
import { useSettings } from '../../providers/SettingsProvider'

const columnsService = generateColumnDefsFromModel(
    servicesModel,
    {
        email: {
            cell: ({ getValue }) => <span>{getValue()}</span>,
            header: __('Email', 'webba-booking-lite'),
        },
    },
    {
        id: {
            cell: ({ cell }) => <span>{cell.row.original.id}</span>,
            header: __('ID', 'webba-booking-lite'),
            index: 0,
        },
    }
)

const formService = createFormFromModel(servicesModel)

const menuSectionsService = createFormMenuSectionsFromModel({
    model: servicesModel,
    form: formService,
    modelName: 'services',
})

const columnsServiceCategory = generateColumnDefsFromModel(
    serviceCategoriesModel,
    {
        list: {
            header: __('Services', 'webba-booking-lite'),
            cell: ServiceNames,
        },
    },
    {
        id: {
            cell: ({ cell }) => <span>{cell.row.original.id}</span>,
            header: __('ID', 'webba-booking-lite'),
            index: 0,
        },
    }
)

const formServiceCategory = createFormFromModel(serviceCategoriesModel)

const menuSectionsServiceCategory = createFormMenuSectionsFromModel({
    model: serviceCategoriesModel,
    form: formServiceCategory,
    modelName: 'service_categories',
})

export const ServicesScreen = () => {
    const { deleteItems, addItem } = useDispatch(store)
    const { services, serviceCategories, isLoading } = useSelect(
        (select) => ({
            services: select(store).getItems('services'),
            serviceCategories: select(store).getItems('service_categories'),
            isLoading: select(store).getLoading(),
        }),
        []
    )
    const [search, setSearch] = useState<string | number | null>('')
    const [catSearch, setCatSearch] = useState<string | number | null>('')
    const sidebar = useSidebar()
    const { plugin_url } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const settings = useSettings()

    const tableService = useWbkTable({
        columns: columnsService,
        data: services,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderMenu: ({ cell }) => {
            const { onDelete, onDuplicate, onSubmit } = getCellActions({
                cell,
                collectionName: 'services',
            })

            return (
                <Menu
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                id="edit-service-form"
                                name={__('Edit Service', 'webba-booking-lite')}
                                form={formService}
                                defaultValue={cell.row.original}
                                sections={menuSectionsService}
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
        renderExpandableRow: ServiceDetail,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter: search,
        },
        onGlobalFilterChange: setSearch,
        globalFilterFn: 'includesString',
        filterFromLeafRows: true,
        maxLeafRowFilterDepth: 2,
    })

    const tableServiceCategory = useWbkTable({
        columns: columnsServiceCategory,
        data: serviceCategories,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderMenu: ({ cell }) => {
            const { onDelete, onDuplicate, onSubmit } = getCellActions({
                cell,
                collectionName: 'service_categories',
            })

            return (
                <Menu
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                id="edit-service-category-form"
                                name={__(
                                    'Edit Service category',
                                    'webba-booking-lite'
                                )}
                                form={formServiceCategory}
                                defaultValue={cell.row.original}
                                sections={menuSectionsServiceCategory}
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
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter: catSearch,
        },
        onGlobalFilterChange: setCatSearch,
        globalFilterFn: 'includesString',
        filterFromLeafRows: true,
        maxLeafRowFilterDepth: 2,
    })
    const onDeleteSelectedService = async () => {
        const selectedRowsIds = tableService
            .getSelectedRowModel()
            .rows.map((row) => row.original.id)

        if (!selectedRowsIds.length) {
            return
        }

        await deleteItems('services', selectedRowsIds)
    }

    const addModelItemServiceCategory = async (data: any) => {
        try {
            await addItem('service_categories', data)
        } catch (e) {
            console.error('failed to add service category', e)
        }
    }
    const onDeleteSelectedServiceCategory = async () => {
        const selectedRowsIds = tableServiceCategory
            .getSelectedRowModel()
            .rows.map((row) => row.original.id)

        if (!selectedRowsIds.length) {
            return
        }

        await deleteItems('service_categories', selectedRowsIds)
    }

    const addModelItemService = async (data: any) => {
        try {
            await addItem('services', data)
        } catch (e) {
            console.error('failed to add service', e)
        }
    }

    const searchField = (
        <SearchField name="search" onChange={setSearch} label="Search" />
    )
    const catSearchField = (
        <SearchField name="search" onChange={setCatSearch} label="Search" />
    )

    return (
        <>
            <Table
                title={__('Services', 'webba-booking-lite')}
                addButtonTitle={__('Add service', 'webba-booking-lite')}
                table={tableService}
                loading={isLoading}
                onDeleteSelected={onDeleteSelectedService}
                onAdd={() => {
                    sidebar.open(
                        <Form
                            name={__('Add service', 'webba-booking-lite')}
                            id="add-service-form"
                            form={formService}
                            sections={menuSectionsService}
                            onSubmit={async (data) => {
                                await addModelItemService(data)
                                sidebar.close()
                            }}
                        />
                    )
                }}
                noItemsImageUrl={
                    plugin_url + '/public/images/bookings-empty.png'
                }
                search={searchField}
                isItemsForbidden={isForbidden(services)}
            />
            <Table
                title={__('Service categories', 'webba-booking-lite')}
                addButtonTitle={__(
                    'Add service category',
                    'webba-booking-lite'
                )}
                table={tableServiceCategory}
                loading={isLoading}
                onDeleteSelected={onDeleteSelectedServiceCategory}
                onAdd={() => {
                    sidebar.open(
                        <Form
                            name={__(
                                'Add service category',
                                'webba-booking-lite'
                            )}
                            id="add-service-category-form"
                            form={formServiceCategory}
                            sections={menuSectionsServiceCategory}
                            onSubmit={async (data) => {
                                await addModelItemServiceCategory(data)
                                sidebar.close()
                            }}
                        />
                    )
                }}
                noItemsImageUrl={
                    plugin_url + '/public/images/bookings-empty.png'
                }
                search={catSearchField}
                isItemsForbidden={isForbidden(serviceCategories)}
            />
            <FailedMessage />
        </>
    )
}
