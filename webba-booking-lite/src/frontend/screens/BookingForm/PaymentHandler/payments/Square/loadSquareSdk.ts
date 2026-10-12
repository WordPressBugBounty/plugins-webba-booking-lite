import { SquareEnvironment } from './types'

let squareScriptPromise: Promise<typeof window.Square> | null = null
let loadedEnvironment: SquareEnvironment | null = null

export const loadSquareSdk = (
    environment: SquareEnvironment = 'production'
): Promise<typeof window.Square> => {
    if (window.Square && loadedEnvironment === environment) {
        return Promise.resolve(window.Square)
    }

    if (squareScriptPromise && loadedEnvironment === environment) {
        return squareScriptPromise
    }

    loadedEnvironment = environment
    squareScriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-wbk-square-sdk]')
        if (existing) {
            existing.addEventListener('load', () => resolve(window.Square))
            existing.addEventListener('error', () =>
                reject(new Error('Failed to load Square SDK'))
            )
            return
        }

        const script = document.createElement('script')
        script.src =
            environment === 'sandbox'
                ? 'https://sandbox.web.squarecdn.com/v1/square.js'
                : 'https://web.squarecdn.com/v1/square.js'
        script.async = true
        script.dataset.wbkSquareSdk = 'true'
        script.onload = () => resolve(window.Square)
        script.onerror = () => reject(new Error('Failed to load Square SDK'))
        document.head.appendChild(script)
    })

    return squareScriptPromise
}
