import { FormEvent, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { __ } from '@wordpress/i18n'
import { useDispatch } from '@wordpress/data'
import { store_name } from '../../../store/frontend'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { useWording } from '../../hooks/useWording'
import { useLocale } from '../../hooks/useLocale'
import { Button } from '../Button/Button'
import { Validators } from '../Form/validation'
import closeIcon from '../../../../public/images/icon-close.svg'
import { wbkFormat } from '../../../admin/components/Form/utils/dateTime'
import { getDateFnsLocale } from '../../../utilities/timezones'
import { IWaitListPopupProps } from './types'
import '../Fields/Fields.scss'
import './WaitListPopup.scss'

export const WaitListPopup = ({
    isOpen,
    pendingSlot,
    onClose,
    onSuccess,
}: IWaitListPopupProps) => {
    const { popupPortalElement, timeFormat, userTimezone, dateFormat } =
        useBookingContext()
    const { subscribeWaitList } = useDispatch(store_name)
    const wording = useWording()
    const { locale } = useLocale()
    const dateFnsLocale = getDateFnsLocale(locale || 'en')

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        setName('')
        setEmail('')
        setError(null)
        setSuccess(false)
        setIsSubmitting(false)
    }, [isOpen, pendingSlot?.time, pendingSlot?.serviceId])

    useEffect(() => {
        if (!popupPortalElement) return
        if (isOpen) {
            popupPortalElement.classList.add(
                'wbk_booking_form__popup-portal--active'
            )
        } else {
            popupPortalElement.classList.remove(
                'wbk_booking_form__popup-portal--active'
            )
        }
        return () => {
            popupPortalElement.classList.remove(
                'wbk_booking_form__popup-portal--active'
            )
        }
    }, [isOpen, popupPortalElement])

    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const isFormValid = useMemo(
        () =>
            trimmedName !== '' &&
            trimmedEmail !== '' &&
            Validators.email(trimmedEmail) === true,
        [trimmedName, trimmedEmail]
    )

    if (!isOpen || !pendingSlot || !popupPortalElement) {
        return null
    }

    const slotLabel = wbkFormat(
        pendingSlot.time,
        `${dateFormat || 'Y-m-d'} ${timeFormat}`,
        userTimezone,
        { locale: dateFnsLocale }
    )

    const submit = async () => {
        if (isSubmitting || success || !pendingSlot || !isFormValid) return

        setIsSubmitting(true)
        setError(null)
        try {
            const response = (await subscribeWaitList({
                service_id: pendingSlot.serviceId,
                time: pendingSlot.time,
                email: trimmedEmail,
                name: trimmedName,
                staff_member_id: pendingSlot.staffMemberId || null,
                quantity: pendingSlot.quantity || 1,
            })) as {
                success?: boolean
                error?: string
                data?: { already_subscribed?: boolean }
            }

            if (!response?.success) {
                setError(
                    response?.error ||
                        __(
                            'Could not join the wait list. Please try again.',
                            'webba-booking-lite'
                        )
                )
                return
            }
            setSuccess(true)
            onSuccess?.(pendingSlot)
        } catch (e: any) {
            const message =
                e?.message ||
                e?.data?.error ||
                __(
                    'Could not join the wait list. Please try again.',
                    'webba-booking-lite'
                )
            setError(String(message))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        await submit()
    }

    const popupContent = (
        <div
            className="wbk_wait_list_popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wbk_wait_list_popup_title"
        >
            <div className="wbk_wait_list_popup__modal">
                <button
                    className="wbk_wait_list_popup__close"
                    onClick={onClose}
                    type="button"
                    aria-label={__('Close', 'webba-booking-lite')}
                >
                    <img src={closeIcon} alt="" />
                </button>
                <h2
                    id="wbk_wait_list_popup_title"
                    className="wbk_wait_list_popup__title"
                >
                    {wording.wait_list_popup_title ||
                        __('Get notified', 'webba-booking-lite')}
                </h2>
                <p className="wbk_wait_list_popup__subtitle">
                    {pendingSlot.serviceLabel}
                </p>
                <p className="wbk_wait_list_popup__slot">{slotLabel}</p>
                <p className="wbk_wait_list_popup__hint">
                    {__(
                        "We'll email you if this time opens up. Availability is not reserved.",
                        'webba-booking-lite'
                    )}
                </p>

                {success ? (
                    <>
                        <div className="wbk_wait_list_popup__success">
                            {wording.wait_list_success ||
                                __(
                                    "You're on the wait list",
                                    'webba-booking-lite'
                                )}
                        </div>
                        <div className="wbk_wait_list_popup__actions">
                            <Button type="primary" onClick={onClose}>
                                {__('Close', 'webba-booking-lite')}
                            </Button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="wbk_input">
                            <input
                                id="wbk_wait_list_name"
                                name="wbk_wait_list_name"
                                className="wbk_input__main"
                                type="text"
                                placeholder={__('Name', 'webba-booking-lite')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isSubmitting}
                                autoComplete="name"
                                required
                            />
                        </div>
                        <div className="wbk_input">
                            <input
                                id="wbk_wait_list_email"
                                name="wbk_wait_list_email"
                                className="wbk_input__main"
                                type="email"
                                placeholder={__('Email', 'webba-booking-lite')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                                autoComplete="email"
                                required
                            />
                        </div>
                        {error && (
                            <div className="wbk_input__error">{error}</div>
                        )}
                        <div className="wbk_wait_list_popup__actions">
                            <Button
                                type="primary"
                                disabled={isSubmitting || !isFormValid}
                                showLoading={isSubmitting}
                                onClick={submit}
                            >
                                {wording.wait_list_button ||
                                    __(
                                        'Join wait list',
                                        'webba-booking-lite'
                                    )}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )

    return createPortal(popupContent, popupPortalElement)
}
