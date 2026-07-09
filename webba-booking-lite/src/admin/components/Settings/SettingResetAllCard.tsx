import './Settings.scss'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { useCallback, useState } from '@wordpress/element'
import { useDispatch } from '@wordpress/data'
import apiFetch from '@wordpress/api-fetch'
import { usePreset } from '../../hooks/usePreset'
import { Button } from '../Button/Button'
import { useConfirmationPopup } from '../ConfirmationPopup/ConfirmationPopupContext'
import { store } from '../../../store/backend'

interface ResetAllDataResponse {
    success?: boolean
    message?: string
    errors?: string[]
}

export const SettingResetAllCard = () => {
    const { reset_all_data_allowed } = usePreset()
    const { show: showConfirmation } = useConfirmationPopup()
    const { setToastNotification } = useDispatch(store)
    const [resetting, setResetting] = useState(false)

    const handleReset = useCallback(() => {
        showConfirmation({
            title: __('Reset all data?', 'webba-booking-lite'),
            message: __(
                'This will permanently delete all Webba entities (services, appointments, extras, etc.) and restore all plugin settings to their defaults. This cannot be undone.',
                'webba-booking-lite'
            ),
            buttonText: __('Reset everything', 'webba-booking-lite'),
            onConfirm: async () => {
                setResetting(true)

                try {
                    const response = await apiFetch<ResetAllDataResponse>({
                        path: '/wbk/v2/reset-all-data/',
                        method: 'POST',
                        data: { confirm: 'RESET' },
                    })

                    const message =
                        response?.message ||
                        (response?.success
                            ? __(
                                  'All entities were removed and options were reset.',
                                  'webba-booking-lite'
                              )
                            : __('Reset completed with errors.', 'webba-booking-lite'))

                    setToastNotification({
                        type: response?.success ? 'success' : 'error',
                        message,
                    })

                    if (response?.success) {
                        window.location.reload()
                    }
                } catch (error) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : __('Reset failed.', 'webba-booking-lite')

                    setToastNotification({
                        type: 'error',
                        message,
                    })
                } finally {
                    setResetting(false)
                }
            },
        })
    }, [showConfirmation, setToastNotification])

    if (!reset_all_data_allowed) {
        return null
    }

    return (
        <div
            className={classNames(
                'wbk_settings__section',
                'wbk_settings__section--resetAllCard'
            )}
        >
            <div className="wbk_settings__icon wbk_settings__icon--danger">
                <span aria-hidden="true">!</span>
            </div>
            <h2 className="wbk_settings__title">
                {__('Reset all data', 'webba-booking-lite')}
            </h2>
            <p className="wbk_settings__description">
                {__(
                    'Remove all Webba entities and restore plugin settings to defaults. For development use only.',
                    'webba-booking-lite'
                )}
            </p>
            <div className="wbk_settings__actions">
                <Button
                    type="secondary"
                    disabled={resetting}
                    isLoading={resetting}
                    onClick={handleReset}
                >
                    {resetting
                        ? __('Resetting…', 'webba-booking-lite')
                        : __('Reset everything', 'webba-booking-lite')}
                </Button>
            </div>
        </div>
    )
}
