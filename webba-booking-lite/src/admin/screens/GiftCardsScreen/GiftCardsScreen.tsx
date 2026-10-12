import { useDispatch, useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { useMemo } from 'react'
import { fromUnixTime } from 'date-fns'
import { store, store_name } from '../../../store/backend'
import { Form } from '../../components/Form/Form'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { createFormMenuSectionsFromModel } from '../../components/Form/utils/utils'
import { wbkFormat } from '../../components/Form/utils/dateTime'
import { useSidebar } from '../../components/Sidebar/SidebarContext'
import { getCellActions } from '../../components/WebbaDataTable/helpers/getCellActions'
import { useWbkTable } from '../../components/WebbaDataTable/hooks/useWbkTable'
import { Menu } from '../../components/WebbaDataTable/Menu'
import { Table } from '../../components/WebbaDataTable/Table'
import { getTableDocumentationLink } from '../../components/WebbaDataTable/documentationLinks'
import { generateColumnDefsFromModel } from '../../components/WebbaDataTable/utils'
import { LockedTableSection } from '../../components/LockedTableSection/LockedTableSection'
import noItemsImage from '../../../../public/images/bookings-empty.png'
import { giftCardsModel } from './giftCardsModel'
import { getGiftCardRemainingAmount } from './giftCardHistory'
import { GiftCardHistory } from '../../components/WebbaDataTable/cells/GiftCardHistory/GiftCardHistory'
import { GiftCardDesignCell } from '../../components/WebbaDataTable/cells/GiftCardDesignCell/GiftCardDesignCell'
import { formatPrice } from '../../utils/currency'

const GiftCardDateCell = ({ cell }: { cell: any }) => {
    const { settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const value = cell.getValue()
    if (value === undefined || value === null || value === '' || value === 0) {
        return null
    }

    const numeric = Number(value)
    if (!Number.isFinite(numeric) || numeric <= 0) {
        return <span>{String(value)}</span>
    }

    try {
        return (
            <span>
                {wbkFormat(
                    fromUnixTime(numeric),
                    settings?.date_format ?? '',
                    settings?.timezone ?? ''
                )}
            </span>
        )
    } catch {
        return <span>{String(value)}</span>
    }
}

const GiftCardPriceCell = ({ cell }: { cell: any }) => {
    const { settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const value = Number(cell.getValue())

    return (
        <span>
            {formatPrice(
                Number.isFinite(value) ? value : 0,
                settings?.price_format,
                settings?.price_separator,
                settings?.price_fractional
            )}
        </span>
    )
}

const GiftCardRemainingCell = ({ cell }: { cell: any }) => {
    const { settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const remaining = getGiftCardRemainingAmount(cell.row.original)

    return (
        <span>
            {formatPrice(
                remaining,
                settings?.price_format,
                settings?.price_separator,
                settings?.price_fractional
            )}
        </span>
    )
}

const columns = generateColumnDefsFromModel(
    giftCardsModel,
    {
        expiration_date: {
            cell: GiftCardDateCell,
        },
        send_on: {
            cell: GiftCardDateCell,
        },
        amount: {
            cell: GiftCardPriceCell,
        },
        design: {
            cell: GiftCardDesignCell,
        }
    },
    {
        remaining_amount: {
            index: 6,
            header: __('Remaining', 'webba-booking-lite'),
            cell: GiftCardRemainingCell,
        },
    }
)

const form = createFormFromModel(giftCardsModel)

const parseGiftCardDate = (value: unknown): Date | null => {
    if (value === undefined || value === null || value === '') {
        return null
    }

    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)) && !String(value).includes('-'))) {
        const timestamp = Number(value)
        if (!Number.isFinite(timestamp)) {
            return null
        }
        return new Date(timestamp * 1000)
    }

    const date = new Date(String(value))
    return Number.isNaN(date.getTime()) ? null : date
}

const giftCardDateOrderError = __(
    'Send date must be earlier than the expiration date.',
    'webba-booking-lite'
)

const validateGiftCardDateOrder = (
    sendOnValue: unknown,
    expirationValue: unknown
) => {
    const sendOn = parseGiftCardDate(sendOnValue)
    const expirationDate = parseGiftCardDate(expirationValue)

    if (!sendOn || !expirationDate) {
        return null
    }

    if (sendOn.getTime() >= expirationDate.getTime()) {
        return giftCardDateOrderError
    }

    return null
}

form.fields.send_on.addValidator((value, get) => {
    const expirationValue = get
        ? get(form.fields.expiration_date.value).value
        : form.fields.expiration_date.value.value

    return validateGiftCardDateOrder(value, expirationValue)
})

form.fields.expiration_date.addValidator((value, get) => {
    const sendOnValue = get
        ? get(form.fields.send_on.value).value
        : form.fields.send_on.value.value

    return validateGiftCardDateOrder(sendOnValue, value)
})

const formSections = createFormMenuSectionsFromModel({
    model: giftCardsModel,
    form,
    modelName: 'gift_cards',
})

export const GiftCardsScreen = () => {
    const { deleteItems, addItem, setToastNotification } = useDispatch(store)
    const { giftCards, isLoading } = useSelect(
        (select) => ({
            giftCards: select(store).getItems('gift_cards'),
            isLoading: select(store).getLoadingState('gift_cards'),
        }),
        []
    )
    const sidebar = useSidebar()
    const { settings, plan_map } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const requiredPlans = ['premium', 'pro', 'proextended']
    const isGiftCardsAvailable = useMemo(
        () => plan_map && requiredPlans.some((plan) => plan_map[plan] === true),
        [requiredPlans, plan_map]
    )

    const table = useWbkTable({
        columns,
        data: giftCards,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderExpandableRow: GiftCardHistory,
        renderMenu: ({ cell }) => {
            const { onDelete, onDuplicate, onSubmit } = getCellActions({
                cell,
                collectionName: 'gift_cards',
            })

            return (
                <Menu
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                name={__('Edit Gift Card', 'webba-booking-lite')}
                                id="edit-gift-card-form"
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

        await deleteItems('gift_cards', selectedRowsIds)
    }

    const addModelItem = async (data: any) => {
        try {
            return await addItem('gift_cards', data)
        } catch (e) {
            console.error('failed to add gift card', e)
        }
    }

    return (
        <LockedTableSection
            isLocked={!isGiftCardsAvailable}
            requiredPlans={requiredPlans}
            featureKey="gift_cards"
            className="wbk_giftCardsScreen__wrapper"
        >
            <Table
                title={__('Gift cards', 'webba-booking-lite')}
                documentationLink={getTableDocumentationLink('giftCards')}
                description={__('Create, manage and see purchase history of gift cards here.', 'webba-booking-lite')}
                addButtonTitle={__('Add gift card', 'webba-booking-lite')}
                table={table}
                loading={isLoading}
                onDeleteSelected={onDeleteSelected}
                onAdd={() =>
                    sidebar.open(
                        <Form
                            name={__('Add gift card', 'webba-booking-lite')}
                            id="add-gift-card-form"
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
        </LockedTableSection>
    )
}
