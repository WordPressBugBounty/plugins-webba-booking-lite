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
import { pricingRulesModel } from './model'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { PriorityCell } from '../../components/WebbaDataTable/cells/Priority/Priority'
import { __ } from '@wordpress/i18n'
import { PricingRuleType } from '../../components/WebbaDataTable/cells/PricingRuleType/PricingRuleType'
import { SuccessMessage } from '../../components/SuccessMessage/SuccessMessage'
import noItemsImage from '../../../../public/images/bookings-empty.png'

const columns = generateColumnDefsFromModel(pricingRulesModel, {
    priority: {
        cell: PriorityCell,
    },
    type: {
        cell: PricingRuleType,
    },
})

const form = createFormFromModel(pricingRulesModel)

const formSections = createFormMenuSectionsFromModel({
    model: pricingRulesModel,
    form,
    modelName: 'pricing_rules',
})

export const PricingRulesScreen = () => {
    const { deleteItems, addItem, setToastNotification } = useDispatch(store)
    const { pricingRules, isLoading } = useSelect(
        (select) => ({
            pricingRules: select(store).getItems('pricing_rules'),
            isLoading: select(store).getLoadingState('pricing_rules'),
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
        data: pricingRules,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderMenu: ({ cell }) => {
            const { onDelete, onDuplicate, onSubmit } = getCellActions({
                cell,
                collectionName: 'pricing_rules',
            })

            return (
                <Menu
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                name={__(
                                    'Edit Pricing Rule',
                                    'webba-booking-lite'
                                )}
                                id="edit-pricing-rule-form"
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

        await deleteItems('pricing_rules', selectedRowsIds)
    }

    const addModelItem = async (data: any) => {
        try {
            return await addItem('pricing_rules', data)
        } catch (e) {
            console.error('failed to add pricing rule', e)
        }
    }

    return (
        <>
            <Table
                title={__('Pricing rules', 'webba-booking-lite')}
                addButtonTitle={__('Add Pricing Rule', 'webba-booking-lite')}
                table={table}
                loading={isLoading}
                onDeleteSelected={onDeleteSelected}
                onAdd={() =>
                    sidebar.open(
                        <Form
                            name={__('Add Pricing Rule', 'webba-booking-lite')}
                            id="add-pricing-rule-form"
                            form={form}
                            sections={formSections}
                            onSubmit={async (data) => {
                                return await addModelItem(data)
                            }}
                        />
                    )
                }
                noItemsImageUrl={
                    noItemsImage
                }
            />
            <SuccessMessage />
        </>
    )
}
