import { useDispatch, useSelect } from '@wordpress/data'
import { useEffect, useRef } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { store } from '../../../store/backend'
import './SuccessMessage.scss'
import { ReactComponent as SuccessIcon } from '../../../../public/images/icon-success-circle.svg'
import { ReactComponent as ErrorIcon } from '../../../../public/images/icon-error-circle.svg'
import { ReactComponent as InfoIcon } from '../../../../public/images/icon-info-circle.svg'
import { ReactComponent as WarningIcon } from '../../../../public/images/icon-warning-circle.svg'

export const SuccessMessage = () => {
    const toastNotification = useSelect(
        (select) => select(store).getToastNotification(),
        []
    )
    const { setToastNotification } = useDispatch(store)
    const displayedKeyRef = useRef<number | null>(null)

    const toastConfig = {
        autoClose: 2000,
        closeOnClick: true,
        containerId: 'wbk-toast-container',
    }

    const MessageWrapper = ({ 
        message, 
        type 
    }: { 
        message: string
        type: 'success' | 'error' | 'info' | 'warning'
    }) => (
        <div className="wbk_successMessage__messageWrapper">
            <div className="wbk_successMessage__iconContainer">
                {type === 'success' && <SuccessIcon className="wbk_successMessage__icon" />}
                {type === 'error' && <ErrorIcon className="wbk_successMessage__icon" />}
                {type === 'info' && <InfoIcon className="wbk_successMessage__icon" />}
                {type === 'warning' && <WarningIcon className="wbk_successMessage__icon" />}
            </div>
            <span className="wbk_successMessage__message">{message}</span>
        </div>
    )

    useEffect(() => {
        if (
            toastNotification &&
            toastNotification.message &&
            toastNotification.type
        ) {
            const key =
                toastNotification.key ||
                `${toastNotification.type}:${toastNotification.message}`

            if (displayedKeyRef.current !== key) {
                displayedKeyRef.current = key
                toast.dismiss()

                switch (toastNotification.type) {
                    case 'success':
                        toast.success(
                            <MessageWrapper
                                message={toastNotification.message}
                                type="success"
                            />,
                            { ...toastConfig }
                        )
                        setToastNotification(null)
                        break
                    case 'error':
                        toast.error(
                            <MessageWrapper
                                message={toastNotification.message}
                                type="error"
                            />,
                            { ...toastConfig }
                        )
                        setToastNotification(null)
                        break
                    case 'info':
                        toast.info(
                            <MessageWrapper
                                message={toastNotification.message}
                                type="info"
                            />,
                            { ...toastConfig }
                        )
                        setToastNotification(null)
                        break
                    case 'warning':
                        toast.warn(
                            <MessageWrapper
                                message={toastNotification.message}
                                type="warning"
                            />,
                            { ...toastConfig }
                        )
                        setToastNotification(null)
                        break
                    default:
                        break
                }
            }
        } else {
            displayedKeyRef.current = null
        }
    }, [toastNotification, setToastNotification])

    return (
        <ToastContainer
            limit={1}
            newestOnTop
            position="top-right"
            className="wbk_successMessage__toastContainer"
            containerId="wbk-toast-container"
        />
    )
}
