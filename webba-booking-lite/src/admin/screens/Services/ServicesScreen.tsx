import { useDispatch, useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { store, store_name } from '../../../store/backend'
import { Form } from '../../components/Form/Form'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { createFormMenuSectionsFromModel } from '../../components/Form/utils/utils'
import { useSidebar } from '../../components/Sidebar/SidebarContext'
import { ServiceNames } from '../../components/WebbaDataTable/cells/ServiceNames/ServiceNames'
import { getCellActions, syncConnectedTables } from '../../components/WebbaDataTable/helpers/getCellActions'
import { useWbkTable } from '../../components/WebbaDataTable/hooks/useWbkTable'
import { Menu } from '../../components/WebbaDataTable/Menu'
import { Table } from '../../components/WebbaDataTable/Table'
import { generateColumnDefsFromModel } from '../../components/WebbaDataTable/utils'
import { serviceCategoriesModel, servicesModel, unitsModel } from './model'
import { ServiceDetail } from '../../components/WebbaDataTable/cells/ServiceDetail/ServiceDetail'
import { useMemo, useState } from 'react'
import { SearchField } from '../../components/Filter/Fields/SearchField/SearchField'
import { getFilteredRowModel } from '@tanstack/react-table'
import { isForbidden } from '../../utils/errors'
import { FailedMessage } from '../../components/FailedMessage/FailedMessage'
import { useSettings } from '../../providers/SettingsProvider'
import { DurationCell } from '../../components/WebbaDataTable/cells/DurationCell/DurationCell'
import { ServiceImageCell } from '../../components/WebbaDataTable/cells/ServiceImageCell/ServiceImageCell'
import { formatPrice } from '../../utils/currency'
import { SuccessMessage } from '../../components/SuccessMessage/SuccessMessage'
import noItemsImage from '../../../../public/images/bookings-empty.png'
import { UnitPrices } from '../../components/WebbaDataTable/cells/UnitPrices/UnitPrices'
import './ServicesScreen.scss'
import { ProFeatuerWrapper } from '../../components/ProFeatuerWrapper/ProFeatuerWrapper'

export const ServicesScreen = () => {
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
    const columnsUnit = generateColumnDefsFromModel(unitsModel, {}, {
        id: {
            cell: ({ cell }) => <span>{cell.row.original.id}</span>,
            header: __('ID', 'webba-booking-lite'),
            index: 0,
        },
        price: {
            cell: UnitPrices
        }
    })
    const formUnit = createFormFromModel(unitsModel)

    const menuSectionsUnit = createFormMenuSectionsFromModel({
        model: unitsModel,
        form: formUnit,
        modelName: 'units',
    })

    const { deleteItems, addItem, setToastNotification } = useDispatch(store)
    const {
        services,
        serviceCategories,
        units,
        servicesLoading,
        serviceCategoriesLoading,
        unitsLoading,
    } = useSelect(
        (select) => ({
            services: select(store).getItems('services'),
            serviceCategories: select(store).getItems('service_categories'),
            units: select(store).getItems('units'),
            servicesLoading: select(store).getLoadingState('services'),
            serviceCategoriesLoading:
                select(store).getLoadingState('service_categories'),
            unitsLoading: select(store).getLoadingState('units'),
        }),
        []
    )
    const [search, setSearch] = useState<string | number | null>('')
    const [catSearch, setCatSearch] = useState<string | number | null>('')
    const [unitSearch, setUnitSearch] = useState<string | number | null>('')
    const sidebar = useSidebar()
    const { plugin_url, plan_map } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const settings = useSettings()

    const columnsService = useMemo(
        () =>
            generateColumnDefsFromModel(
                servicesModel,
                {
                    image: {
                        cell: ServiceImageCell,
                    },
                    price: {
                        cell: ({ cell }) =>
                            (cell.row.original.price > 0 &&
                                formatPrice(
                                    cell.row.original.price,
                                    settings?.price_format,
                                    settings?.price_separator,
                                    settings?.price_fractional
                                )) ||
                            __('Free', 'webba-booking-lite'),
                    },
                    duration: {
                        cell: DurationCell,
                    },
                },
                {
                    id: {
                        cell: ({ cell }) => <span>{cell.row.original.id}</span>,
                        header: __('ID', 'webba-booking-lite'),
                        index: 0,
                    },
                }
            ).filter((col) => col.id !== 'email'),
        [settings]
    )

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
                                tooltipMode="description"
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
                                tooltipMode="description"
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
    const tableUnit = useWbkTable({
        columns: columnsUnit,
        data: units,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderMenu: ({ cell }) => {
            const { onDelete, onDuplicate, onSubmit } = getCellActions({
                cell,
                collectionName: 'units',
            })

            return (
                <Menu
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                id="edit-unit-form"
                                name={__('Edit Service', 'webba-booking-lite')}
                                form={formUnit}
                                defaultValue={cell.row.original}
                                sections={menuSectionsUnit}
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
                                tooltipMode="description"
                            />
                        )
                    }}
                />
            )
        },
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter: unitSearch,
        },
        onGlobalFilterChange: setUnitSearch,
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
            const response = await addItem('service_categories', data)

            await syncConnectedTables(
                response.id,
                response?.list,
                'services',
                'categories'
            )

            return response
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
    const onDeleteSelectedUnit = async () => {
        const selectedRowsIds = tableUnit
            .getSelectedRowModel()
            .rows.map((row) => row.original.id)

        if (!selectedRowsIds.length) {
            return
        }

        await deleteItems('units', selectedRowsIds)
    }

    const addModelItemService = async (data: any) => {
        try {
            const response = await addItem('services', data)

            await syncConnectedTables(
                response.id,
                response?.categories,
                'service_categories',
                'list'
            )

            return response
        } catch (e) {
            console.error('failed to add service', e)
        }
    }
    const addModelItemUnit = async (data: any) => {
        try {
            const response = await addItem('units', data)

            return response
        } catch (e) {
            console.error('failed to add unit', e)
        }
    }

    const searchField = (
        <SearchField name="search" onChange={setSearch} label="Search" />
    )
    const catSearchField = (
        <SearchField name="search" onChange={setCatSearch} label="Search" />
    )
    const unitSearchField = (
        <SearchField name="search" onChange={setUnitSearch} label="Search" />
    )

    const unitsRequiredPlans = ['premium', 'pro']
    const isUnitsAvailable = plan_map && unitsRequiredPlans.some((plan) => plan_map[plan] === true)


    return (
        <>
            <Table
                title={__('Hourly Services / Rentals', 'webba-booking-lite')}
                addButtonTitle={__('Add hourly service', 'webba-booking-lite')}
                table={tableService}
                loading={servicesLoading}
                onDeleteSelected={onDeleteSelectedService}
                onAdd={() => {
                    sidebar.open(
                        <Form
                            tooltipMode="description"
                            name={__('Add hourly service', 'webba-booking-lite')}
                            id="add-service-form"
                            form={formService}
                            sections={menuSectionsService}
                            onSubmit={async (data) => {
                                return await addModelItemService(data)
                            }}
                        />
                    )
                }}
                noItemsImageUrl={
                    noItemsImage
                }
                search={searchField}
                isItemsForbidden={isForbidden(services)}
            />
            <div className="wbk_servicesScreen__units">
                {!isUnitsAvailable && (
                    <ProFeatuerWrapper requiredPlans={['premium', 'pro']} />
                )}
                <Table
                    title={__('Daily Services / Rentals', 'webba-booking-lite')}
                    addButtonTitle={__('Add daily service', 'webba-booking-lite')}
                    table={tableUnit}
                    loading={unitsLoading}
                    onDeleteSelected={onDeleteSelectedUnit}
                    onAdd={() => {
                        sidebar.open(
                            <Form
                                tooltipMode="description"
                                name={__('Add daily service', 'webba-booking-lite')}
                                id="add-unit-form"
                                form={formUnit}
                                sections={menuSectionsUnit}
                                onSubmit={async (data) => {
                                    return await addModelItemUnit(data)
                                }}
                            />
                        )
                    }}
                    noItemsImageUrl={
                        noItemsImage
                    }
                    search={unitSearchField}
                    isItemsForbidden={isForbidden(units)}
                />
            </div>
            <Table
                title={__('Categories', 'webba-booking-lite')}
                addButtonTitle={__(
                    'Add service category',
                    'webba-booking-lite'
                )}
                table={tableServiceCategory}
                loading={serviceCategoriesLoading}
                onDeleteSelected={onDeleteSelectedServiceCategory}
                onAdd={() => {
                    sidebar.open(
                        <Form
                            tooltipMode="description"
                            name={__(
                                'Add service category',
                                'webba-booking-lite'
                            )}
                            id="add-service-category-form"
                            form={formServiceCategory}
                            sections={menuSectionsServiceCategory}
                            onSubmit={async (data) => {
                                return await addModelItemServiceCategory(data)
                            }}
                        />
                    )
                }}
                noItemsImageUrl={
                    noItemsImage
                }
                search={catSearchField}
                isItemsForbidden={isForbidden(serviceCategories)}
            />
            <SuccessMessage />
            <FailedMessage />
        </>
    )
}
