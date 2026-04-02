import { __ } from '@wordpress/i18n'
import { ConfirmationButton } from '../ConfirmationButton/ConfirmationButton'
import { IBulkActionsProps } from './types'
import { useTable } from './context/TableProvider'
import './Table.scss'
import { useDispatch } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { useCallback } from 'react'
import deleteIcon from '../../../../public/images/icon-delete-red.svg'
import closeIcon from '../../../../public/images/close-icon2.png'
import cancelIcon from '../../../../public/images/icon-cancel-red.svg'
import bookingsMetadata from '../../../schemas/appointments.json'

export const BulkActions = ({
    onDeleteSelected,
    collectionName,
}: IBulkActionsProps) => {
    const table = useTable()
    const { setItem } = useDispatch(store_name)

    const updateStatus = useCallback((e: any) => {
        table.getSelectedRowModel().rows.map((row: any) =>
            setItem(collectionName, {
                ...row.original,
                status: e.target.value,
            })
        )
        table.resetRowSelection()
    }, [])

    const cancelBookings = useCallback(() => {
        table.getSelectedRowModel().rows.map((row: any) =>
            setItem(collectionName, {
                ...row.original,
                status: 'cancelled',
            })
        )
        table.resetRowSelection()
    }, [])

    const statusOptions: Record<string, string> =
        bookingsMetadata.properties.appointment_status?.misc?.options

    return (
        <div className="wbk_table__bulkActionsOuterWrapper">
            <div className="wbk_table__bulkActionsWrapper">
                <div className="wbk_table__selectedItemsCount">
                    <p>
                        {table.getSelectedRowModel().rows.length}{' '}
                        {__('items selected', 'webba-booking-lite')}
                    </p>
                    <span onClick={() => table.resetRowSelection()}>
                        {__('Clear selection', 'webba-booking-lite')}{' '}
                        <img
                            src={closeIcon}
                            alt={__('Clear selection', 'webba-booking-lite')}
                        />
                    </span>
                </div>
                <div className="wbk_table__bulkActionButtons">
                    {collectionName === 'appointments' && (
                        <select onChange={updateStatus}>
                            <option value="" selected disabled>
                                {__(
                                    'Change status to...',
                                    'webba-booking-lite'
                                )}
                            </option>
                            {Object.keys(statusOptions).map(
                                (option: string) => (
                                    <option value={option}>
                                        {statusOptions[option]}
                                    </option>
                                )
                            )}
                        </select>
                    )}
                    {collectionName === 'appointments' && (
                        <ConfirmationButton
                            title={__('Cancel selected', 'webba-booking-lite')}
                            confirmationMessage={__(
                                'Yes, cancel it',
                                'webba-booking-lite'
                            )}
                            icon={cancelIcon}
                            action={cancelBookings}
                            buttonType="custom"
                            classes="wbk_table__bulkButton"
                            wrapperClass="wbk_table__bulkButtonWrapper"
                            position="top"
                        />
                    )}
                    {onDeleteSelected && (
                        <ConfirmationButton
                            title={__('Delete selected', 'webba-booking-lite')}
                            confirmationMessage={__(
                                'Yes, delete it',
                                'webba-booking-lite'
                            )}
                            icon={deleteIcon}
                            action={() => {
                                onDeleteSelected()
                                table.resetRowSelection()
                            }}
                            buttonType="custom"
                            wrapperClass="wbk_table__bulkButtonWrapper"
                            classes="wbk_table__bulkButton"
                            position="top"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
