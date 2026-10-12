import type {
    ISquareObj,
    ISquareTokenizeResult,
} from '../screens/BookingForm/PaymentHandler/payments/Square/types'
import type { IFormData } from '../screens/BookingForm/types'

interface SquareTokenizationOptions {
    squareObj?: ISquareObj
    amount: number | string
    currency: string
    email?: string
    givenName?: string
}

export const tokenizeSquareCard = async ({
    squareObj,
    amount,
    currency,
    email,
    givenName,
}: SquareTokenizationOptions): Promise<ISquareTokenizeResult> => {
    if (!squareObj?.tokenize) {
        return {
            error: 'Square is not ready',
        }
    }

    return squareObj.tokenize({
        amount: Number(amount).toFixed(
            currency.toUpperCase() === 'JPY' ? 0 : 2
        ),
        currencyCode: currency,
        email,
        givenName,
    })
}

export const prepareSquareBookingPayload = async ({
    formData,
    squareObj,
    amount,
    currency,
}: SquareTokenizationOptions & {
    formData: IFormData
}): Promise<IFormData> => {
    const bookingPayload = { ...formData }

    if (bookingPayload.payment_method !== 'square' || Number(amount) <= 0) {
        return bookingPayload
    }

    const tokenResult = await tokenizeSquareCard({
        squareObj,
        amount,
        currency,
        email: bookingPayload.email as string,
        givenName: bookingPayload.name as string,
    })

    if (tokenResult.error || !tokenResult.token) {
        throw new Error(tokenResult.error || 'Card tokenization failed')
    }

    bookingPayload.square_source_id = tokenResult.token
    bookingPayload.square_verification_token =
        tokenResult.verificationToken || ''

    return bookingPayload
}

export const chargeSquarePayment = async ({
    squareObj,
    amount,
    currency,
    email,
    givenName,
    paymentId,
    submitSquarePayment,
}: SquareTokenizationOptions & {
    paymentId?: string
    submitSquarePayment: (
        payment_id: string,
        source_id: string,
        verification_token?: string
    ) => Promise<any>
}) => {
    if (!paymentId) {
        return {
            status: 'error',
            message: 'Square is not ready',
        }
    }

    const tokenResult = await tokenizeSquareCard({
        squareObj,
        amount,
        currency,
        email,
        givenName,
    })

    if (tokenResult.error || !tokenResult.token) {
        return {
            status: 'error',
            message: tokenResult.error || 'Card tokenization failed',
        }
    }

    return submitSquarePayment(
        paymentId,
        tokenResult.token,
        tokenResult.verificationToken
    )
}

/**
 * Shared Square create/retry path used by booking form scenarios and
 * process-booking (admin/customer) flows.
 */
export const runSquareCheckout = async ({
    formData,
    squareObj,
    amount,
    currency,
    bookingData,
    createBooking,
    submitSquarePayment,
    onPaymentDeclined,
}: SquareTokenizationOptions & {
    formData: IFormData
    bookingData?: {
        payment_required?: boolean
        payment_id?: string
        [key: string]: unknown
    } | null
    createBooking: (payload: IFormData) => Promise<any>
    submitSquarePayment: (
        payment_id: string,
        source_id: string,
        verification_token?: string
    ) => Promise<any>
    onPaymentDeclined?: (response: any) => void
}) => {
    const isSquarePayment =
        formData.payment_method === 'square' && Number(amount) > 0
    const isSquareRetry =
        isSquarePayment &&
        bookingData?.payment_required === true &&
        Boolean(bookingData?.payment_id)

    if (isSquareRetry) {
        const paymentResponse = await chargeSquarePayment({
            squareObj,
            amount,
            currency,
            email: formData.email as string,
            givenName: formData.name as string,
            paymentId: bookingData?.payment_id,
            submitSquarePayment,
        })

        if (paymentResponse?.status !== 'success') {
            throw new Error(paymentResponse?.message || 'Payment failed')
        }

        return {
            ...bookingData,
            payment_required: false,
        }
    }

    const bookingPayload = await prepareSquareBookingPayload({
        formData,
        squareObj,
        amount,
        currency,
    })

    const response = await createBooking(bookingPayload)

    if (isSquarePayment && response?.payment_required === true) {
        onPaymentDeclined?.(response)
        throw new Error(response?.message || 'Payment failed')
    }

    return response
}
