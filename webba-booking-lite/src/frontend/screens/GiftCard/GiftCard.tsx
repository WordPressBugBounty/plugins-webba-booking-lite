import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelect } from '@wordpress/data'
import classNames from 'classnames'
import { FormProvider } from '../../components/Form/FormProvider'
import { IFieldConfig } from '../../components/Form/types'
import { Loading } from '../../components/Loading/Loading'
import { store_name } from '../../../store/frontend'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { wbkFormatPrice } from '../../providers/BookingFormProvider/utils'
import { IGiftCardStripeDetails } from './GiftCardPaymentSection'
import { IGiftCardResult } from './GiftCardThankYou'
import { GiftCardContent } from './GiftCardContent'
import { GiftCardPurchasePhase } from './types'
import {
    browserTimezone,
    buildGiftCardFields,
    currentIsoTime,
    getGiftCardPresetAmounts,
    todayIsoDate,
    validateGiftCardSendOn,
} from './utils'
import '../../assets/frontend.scss'
import '../../components/Form/Form.scss'
import '../../components/Fields/Fields.scss'
import '../BookingForm/BookingForm.scss'
import '../BookingForm/Navigation/Navigation.scss'
import './GiftCard.scss'

export const GiftCard = ({
    paymentId: attrPaymentId,
    payerId: attrPayerId,
    paypalStatus: attrPaypalStatus,
    mollieStatus: attrMollieStatus,
}: {
    paymentId?: string | null
    payerId?: string | null
    paypalStatus?: string | null
    mollieStatus?: string | null
} = {}) => {
    const { fetchPaymentMethods } = useDispatch(store_name)
    const { preset, priceFormat } = useBookingContext()
    const presetAmounts = useMemo(
        () => getGiftCardPresetAmounts(preset),
        [preset]
    )
    const [fields, setFields] = useState<IFieldConfig[]>(() =>
        buildGiftCardFields(
            presetAmounts.length > 0 ? String(presetAmounts[0]) : ''
        )
    )
    const [sendOn, setSendOn] = useState(todayIsoDate())
    const [sendTime, setSendTime] = useState(currentIsoTime)
    const [sendTimezone, setSendTimezone] = useState(browserTimezone)
    const [sendOnError, setSendOnError] = useState<string | null>(null)
    const [sendOnTouched, setSendOnTouched] = useState(false)
    const [selectedMethod, setSelectedMethod] = useState('')
    const [methodsFetched, setMethodsFetched] = useState(false)
    const [stripeDetails, setStripeDetails] =
        useState<IGiftCardStripeDetails | null>(null)
    const [purchasePhase, setPurchasePhase] = useState<GiftCardPurchasePhase>(
        () => {
            if (
                attrPaypalStatus === '5' ||
                attrMollieStatus === 'canceled'
            ) {
                return 'cancelled'
            }
            if (attrPaymentId && attrPayerId) {
                return 'paypal_return'
            }
            if (
                attrPaymentId &&
                (attrMollieStatus === 'paid' || attrMollieStatus === 'return')
            ) {
                return 'paypal_return'
            }
            return 'form'
        }
    )
    const [purchaseResult, setPurchaseResult] =
        useState<IGiftCardResult | null>(null)
    const [paymentUrl, setPaymentUrl] = useState('')
    const [purchaseError, setPurchaseError] = useState<string | null>(null)
    const [purchasing, setPurchasing] = useState(false)

    const loadingPreset = useSelect(
        (select: any) => select(store_name).getLoading().preset,
        []
    )
    const paymentMethods =
        useSelect(
            (select: any) => select(store_name).getPaymentMethods(),
            []
        ) ?? []

    useEffect(() => {
        if (presetAmounts.length === 0) {
            return
        }
        setFields((prev) =>
            prev.map((field) => {
                if (field.slug !== 'amount') {
                    return field
                }
                if (String(field.value ?? '') !== '') {
                    return field
                }
                return { ...field, value: String(presetAmounts[0]) }
            })
        )
    }, [presetAmounts])

    useEffect(() => {
        if (methodsFetched) {
            return
        }
        fetchPaymentMethods({ scope: 'gift_card' })
        setMethodsFetched(true)
    }, [fetchPaymentMethods, methodsFetched])

    useEffect(() => {
        if (paymentMethods.length > 0 && !selectedMethod) {
            setSelectedMethod(paymentMethods[0].id)
        }
    }, [paymentMethods, selectedMethod])

    const amountValue = useMemo(() => {
        const amountField = fields.find((field) => field.slug === 'amount')
        return Number(String(amountField?.value ?? '').replace(',', '.')) || 0
    }, [fields])

    const buyerEmail = useMemo(() => {
        const emailField = fields.find((field) => field.slug === 'buyer_email')
        return String(emailField?.value ?? '')
    }, [fields])

    const formattedAmount =
        amountValue > 0 ? wbkFormatPrice(amountValue, priceFormat) : null

    const validateSendOn = useCallback(
        (date: string, time: string, timezone: string) =>
            validateGiftCardSendOn(date, time, timezone),
        []
    )

    if (loadingPreset) {
        return (
            <div
                className={classNames(
                    'wbk_booking_form__wrapper',
                    'wbk_booking_form__wrapper__loading-wrapper'
                )}
            >
                <Loading size="large" />
            </div>
        )
    }

    const isNarrowForm = preset?.settings?.narrow_form === true

    return (
        <FormProvider fields={fields} setFields={setFields}>
            <GiftCardContent
                fields={fields}
                sendOn={sendOn}
                setSendOn={setSendOn}
                sendTime={sendTime}
                setSendTime={setSendTime}
                sendTimezone={sendTimezone}
                setSendTimezone={setSendTimezone}
                sendOnError={sendOnError}
                setSendOnError={setSendOnError}
                sendOnTouched={sendOnTouched}
                setSendOnTouched={setSendOnTouched}
                selectedMethod={selectedMethod}
                setSelectedMethod={setSelectedMethod}
                paymentMethods={paymentMethods}
                formattedAmount={formattedAmount}
                amountValue={amountValue}
                buyerEmail={buyerEmail}
                isNarrowForm={isNarrowForm}
                validateSendOn={validateSendOn}
                stripeDetails={stripeDetails}
                setStripeDetails={setStripeDetails}
                purchasePhase={purchasePhase}
                setPurchasePhase={setPurchasePhase}
                purchaseResult={purchaseResult}
                setPurchaseResult={setPurchaseResult}
                paymentUrl={paymentUrl}
                setPaymentUrl={setPaymentUrl}
                purchaseError={purchaseError}
                setPurchaseError={setPurchaseError}
                purchasing={purchasing}
                setPurchasing={setPurchasing}
                paypalReturnPaymentId={attrPaymentId || null}
            />
        </FormProvider>
    )
}
