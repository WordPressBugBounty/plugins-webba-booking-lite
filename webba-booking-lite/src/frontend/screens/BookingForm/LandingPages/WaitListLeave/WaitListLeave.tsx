import { __ } from '@wordpress/i18n'
import { useEffect, useState } from 'react'
import { useDispatch } from '@wordpress/data'
import { store_name } from '../../../../../store/frontend'
import '../../ThankYou/ThankYou.scss'
import '../LandingPage.scss'
import iconCancel from '../../../../../../public/images/icon-cancel-red.svg'
import iconCheck from '../../../../../../public/images/icon-check.svg'
import classNames from 'classnames'
import { Button } from '../../../../components/Button/Button'
import { BookingFormProvider } from '../../../../providers/BookingFormProvider/BookingFormProvider'

interface IWaitListLeaveProps {
    token: string
}

interface IWaitListDetails {
    service_name?: string
    appointment_day?: string
    appointment_time?: string
    name?: string
}

const WaitListLeaveInner = ({ token }: IWaitListLeaveProps) => {
    const { unsubscribeWaitList, fetchWaitListSubscription } =
        useDispatch(store_name)
    const [details, setDetails] = useState<IWaitListDetails | null>(null)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [isLoadingDetails, setIsLoadingDetails] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [left, setLeft] = useState(false)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setIsLoadingDetails(true)
            try {
                const response = (await fetchWaitListSubscription(token)) as {
                    success?: boolean
                    error?: string
                    data?: IWaitListDetails
                }
                if (cancelled) return
                if (!response?.success || !response.data) {
                    setLoadError(
                        response?.error ||
                            __(
                                'Wait list subscription not found.',
                                'webba-booking-lite'
                            )
                    )
                    return
                }
                setDetails(response.data)
            } catch (e: any) {
                if (cancelled) return
                setLoadError(
                    e?.message ||
                        __(
                            'Wait list subscription not found.',
                            'webba-booking-lite'
                        )
                )
            } finally {
                if (!cancelled) {
                    setIsLoadingDetails(false)
                }
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [token, fetchWaitListSubscription])

    const handleLeave = async () => {
        if (isSubmitting || left) return
        setIsSubmitting(true)
        setSubmitError(null)
        try {
            const response = (await unsubscribeWaitList({ token })) as {
                success?: boolean
                error?: string
            }
            if (!response?.success) {
                setSubmitError(
                    response?.error ||
                        __(
                            'Could not leave the wait list. Please try again.',
                            'webba-booking-lite'
                        )
                )
                return
            }
            setLeft(true)
        } catch (e: any) {
            setSubmitError(
                e?.message ||
                    __(
                        'Could not leave the wait list. Please try again.',
                        'webba-booking-lite'
                    )
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const slotLabel =
        details?.service_name || details?.appointment_day || details?.appointment_time
            ? [
                  details?.service_name,
                  [details?.appointment_day, details?.appointment_time]
                      .filter(Boolean)
                      .join(' at '),
              ]
                  .filter(Boolean)
                  .join(' · ')
            : null

    return (
        <div className="wbk_thank_you__wrapper">
            <div className="wbk_thank_you__native-scroll">
                <div className="wbk_thank_you__inner-wrapper">
                    {isLoadingDetails && !loadError && !details ? (
                        <div className="wbk_thank_you__header wbk_thank_you__header--visible">
                            <div className="wbk_thank_you__header__content">
                                <p>
                                    {__('Loading...', 'webba-booking-lite')}
                                </p>
                            </div>
                        </div>
                    ) : loadError ? (
                        <div className="wbk_thank_you__header wbk_thank_you__header--visible">
                            <div className="wbk_cancel_icon_bg">
                                <img
                                    src={iconCancel}
                                    alt={__(
                                        'Wait list',
                                        'webba-booking-lite'
                                    )}
                                />
                            </div>
                            <div className="wbk_thank_you__header__content">
                                <h3>
                                    {__(
                                        'Wait list entry not found',
                                        'webba-booking-lite'
                                    )}
                                </h3>
                                <p>{loadError}</p>
                            </div>
                        </div>
                    ) : left ? (
                        <div className="wbk_thank_you__header wbk_thank_you__header--visible">
                            <img
                                src={iconCheck}
                                alt={__(
                                    'Left wait list',
                                    'webba-booking-lite'
                                )}
                            />
                            <div className="wbk_thank_you__header__content">
                                <h3>
                                    {__(
                                        'You left the wait list',
                                        'webba-booking-lite'
                                    )}
                                </h3>
                                <p>
                                    {__(
                                        'You will no longer receive notifications for this time slot.',
                                        'webba-booking-lite'
                                    )}
                                </p>
                                {slotLabel && <p>{slotLabel}</p>}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div
                                className={classNames(
                                    'wbk_thank_you__header',
                                    'wbk_thank_you__header--visible'
                                )}
                            >
                                <div className="wbk_cancel_icon_bg">
                                    <img
                                        src={iconCancel}
                                        alt={__(
                                            'Leave wait list',
                                            'webba-booking-lite'
                                        )}
                                    />
                                </div>
                                <div className="wbk_thank_you__header__content">
                                    <h3>
                                        {__(
                                            'Leave wait list',
                                            'webba-booking-lite'
                                        )}
                                    </h3>
                                    <p>
                                        {__(
                                            'Confirm that you want to leave the wait list for this time slot. You will stop receiving availability emails for it.',
                                            'webba-booking-lite'
                                        )}
                                    </p>
                                    {slotLabel && <p>{slotLabel}</p>}
                                </div>
                            </div>
                            <div className="wbk_landing_page__action-button-container">
                                <Button
                                    type="error"
                                    title={__(
                                        'Leave wait list',
                                        'webba-booking-lite'
                                    )}
                                    showLoading={isSubmitting}
                                    onClick={handleLeave}
                                    disabled={isSubmitting}
                                />
                                {submitError && (
                                    <span className="wbk_landing_page__action-button-error">
                                        {submitError}
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export const WaitListLeave = (props: IWaitListLeaveProps) => (
    <BookingFormProvider attrService={null} attrCategory={null} attrLocation={null}>
        <WaitListLeaveInner {...props} />
    </BookingFormProvider>
)
