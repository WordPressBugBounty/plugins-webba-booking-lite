import { useCallback, useEffect, useRef, useState, MouseEvent } from 'react'
import { __ } from '@wordpress/i18n'
import closeIcon from '../../../../../public/images/icon-close.svg'
import { BookingFormProvider } from '../../../providers/BookingFormProvider/BookingFormProvider'
import App from '../../../App'
import { IBookingFormPopupProps } from './types'
import './BookingFormPopup.scss'

const CLOSE_ANIMATION_MS = 320

export const BookingFormPopup = ({
    onClose,
    ...bookingFormAttrs
}: IBookingFormPopupProps) => {
    const dialogRef = useRef<HTMLDivElement>(null)
    const [isClosing, setIsClosing] = useState(false)

    const requestClose = useCallback(() => {
        setIsClosing(true)
    }, [])

    useEffect(() => {
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        dialogRef.current?.focus()

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                requestClose()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = previousOverflow
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [requestClose])

    useEffect(() => {
        if (!isClosing) {
            return
        }

        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches
        const timeoutId = window.setTimeout(
            onClose,
            prefersReducedMotion ? 0 : CLOSE_ANIMATION_MS
        )

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [isClosing, onClose])

    const handleBackdropClick = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            if (event.target === event.currentTarget) {
                requestClose()
            }
        },
        [requestClose]
    )

    const popupClassName = isClosing
        ? 'wbk_booking_form_popup wbk_booking_form_popup--closing'
        : 'wbk_booking_form_popup'

    return (
        <div
            ref={dialogRef}
            className={popupClassName}
            role="dialog"
            aria-modal="true"
            aria-label={__('Booking form', 'webba-booking-lite')}
            tabIndex={-1}
            onClick={handleBackdropClick}
        >
            <button
                className="wbk_booking_form_popup__close"
                onClick={requestClose}
                type="button"
                aria-label={__('Close', 'webba-booking-lite')}
            >
                <img src={closeIcon} alt="" />
            </button>
            <div className="wbk_booking_form_popup__content">
                <BookingFormProvider {...bookingFormAttrs}>
                    <App />
                </BookingFormProvider>
            </div>
        </div>
    )
}
