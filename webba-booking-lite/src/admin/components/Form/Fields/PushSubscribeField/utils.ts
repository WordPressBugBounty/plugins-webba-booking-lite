import { __ } from '@wordpress/i18n'
import { PushSubscriptionPayload } from './types'

export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
}

export const isPushSupported = (): boolean => {
    return (
        window.isSecureContext &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    )
}

export const getSubscriptionPayload = (
    subscription: PushSubscription
): PushSubscriptionPayload | null => {
    const json = subscription.toJSON()
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        return null
    }

    return {
        endpoint: json.endpoint,
        keys: {
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
        },
    }
}

export const PUSH_RECEIVED_MESSAGE = 'wbk-push-received'

export const getScriptPath = (url: string): string => {
    try {
        return new URL(url, window.location.origin).pathname
    } catch (error) {
        return url.split('?')[0]
    }
}

export const isWbkPushWorkerUrl = (scriptUrl: string): boolean => {
    const scriptPath = getScriptPath(scriptUrl)
    return (
        scriptPath.includes('wbk-push-sw.js') ||
        scriptUrl.includes('wbk_push_service_worker')
    )
}

export const getRegistrationScriptUrl = (
    registration: ServiceWorkerRegistration
): string => {
    return (
        registration.active?.scriptURL ||
        registration.waiting?.scriptURL ||
        registration.installing?.scriptURL ||
        ''
    )
}

export const getWbkPushRegistrations = async (): Promise<
    ServiceWorkerRegistration[]
> => {
    const registrations = await navigator.serviceWorker.getRegistrations()
    return registrations.filter((registration) =>
        isWbkPushWorkerUrl(getRegistrationScriptUrl(registration))
    )
}

export const waitForPushReceived = (timeoutMs: number): Promise<boolean> => {
    return new Promise((resolve) => {
        let settled = false
        let channel: BroadcastChannel | null = null

        const finish = (value: boolean) => {
            if (settled) {
                return
            }
            settled = true
            window.clearTimeout(timer)
            navigator.serviceWorker.removeEventListener('message', onMessage)
            if (channel) {
                channel.onmessage = null
                channel.close()
            }
            resolve(value)
        }

        const onMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === PUSH_RECEIVED_MESSAGE) {
                finish(true)
            }
        }

        const timer = window.setTimeout(() => finish(false), timeoutMs)
        navigator.serviceWorker.addEventListener('message', onMessage)

        try {
            channel = new BroadcastChannel('wbk-push')
            channel.onmessage = (event) => {
                if (event.data && event.data.type === PUSH_RECEIVED_MESSAGE) {
                    finish(true)
                }
            }
        } catch (error) {
            channel = null
        }
    })
}

export const registerPushServiceWorker = async (
    serviceWorkerUrl: string
): Promise<ServiceWorkerRegistration> => {
    const targetPath = getScriptPath(serviceWorkerUrl)
    const registrations = await navigator.serviceWorker.getRegistrations()

    await Promise.all(
        registrations.map(async (registration) => {
            const scriptUrl = getRegistrationScriptUrl(registration)
            const scriptPath = getScriptPath(scriptUrl)
            if (!isWbkPushWorkerUrl(scriptUrl) || scriptPath === targetPath) {
                return
            }

            const existing = await registration.pushManager.getSubscription()
            if (existing) {
                await existing.unsubscribe()
            }
            await registration.unregister()
        })
    )

    const registration = await navigator.serviceWorker.register(serviceWorkerUrl)

    if (registration.installing) {
        await waitForWorkerActivation(registration.installing)
    } else if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        await waitForWorkerActivation(registration.waiting)
    }

    if (!registration.active) {
        throw new Error(
            __('Browser notifications could not be set up in this browser.', 'webba-booking-lite')
        )
    }

    return registration
}

const waitForWorkerActivation = (worker: ServiceWorker): Promise<void> => {
    if (worker.state === 'activated') {
        return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => {
            worker.removeEventListener('statechange', onStateChange)
            reject(
                new Error(
                    __(
                        'Browser notifications could not be set up in this browser.',
                        'webba-booking-lite'
                    )
                )
            )
        }, 10000)

        const onStateChange = () => {
            if (worker.state === 'activated') {
                window.clearTimeout(timeout)
                worker.removeEventListener('statechange', onStateChange)
                resolve()
                return
            }
            if (worker.state === 'redundant') {
                window.clearTimeout(timeout)
                worker.removeEventListener('statechange', onStateChange)
                reject(
                    new Error(
                        __(
                            'Browser notifications could not be set up in this browser.',
                            'webba-booking-lite'
                        )
                    )
                )
            }
        }

        worker.addEventListener('statechange', onStateChange)
    })
}
