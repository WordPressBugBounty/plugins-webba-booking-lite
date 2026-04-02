import { CellContext } from '@tanstack/react-table'
import { select, useDispatch, useSelect } from '@wordpress/data'
import { store, store_name } from '../../../store/backend'
import { Form } from '../../components/Form/Form'
import { createFormMenuSectionsFromModel } from '../../components/Form/utils/utils'
import { useSidebar } from '../../components/Sidebar/SidebarContext'
import { getCellActions } from '../../components/WebbaDataTable/helpers/getCellActions'
import { useWbkTable } from '../../components/WebbaDataTable/hooks/useWbkTable'
import { Menu } from '../../components/WebbaDataTable/Menu'
import { Table } from '../../components/WebbaDataTable/Table'
import { generateColumnDefsFromModel } from '../../components/WebbaDataTable/utils'
import { connectedCalendarsModel } from './model'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { GoogleAuthCell } from '../../components/WebbaDataTable/cells/GoogleAuth/GoogleAuth'
import { __ } from '@wordpress/i18n'
import './ConnectedCalendars.scss'
import { useCallback, useState } from 'react'
import { AuthPopup } from '../../components/AuthPopup/AuthPopup'
import { CalendarName } from '../../components/WebbaDataTable/cells/CalendarName/CalendarName'
import { CalendarProvider } from '../../components/WebbaDataTable/cells/CalendarProvider/CalendarProvider'
import { UserName } from '../../components/WebbaDataTable/cells/UserName/UserName'
import { SuccessMessage } from '../../components/SuccessMessage/SuccessMessage'
import { ProFeatuerWrapper } from '../../components/ProFeatuerWrapper/ProFeatuerWrapper'
import { UserCalendars } from './UserCalendars/UserCalendars'
import noItemsImage from '../../../../public/images/bookings-empty.png'
import { ReactComponent as ConnectIcon } from '../../../../public/images/icon-connect.svg'

export const ConnectedCalendarsScreen = () => {
    const columns = generateColumnDefsFromModel(connectedCalendarsModel, {
        access_token: {
            cell: GoogleAuthCell,
        },
        in_provider_id: {
            cell: CalendarName,
        },
        provider: {
            cell: CalendarProvider,
        },
        user_id: {
            cell: UserName,
        },
    })

    const form = createFormFromModel(connectedCalendarsModel)

    const formSections = createFormMenuSectionsFromModel({
        model: connectedCalendarsModel,
        form,
        modelName: 'connected_calendars',
    })

    const { deleteItems, addItem, setToastNotification, setGgAuthData } =
        useDispatch(store)
    const { connectedCalendars, isLoading } = useSelect(
        (select) => ({
            connectedCalendars: select(store).getItems('connected_calendars'),
            isLoading: select(store).getLoadingState('connected_calendars'),
        }),
        []
    )
    const sidebar = useSidebar()
    const { plugin_url, settings, plan_map } = useSelect(
        (select: any) => select(store_name).getPreset(),
        []
    )
    const preset = useSelect(
        (select: any) => select(store_name).getPreset(),
        []
    )
    const [currentAuth, setCurrentAuth] = useState(null)
    const isStartPlan =
        plan_map && plan_map['start'] && plan_map['start'] === true

    const dispatchAuthPopup = useCallback(
        (data: any) => {
            const id = data.id
            const provider = data?.provider === 'outlook' ? 'outlook' : 'google'
            const authData = select(store_name).getGgAuthData(id)
            const { isAuthenticated } = authData || {}

            if (isAuthenticated !== true) {
                setCurrentAuth(data)
            } else {
                setCurrentAuth(null)
            }
        },
        [setCurrentAuth]
    )

    const table = useWbkTable({
        columns,
        data: connectedCalendars,
        selectable: true,
        isAdmin: settings?.is_admin,
        renderMenu: ({ cell }) => {
            const { onDelete, onDuplicate, onSubmit } = getCellActions({
                cell,
                collectionName: 'connected_calendars',
            })

            return (
                <Menu
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onEdit={() => {
                        sidebar.open(
                            <Form
                                name={__(
                                    'Edit Calendar',
                                    'webba-booking-lite'
                                )}
                                id="edit-connected-calendar-form"
                                form={form}
                                defaultValue={cell.row.original}
                                sections={formSections}
                                onSubmit={async (data) => {
                                    const original = cell.row.original
                                    const providerChanged =
                                        data.provider != null &&
                                        original?.provider != null &&
                                        String(data.provider) !== String(original.provider)
                                    const payload = providerChanged
                                        ? {
                                            ...data,
                                            in_provider_id: '',
                                            access_token: '',
                                        }
                                        : data
                                    await onSubmit(payload)
                                    if (providerChanged) {
                                        setGgAuthData(original.id, {})
                                    }
                                    setToastNotification({
                                        type: 'success',
                                        message: __(
                                            'Changes were saved.',
                                            'webba-booking-lite'
                                        ),
                                    })
                                    dispatchAuthPopup({
                                        ...payload,
                                        id: original.id,
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
                                tooltipMode='description'
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

        await deleteItems('connected_calendars', selectedRowsIds)
    }

    const addModelItem = async (data: any) => {
        try {
            const response = await addItem('connected_calendars', data)
            dispatchAuthPopup(response)
            return response
        } catch (e) {
            console.error('failed to add connected calendar', e)
        }
    }

    if (preset?.settings?.is_admin !== true) {
        return <UserCalendars />
    }

    return (
        <div className="wbk_connectedCalendars__wrapper">
            {!isStartPlan && <ProFeatuerWrapper requiredPlans={['start']} />}
            <Table
                title={__('Connected Calendars', 'webba-booking-lite')}
                addButtonTitle={__(
                    'Add Calendar',
                    'webba-booking-lite'
                )}
                table={table}
                loading={isLoading}
                onDeleteSelected={onDeleteSelected}
                onAdd={() =>
                    sidebar.open(
                        <Form
                            name={__(
                                'Add Calendar',
                                'webba-booking-lite'
                            )}
                            id="add-connected-calendar-form"
                            form={form}
                            sections={formSections}
                            onSubmit={async (data) => {
                                return await addModelItem(data)
                            }}
                            submitButtonText={__(
                                'Connect Calendar',
                                'webba-booking-lite'
                            )}
                            submitButtonIcon={<ConnectIcon />}
                            tooltipMode='description'
                        />
                    )
                }
                noItemsImageUrl={
                    noItemsImage
                }
                className="wbk_connectedCalendars__table"
            />

            {currentAuth && (
                <AuthPopup data={currentAuth} setData={setCurrentAuth} />
            )}
            <SuccessMessage />
        </div>
    )
}
