import { useCallback, useEffect, useState } from 'react'
import apiFetch from '@wordpress/api-fetch'
import { __ } from '@wordpress/i18n'
import {
    getSubscriptionPayload,
    getWbkPushRegistrations,
    isPushSupported,
    registerPushServiceWorker,
    urlBase64ToUint8Array,
    waitForPushReceived,
} from '../components/Form/Fields/PushSubscribeField/utils'
import {
    PushApiResponse,
    PushConfigResponse,
    PushStatusMessage,
} from '../components/Form/Fields/PushSubscribeField/types'

export const usePushSubscription = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [status, setStatus] = useState<PushStatusMessage | null>(null)
    const [config, setConfig] = useState<PushConfigResponse | null>(null)

    const refreshSubscriptionState = useCallback(
        async (serviceWorkerUrl: string): Promise<PushSubscription | null> => {
            const registration =
                await registerPushServiceWorker(serviceWorkerUrl)
            const subscription =
                await registration.pushManager.getSubscription()
            setIsSubscribed(Boolean(subscription))
            return subscription
        },
        []
    )

    useEffect(() => {
        let cancelled = false

        const load = async () => {
            if (!isPushSupported()) {
                setIsReady(true)
                return
            }

            try {
                const result = (await apiFetch({
                    path: 'wbk/v2/push/config',
                })) as PushConfigResponse

                if (cancelled) {
                    return
                }

                setConfig(result)
                if (result.serviceWorkerUrl) {
                    await refreshSubscriptionState(result.serviceWorkerUrl)
                }
            } catch (error: any) {
                if (!cancelled) {
                    setStatus({
                        type: 'error',
                        message:
                            error?.message ||
                            __(
                                'Failed to load browser notification settings.',
                                'webba-booking-lite'
                            ),
                    })
                }
            } finally {
                if (!cancelled) {
                    setIsReady(true)
                }
            }
        }

        load()

        return () => {
            cancelled = true
        }
    }, [refreshSubscriptionState])

    const loadConfig = useCallback(async (): Promise<PushConfigResponse | null> => {
        if (config?.publicKey && config.serviceWorkerUrl) {
            return config
        }

        try {
            const result = (await apiFetch({
                path: 'wbk/v2/push/config',
            })) as PushConfigResponse
            setConfig(result)
            return result
        } catch (error: any) {
            setStatus({
                type: 'error',
                message:
                    error?.message ||
                    __(
                        'Browser notification keys could not be generated. Check that OpenSSL is enabled on the server.',
                        'webba-booking-lite'
                    ),
            })
            return null
        }
    }, [config])

    const enable = useCallback(async (): Promise<boolean> => {
        setStatus(null)

        if (!isPushSupported()) {
            setStatus({
                type: 'error',
                message: __(
                    'Browser notifications require HTTPS and a supported browser.',
                    'webba-booking-lite'
                ),
            })
            return false
        }

        const pushConfig = await loadConfig()
        if (!pushConfig?.publicKey || !pushConfig.serviceWorkerUrl) {
            setStatus({
                type: 'error',
                message:
                    pushConfig?.keyError ||
                    __(
                        'Browser notification keys could not be generated. Check that OpenSSL is enabled on the server.',
                        'webba-booking-lite'
                    ),
            })
            return false
        }

        setIsLoading(true)

        try {
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                setStatus({
                    type: 'error',
                    message: __(
                        'Notification permission was not granted.',
                        'webba-booking-lite'
                    ),
                })
                return false
            }

            const registration = await registerPushServiceWorker(
                pushConfig.serviceWorkerUrl
            )
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(pushConfig.publicKey),
            })
            const payload = getSubscriptionPayload(subscription)
            if (!payload) {
                throw new Error(
                    __(
                        'The browser did not return a valid notification subscription.',
                        'webba-booking-lite'
                    )
                )
            }

            const result = (await apiFetch({
                path: 'wbk/v2/push/subscribe',
                method: 'POST',
                data: payload,
            })) as PushApiResponse

            if (result?.status === 'success') {
                setIsSubscribed(true)
                setStatus({
                    type: 'success',
                    message:
                        result.message ||
                        __(
                            'Browser notifications enabled for this browser.',
                            'webba-booking-lite'
                        ),
                })
                return true
            }

            setStatus({
                type: 'error',
                message:
                    result?.message ||
                    __(
                        'Failed to enable browser notifications.',
                        'webba-booking-lite'
                    ),
            })
            return false
        } catch (error: any) {
            setStatus({
                type: 'error',
                message:
                    error?.message ||
                    __(
                        'Failed to enable browser notifications.',
                        'webba-booking-lite'
                    ),
            })
            return false
        } finally {
            setIsLoading(false)
        }
    }, [loadConfig])

    const disable = useCallback(async (): Promise<boolean> => {
        setStatus(null)
        setIsLoading(true)

        try {
            const registrations = await getWbkPushRegistrations()
            for (const registration of registrations) {
                const subscription =
                    await registration.pushManager.getSubscription()
                if (subscription) {
                    const payload = getSubscriptionPayload(subscription)
                    await subscription.unsubscribe()
                    if (payload) {
                        await apiFetch({
                            path: 'wbk/v2/push/unsubscribe',
                            method: 'POST',
                            data: { endpoint: payload.endpoint },
                        })
                    }
                }
            }

            setIsSubscribed(false)
            setStatus({
                type: 'success',
                message: __(
                    'Browser notifications disabled for this browser.',
                    'webba-booking-lite'
                ),
            })
            return true
        } catch (error: any) {
            setStatus({
                type: 'error',
                message:
                    error?.message ||
                    __(
                        'Failed to disable browser notifications.',
                        'webba-booking-lite'
                    ),
            })
            return false
        } finally {
            setIsLoading(false)
        }
    }, [])

    const sendTest = useCallback(async (): Promise<boolean> => {
        setStatus(null)
        setIsLoading(true)

        try {
            const receivedPromise = waitForPushReceived(8000)
            const result = (await apiFetch({
                path: 'wbk/v2/push/test',
                method: 'POST',
            })) as PushApiResponse

            if (result?.status !== 'success') {
                setStatus({
                    type: 'error',
                    message:
                        result?.message ||
                        __(
                            'Failed to send the test browser notification.',
                            'webba-booking-lite'
                        ),
                })
                return false
            }

            const received = await receivedPromise
            if (!received) {
                setStatus({
                    type: 'error',
                    message: __(
                        'The server sent the notification, but this browser did not receive it. Disable and enable browser notifications again, then allow Chrome in macOS Notifications.',
                        'webba-booking-lite'
                    ),
                })
                return false
            }

            setStatus({
                type: 'success',
                message:
                    result.message ||
                    __('Test browser notification sent.', 'webba-booking-lite'),
            })
            return true
        } catch (error: any) {
            setStatus({
                type: 'error',
                message:
                    error?.message ||
                    __(
                        'Failed to send the test browser notification.',
                        'webba-booking-lite'
                    ),
            })
            return false
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        isSupported: isPushSupported(),
        isReady,
        isLoading,
        isSubscribed,
        status,
        config,
        enable,
        disable,
        sendTest,
    }
}
