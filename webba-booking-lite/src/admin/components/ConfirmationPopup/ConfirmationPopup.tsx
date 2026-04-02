import './ConfirmationPopup.scss'
import { Button } from '../Button/Button'
import { __ } from '@wordpress/i18n'
import { useEffect } from 'react'
import closeIcon from '../../../../public/images/icon-close.svg'
import { useConfirmationPopup } from './ConfirmationPopupContext'

export const ConfirmationPopup = () => {
    const { isVisible, data, hide } = useConfirmationPopup()

    useEffect(() => {
        if (isVisible) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isVisible])

    if (!isVisible || !data) {
        return null
    }

    const handleConfirm = () => {
        data.onConfirm()
        hide()
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            hide()
        }
    }

    return (
        <div className="wbk_confirmationPopup" onClick={handleBackdropClick}>
            <div className="wbk_confirmationPopup__modal">
                <button
                    className="wbk_confirmationPopup__closeButton"
                    onClick={hide}
                    type="button"
                >
                    <img src={closeIcon} alt="Close" />
                </button>
                <div className="wbk_confirmationPopup__content">
                    <h2 className="wbk_confirmationPopup__title">{data.title}</h2>
                    <p className="wbk_confirmationPopup__message">{data.message}</p>
                </div>
                <div className="wbk_confirmationPopup__actions">
                    <Button type="secondary" onClick={hide}>
                        {__('Cancel', 'webba-booking-lite')}
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleConfirm}
                        className="wbk_confirmationPopup__confirmButton"
                    >
                        {data?.buttonText || __('Confirm', 'webba-booking-lite')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
