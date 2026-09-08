import { __ } from '@wordpress/i18n'
import { useEffect } from 'react'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { useField } from '../../lib/hooks/useField'
import { usePushSubscription } from '../../../../hooks/usePushSubscription'
import './PushSubscribeField.scss'

export const createPushSubscribeField: FormComponentConstructor<any> = ({
    field,
}) => {
    return ({ label }: FormFieldProps) => {
        const { setValue } = useField(field)
        const { isLoading, isSubscribed, status, enable, disable, sendTest } =
            usePushSubscription()

        useEffect(() => {
            setValue(isSubscribed ? 'true' : '')
        }, [isSubscribed, setValue])

        const handleEnable = async () => {
            const enabled = await enable()
            if (enabled) {
                setValue('true')
            }
        }

        const handleDisable = async () => {
            const disabled = await disable()
            if (disabled) {
                setValue('')
            }
        }

        return (
            <div className="wbk_pushSubscribeField">
                {label && (
                    <div className="wbk_pushSubscribeField__label">{label}</div>
                )}
                <div className="wbk_pushSubscribeField__row">
                    {!isSubscribed && (
                        <button
                            type="button"
                            className="wbk_pushSubscribeField__button"
                            onClick={handleEnable}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? __('Enabling...', 'webba-booking-lite')
                                : __(
                                      'Enable on this browser',
                                      'webba-booking-lite'
                                  )}
                        </button>
                    )}
                    {isSubscribed && (
                        <>
                            <button
                                type="button"
                                className="wbk_pushSubscribeField__button wbk_pushSubscribeField__button--secondary"
                                onClick={handleDisable}
                                disabled={isLoading}
                            >
                                {__('Disable', 'webba-booking-lite')}
                            </button>
                            <button
                                type="button"
                                className="wbk_pushSubscribeField__button wbk_pushSubscribeField__button--secondary"
                                onClick={sendTest}
                                disabled={isLoading}
                            >
                                {__('Send test', 'webba-booking-lite')}
                            </button>
                        </>
                    )}
                </div>
                {status && (
                    <p
                        className={`wbk_pushSubscribeField__status wbk_pushSubscribeField__status--${status.type}`}
                    >
                        {status.message}
                    </p>
                )}
            </div>
        )
    }
}
