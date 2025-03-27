import classNames from 'classnames'
import { useRoute } from '../../components/Router/useRoute'
import styles from './Bookings.module.scss'
import { __ } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import { useMemo, useState } from 'react'
import { store_name } from '../../../store/backend'
import {
    generateColumnDefsFromModel,
    removePrefixesFromModelFields,
} from '../../components/WebbaDataTable/utils'
import BookingsModel from '../../../schemas/cancelled_appointments.json'
import { useWbkTable } from '../../components/WebbaDataTable/hooks/useWbkTable'
import { getFilteredRowModel } from '@tanstack/react-table'
import { SearchField } from '../../components/Filter/Fields/SearchField/SearchField'
import { FailedMessage } from '../../components/FailedMessage/FailedMessage'
import { TableProvider } from '../../components/WebbaDataTable/context/TableProvider'
import { Table } from '../../components/WebbaDataTable/Table'
import { isForbidden } from '../../utils/errors'
import { wbkFormat } from '../../components/Form/utils/dateTime'
import { ServiceName } from '../../components/WebbaDataTable/cells/ServiceName/ServiceName'

export const bookingsModel = removePrefixesFromModelFields(
    BookingsModel,
    'appointment_'
)

export const CanecelledBookingsScreen = () => {
    const { setRoute } = useRoute()
    // @ts-ignore
    const loading = useSelect((select) => select(store_name).getLoading(), [])
    const bookings = useSelect(
        // @ts-ignore
        (select) => select(store_name).getItems('cancelled_appointments'),
        []
    )
    console.log(bookings)
    const [search, setSearch] = useState('')
    const { plugin_url, settings, is_pro } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )

    const columns = useMemo(() => {
        return generateColumnDefsFromModel(bookingsModel, {
            created_on: {
                header: __('Created on', 'webba-booking-lite'),
                cell: ({ cell }) =>
                    wbkFormat(
                        cell.row.original.created_on,
                        `${settings ? settings.date_format : 'dd/mm/yyyy'} ${
                            settings ? settings.time_format : 'HH:mm'
                        }`,
                        settings ? settings.timezone : 'UTC'
                    ),
            },
            service_id: {
                header: __('Service', 'webba-booking-lite'),
                cell: ServiceName,
            },
        })
    }, [settings])

    const dynamicTable = useWbkTable({
        columns,
        data: bookings,
        selectable: true,
        isAdmin: settings?.is_admin,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter: search,
        },
        onGlobalFilterChange: setSearch,
        globalFilterFn: 'includesString',
        filterFromLeafRows: true,
        maxLeafRowFilterDepth: 2,
    })

    const searchField = (
        <SearchField name="search" onChange={setSearch} label="Search" />
    )

    return (
        <div>
            <div
                className={classNames(
                    styles.buttonNavigation,
                    styles.green,
                    styles.left
                )}
                onClick={() => setRoute('bookings')}
            >
                &#8592;&nbsp;
                {__('Acive Bookings', 'webba-booking-lite')}
            </div>
            <TableProvider table={dynamicTable}>
                <Table
                    title={__('Cancelled Bookings', 'webba-booking-lite')}
                    table={dynamicTable}
                    loading={loading}
                    noItemsImageUrl={
                        plugin_url + '/public/images/bookings-empty.png'
                    }
                    search={searchField}
                    isItemsForbidden={isForbidden(bookings)}
                    forcePermission={true}
                />
                <FailedMessage />
            </TableProvider>
        </div>
    )
}
