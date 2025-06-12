import { useSelect } from '@wordpress/data'
import { store_name } from '../../../store'
import { useEffect, useMemo, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { __ } from '@wordpress/i18n'

export const FailedMessage = () => {
    const deleteFailed = useSelect(
        // @ts-ignore
        (select) => select(store_name).getDeleteFailed(),
        []
    )

    const errorMessage = useMemo(
        () => (
            <p>
                {__(
                    'You do not have the necessary permissions to perform this action.',
                    'webba-booking-lite'
                )}
            </p>
        ),
        []
    )

    useEffect(() => {
        if (deleteFailed === true) {
            toast.error(errorMessage, {
                theme: 'colored',
                autoClose: 3000,
                closeOnClick: true,
            })
        }
    }, [deleteFailed])

    return <ToastContainer limit={1} />
}
