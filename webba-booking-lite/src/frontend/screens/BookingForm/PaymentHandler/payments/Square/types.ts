export type SquareEnvironment = 'sandbox' | 'production'

export interface ISquareTokenizeDetails {
    amount: string
    currencyCode: string
    email?: string
    givenName?: string
}

export interface ISquareTokenizeResult {
    token?: string
    verificationToken?: string
    error?: string
}

export interface ISquareObj {
    isValidated?: boolean
    tokenize?: (details: ISquareTokenizeDetails) => Promise<ISquareTokenizeResult>
    currency?: string
}

export interface ISquareCardProps {
    onLoadingChange?: (loading: boolean) => void
}

declare global {
    interface Window {
        Square?: {
            payments: (
                applicationId: string,
                locationId: string
            ) => {
                card: () => Promise<{
                    attach: (selector: string | HTMLElement) => Promise<void>
                    tokenize: () => Promise<{
                        status: string
                        token?: string
                        errors?: Array<{ message?: string }>
                    }>
                    destroy: () => Promise<void>
                }>
                verifyBuyer: (
                    token: string,
                    details: Record<string, unknown>
                ) => Promise<{ token?: string } | undefined>
            }
        }
    }
}
