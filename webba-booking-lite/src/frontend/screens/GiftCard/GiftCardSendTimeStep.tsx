import { useEffect } from 'react'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { createFormFields } from '../../components/Form/utils'
import { useForm } from '../../components/Form/FormProvider'
import { IFormContext } from '../../components/Form/types'
import { GiftCardTimezoneSelect } from './GiftCardTimezoneSelect'
import { GiftCardSendTimeStepProps } from './types'
import { openNativeDatePicker, todayIsoDate } from './utils'

export const GiftCardSendTimeStep = ({
    sendOn,
    setSendOn,
    sendOnError,
    setSendOnError,
    sendOnTouched,
    setSendOnTouched,
    validateSendOn,
    sendTime,
    setSendTime,
    sendTimezone,
    setSendTimezone,
}: GiftCardSendTimeStepProps) => {
    const { fields, anyTouched } = useForm() as IFormContext
    const sendTiming = String(
        fields.find((field) => field.slug === 'send_timing')?.value ?? 'now'
    )
    const showSchedule = sendTiming === 'later'
    const showSendOnError =
        showSchedule && !!sendOnError && (anyTouched || sendOnTouched)

    useEffect(() => {
        if (sendTiming === 'later') {
            const nextDate = sendOn || todayIsoDate()
            if (!sendOn) {
                setSendOn(nextDate)
            }
            setSendOnError(validateSendOn(nextDate, sendTime, sendTimezone))
            return
        }

        setSendOnError(null)
    }, [sendTiming])

    const applySchedule = (date: string, time: string, timezone: string) => {
        setSendOnTouched(true)
        setSendOnError(validateSendOn(date, time, timezone))
    }

    return (
        <div className="wbk_gift_card__section">
            <h3 className="wbk_gift_card__section-title">
                {__('When should we send it?', 'webba-booking-lite')}
            </h3>
            {createFormFields(
                fields.filter((field) => field.slug === 'send_timing'),
                anyTouched
            )}
            {showSchedule && (
                <div className="wbk_gift_card__schedule">
                    <div className="wbk_gift_card__schedule-row">
                        <div className="wbk_gift_card__schedule-field">
                            <label
                                htmlFor="wbk_gift_card_send_on"
                                className="wbk_input__label"
                            >
                                {__('Send date', 'webba-booking-lite')}
                            </label>
                            <input
                                id="wbk_gift_card_send_on"
                                name="send_on"
                                type="date"
                                min={todayIsoDate()}
                                value={sendOn}
                                onClick={openNativeDatePicker}
                                onChange={(event) => {
                                    const value = event.target.value
                                    setSendOn(value)
                                    applySchedule(value, sendTime, sendTimezone)
                                }}
                                className={classNames('wbk_input__main', {
                                    'wbk_input__main--error': showSendOnError,
                                })}
                            />
                        </div>
                        <div className="wbk_gift_card__schedule-field">
                            <label
                                htmlFor="wbk_gift_card_send_time"
                                className="wbk_input__label"
                            >
                                {__('Send time', 'webba-booking-lite')}
                            </label>
                            <input
                                id="wbk_gift_card_send_time"
                                name="send_time"
                                type="time"
                                value={sendTime}
                                onClick={openNativeDatePicker}
                                onChange={(event) => {
                                    const value = event.target.value
                                    setSendTime(value)
                                    applySchedule(sendOn, value, sendTimezone)
                                }}
                                className={classNames('wbk_input__main', {
                                    'wbk_input__main--error': showSendOnError,
                                })}
                            />
                        </div>
                        <GiftCardTimezoneSelect
                            value={sendTimezone}
                            onChange={(zone) => {
                                setSendTimezone(zone)
                                applySchedule(sendOn, sendTime, zone)
                            }}
                        />
                    </div>
                    {showSendOnError && (
                        <div className="wbk_input__error wbk_gift_card__schedule-error">
                            {sendOnError}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
