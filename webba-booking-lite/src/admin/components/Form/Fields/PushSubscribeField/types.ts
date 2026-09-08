export interface PushStatusMessage {
    type: 'success' | 'error'
    message: string
}

export interface PushConfigResponse {
    enabled: boolean
    available: boolean
    publicKey: string
    serviceWorkerUrl: string
    keyError?: string
}

export interface PushApiResponse {
    status: 'success' | 'error'
    message?: string
}

export interface PushSubscriptionPayload {
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}
