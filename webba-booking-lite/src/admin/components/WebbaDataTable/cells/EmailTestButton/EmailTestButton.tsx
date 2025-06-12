import { CellContext } from '@tanstack/react-table'
import { __ } from '@wordpress/i18n'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import apiFetch from '@wordpress/api-fetch'
import emailTestIcon from '../../../../../../public/images/email-test-icon.png'
import successIcon from '../../../../../../public/images/succesessful-icon.png'
import sendIcon from '../../../../../../public/images/arrow-right-custom-active-icon.png'
import styles from './EmailTestButton.module.scss'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import classNames from 'classnames'
import Select from 'react-select'
import closeIcon from '../../../../../../public/images/close-icon2.png'

export const EmailTestButton = ({ cell, row }: CellContext<any, any>) => {
    const { id, recipients, template: message, subject } = row.original
    const [isEligible, errorMessage] = useMemo<[boolean, string]>(() => {
        if (typeof recipients === 'string') {
            if (JSON.parse(recipients).length === 0) {
                return [
                    false,
                    __(
                        'Please add recipients to continue',
                        'webba-booking-lite'
                    ),
                ]
            }
        } else if (Array.isArray(recipients) && recipients.length === 0) {
            return [
                false,
                __('Please add recipients to continue', 'webba-booking-lite'),
            ]
        }

        if (!message) {
            return [
                false,
                __('Please add email body to continue', 'webba-booking-lite'),
            ]
        }

        if (!subject) {
            return [
                false,
                __(
                    'Please add email subject to continue',
                    'webba-booking-lite'
                ),
            ]
        }

        return [true, '']
    }, [recipients, message, subject])

    const { current_user_email } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const [selectedBookings, setSelectedBookings] = useState([])
    const [email, setEmail] = useState(current_user_email || null)
    const [step, setStep] = useState(cell.row.original?.__testEmailStep || 1)
    const updateStep = useCallback(
        (step: number) => {
            cell.row.original.__testEmailStep = step
            setStep(step)
        },
        [step]
    )

    const bookings = useSelect(
        // @ts-ignore
        (select) => select(store_name).getItems('appointments'),
        []
    )
    const filteredBookings = useMemo(() => {
        const relatedServices = cell.row.original?.services || []
        const isAllServices = cell.row.original?.use_for_all_services || false

        return bookings
            .filter(
                (booking: any) =>
                    isAllServices ||
                    relatedServices.includes(booking?.service_id)
            )
            .slice(0, 15)
    }, [bookings, cell.row.original])

    const sendTestEmail = useCallback(async () => {
        const result: any = await apiFetch({
            path: `wbk/v2/send-test-email/`,
            method: 'POST',
            data: {
                email,
                id: cell.row.original.id,
                bookings: selectedBookings.map((booking: any) => booking.value),
            },
        })

        if (result?.status === 'success') {
            updateStep(1)
        }
    }, [cell, email, step, selectedBookings])

    useEffect(() => {
        if (step === 4) {
            sendTestEmail()
        }
    }, [step])

    return (
        <div
            className={classNames({
                [styles.pop]: step > 1 && step < 5,
            })}
            onClick={(e: any) => {
                updateStep(1)
            }}
        >
            <div
                className={styles.innerWrapper}
                onClick={(e: any) => e.stopPropagation()}
            >
                <div onClick={() => updateStep(1)} className={styles.closeIcon}>
                    <img
                        src={closeIcon}
                        alt={__('Close icon', 'webba-booking-lite')}
                    />
                </div>
                <div className={styles.header}>
                    <img
                        src={emailTestIcon}
                        alt={__('Test email icon', 'webba-booking-lite')}
                    />
                    <p>
                        {__('Email test: ', 'webba-booking-lite')}
                        {cell.row.original.name}
                    </p>
                </div>
                <div className={styles.wrapper}>
                    {step === 2 && isEligible && (
                        <Select
                            value={selectedBookings}
                            isMulti
                            options={filteredBookings.map((b: any) => {
                                return { label: b.name, value: b.id }
                            })}
                            onChange={(selectedOptions) =>
                                setSelectedBookings(selectedOptions as any)
                            }
                            isClearable={false}
                            className={styles.selectBox}
                            classNames={{
                                control: (state) => styles.selectControl,
                            }}
                            placeholder={__(
                                'Select bookings to test',
                                'webba-booking-lite'
                            )}
                        />
                    )}
                    {step === 3 && isEligible && (
                        <input
                            type="email"
                            value={email}
                            placeholder="emailtotest@test.com"
                            className={styles.inputEmail}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    )}
                    <button
                        onClick={() => updateStep(step + 1)}
                        className={classNames(styles.buttonWrapper, {
                            [styles.noCutRadius]: step === 4,
                            [styles.hidden]: step > 1 && !isEligible,
                        })}
                        disabled={
                            (step === 2 && !selectedBookings.length) ||
                            (step === 3 && !email) ||
                            step === 5 ||
                            (step === 4 && isEligible)
                        }
                    >
                        {step === 1 && (
                            <img
                                src={emailTestIcon}
                                alt={__('Test', 'webba-booking-lite')}
                            />
                        )}
                        {step === 1 && __('Test', 'webba-booking-lite')}
                        {step === 2 &&
                            isEligible &&
                            __('Next', 'webba-booking-lite')}
                        {step === 3 &&
                            isEligible &&
                            __('Send', 'webba-booking-lite')}
                        {step === 5 && isEligible && (
                            <img
                                src={successIcon}
                                alt={__('Success', 'webba-booking-lite')}
                            />
                        )}
                        {step === 4 &&
                            isEligible &&
                            __('Sending...', 'webba-booking-lite')}
                        {step === 5 &&
                            isEligible &&
                            __('Sent', 'webba-booking-lite')}
                    </button>
                    {step > 1 && !isEligible && (
                        <p className={styles.error}>{errorMessage}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
