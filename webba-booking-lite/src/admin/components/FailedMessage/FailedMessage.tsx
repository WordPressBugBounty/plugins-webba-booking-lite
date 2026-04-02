import { useSelect } from '@wordpress/data'
import { useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'
import { __ } from '@wordpress/i18n'
import './FailedMessage.scss'
import { ReactComponent as ErrorIcon } from '../../../../public/images/icon-error-circle.svg'
import { store } from '../../../store/backend'

export const FailedMessage = () => {
    const deleteFailed = useSelect(
        (select) => select(store).getDeleteFailed(),
        []
    )

    const MessageWrapper = ({ message }: { message: string }) => (
        <div className="wbk_failedMessage__messageWrapper">
            <div className="wbk_failedMessage__iconContainer">
                <ErrorIcon className="wbk_failedMessage__icon" />
            </div>
            <span className="wbk_failedMessage__message">{message}</span>
        </div>
    )

    const errorMessage = useMemo(
        () =>
            __(
                'You do not have the necessary permissions to perform this action.',
                'webba-booking-lite'
            ),
        []
    )

    useEffect(() => {
        if (deleteFailed === true) {
            toast.dismiss()
            toast.error(
                <MessageWrapper message={errorMessage} />,
                {
                    autoClose: 3000,
                    closeOnClick: true,
                    containerId: 'wbk-toast-container',
                }
            )
        }
    }, [deleteFailed, errorMessage])

    return null
}
