import 'react-loading-skeleton/dist/skeleton.css'
import 'react-toastify/dist/ReactToastify.css'
import './BookingForm.scss'
import { ToastContainer } from 'react-toastify'
import { useEffect, useRef, useState, useMemo } from 'react'
import { bookingScenarios } from './scenarios'
import { Progressbar } from '../../components/Progressbar/Progressbar'
import classNames from 'classnames'
import { Sidebar } from '../../components/Sidebar/Sidebar'
import { useScenario } from '../../hooks/useScenario'
import { Navigation } from './Navigation/Navigation'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../store/frontend'
import { ThankYou } from './ThankYou/ThankYou'
import { PaymentHandler } from './PaymentHandler/PaymentHandler'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { useWording } from '../../hooks/useWording'
import { Loading } from '../../components/Loading/Loading'
import { BottomSummary } from '../../components/Sidebar/BottomSummary'
import { wbkFormatPrice } from '../../providers/BookingFormProvider/utils'
import { __ } from '@wordpress/i18n'
import { FormProvider } from '../../components/Form/FormProvider'
import { stripeMethods } from './PaymentHandler/payments/Stripe/StripeMethods'

export const BookingForm = () => {
    const {
        Screen,
        canGoNext,
        currentIndex,
        goBack,
        goNext,
        title,
        description,
        totalSteps,
        stepInto,
        nextStepError,
    } = useScenario(bookingScenarios)
    const { fields, setFields, formData, preset } = useBookingContext()
    const wording = useWording()
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Get loading state from store
    const loading = useSelect(
        (select: any) => select(store_name).getLoading(),
        []
    )

    const isNarrowForm = preset?.settings?.narrow_form === true
    const [sidebarOpen, setSidebarOpen] = useState(
        isNarrowForm ? false : window.innerWidth > 768
    )
    const bookingData = useSelect(
        (select: any) => select(store_name).getBookingData(),
        []
    )
    const stripeExecutedResult = useSelect(
        (select: any) => select(store_name).getStripeExecutedResult(),
        []
    )
    const [showThankYou, setShowThankYou] = useState(false)

    // Determine payment method
    const paymentMethod =
        bookingData?.payment_method || bookingData?.details?.payment_method

    // Payment methods that require a payment step
    const needsPaymentHandler =
        bookingData &&
        (paymentMethod === 'paypal' || paymentMethod === 'woocommerce')

    // Payment methods that go straight to ThankYou
    const isDirectThankYou =
        bookingData && bookingData.payment_required === false
    // Show Thank You if there is no payment method and payment is not required (or not set)
    const isNoPaymentMethodThankYou =
        bookingData &&
        (!paymentMethod || paymentMethod === '') &&
        (bookingData.payment_required === false ||
            bookingData.payment_required === undefined)
    const showThankYouFromStripeWallets =
        ['google_pay', 'apple_pay'].includes(paymentMethod) &&
        stripeExecutedResult &&
        stripeExecutedResult?.status === 'success'

    // Use the same context and logic as Sidebar for total calculation
    const { services, priceFormat, amountData } = useBookingContext()
    const items = useMemo(
        () => services.filter((s: any) => s.selected),
        [services]
    )
    const sortedItems = useMemo(
        () =>
            items
                .slice()
                .sort(
                    (a: any, b: any) =>
                        (a.selectedAt || 0) - (b.selectedAt || 0)
                ),
        [items]
    )

    // Fallback calculation for total (same as Sidebar)
    const localCalculatedTotal = useMemo(() => {
        let total = 0
        sortedItems.forEach((service: any) => {
            const matchedItems = Array.isArray(amountData.items)
                ? amountData.items.filter((item: any) => item.id === service.id)
                : []
            if (matchedItems.length > 0) {
                total += matchedItems.reduce(
                    (sum: number, item: any) => sum + (item.price || 0),
                    0
                )
            } else {
                const numericPrice = Number(service.price)
                if (numericPrice > 0 && service.quantity > 0) {
                    total += numericPrice * service.quantity
                }
            }
        })
        return total
    }, [amountData, sortedItems])

    // Fallback tax calculation logic (copied from Sidebar)
    const apiTax = Number(amountData.tax_to_pay)
    let displayTax = 0
    let useApiTax = false
    if (!isNaN(apiTax) && apiTax > 0) {
        displayTax = apiTax
        useApiTax = true
    } else {
        const presetTax = Number(preset?.settings?.tax)
        if (!isNaN(presetTax) && presetTax > 0) {
            // Calculate tax based on localCalculatedTotal
            displayTax = (localCalculatedTotal * presetTax) / 100
        }
    }

    // Use API total if available, otherwise fallback
    // Only add tax if using fallback tax, not if API tax is present (since API total is assumed to include tax)
    const apiTotal = Number(amountData.to_pay_total)
    const displayTotal =
        !isNaN(apiTotal) && apiTotal > 0
            ? apiTotal
            : localCalculatedTotal + displayTax

    let totalFormatted = ''
    if (sortedItems.length > 0) {
        totalFormatted =
            (displayTotal > 0 && wbkFormatPrice(displayTotal, priceFormat)) ||
            wording.free ||
            __('Free', 'webba-booking-lite')
    }

    useEffect(() => {
        if (isNarrowForm) {
            setSidebarOpen(false)
        } else {
            setSidebarOpen(
                !!(wrapperRef.current && wrapperRef.current.clientWidth > 585)
            )
        }
    }, [isNarrowForm, preset])

    const isStripePaymentRequired = useMemo(
        () =>
            bookingData?.payment_required === true &&
            paymentMethod &&
            stripeMethods.includes(paymentMethod) &&
            stripeExecutedResult?.status !== 'success',
        [
            bookingData?.payment_required,
            paymentMethod,
            stripeMethods,
            stripeExecutedResult,
        ]
    )
    // Show loading animation while preset is loading
    if (loading.preset) {
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

    return (
        <FormProvider fields={fields} setFields={setFields}>
            <ToastContainer limit={1} position="top-right" />
            <div
                className={classNames('wbk_booking_form__wrapper', {
                    ['wbk_booking_form__wrapper--expanded']: sidebarOpen,
                    ['wbk_booking_form__wrapper--narrow-form']: isNarrowForm,
                    ['wbk_booking_form__wrapper--compact-form']:
                        needsPaymentHandler || showThankYou || isDirectThankYou,
                })}
                ref={wrapperRef}
            >
                {((!bookingData || isStripePaymentRequired) && (
                    <div className={'wbk_booking_form__body__wrapper'}>
                        <div
                            className={classNames(
                                'wbk_booking_form__body__inner-wrapper',
                                {
                                    ['wbk_booking_form__body__inner-wrapper--bottom-view']:
                                        !sidebarOpen,
                                }
                            )}
                        >
                            <div className={'wbk_booking_form__left-panel'}>
                                <div className={'wbk_booking_form__content'}>
                                    <Progressbar
                                        currentStepNumber={currentIndex + 1}
                                        currentStepTitle={title}
                                        totalSteps={totalSteps}
                                        currentStepDescription={
                                            description as string
                                        }
                                    />
                                    <Screen />
                                </div>
                                <Navigation
                                    goBack={goBack}
                                    goNext={goNext}
                                    totalSteps={totalSteps}
                                    currentIndex={currentIndex}
                                    canGoNext={canGoNext}
                                    nextStepError={nextStepError}
                                />
                            </div>
                            <div className={'wbk_booking_form__right-panel'}>
                                <Sidebar
                                    toggle={sidebarOpen}
                                    onToggle={setSidebarOpen}
                                    title={wording?.summary || 'Summary'}
                                    onAddMore={() => {
                                        stepInto(0)
                                    }}
                                />
                            </div>
                        </div>
                        {!sidebarOpen && (
                            <BottomSummary
                                total={totalFormatted}
                                onShowSummary={() => setSidebarOpen(true)}
                            />
                        )}
                    </div>
                )) ||
                    (needsPaymentHandler && !showThankYou && (
                        <PaymentHandler
                            bookingData={bookingData}
                            onPaid={() => setShowThankYou(true)}
                        />
                    )) ||
                    ((isDirectThankYou ||
                        showThankYou ||
                        isNoPaymentMethodThankYou ||
                        showThankYouFromStripeWallets) && <ThankYou />)}
            </div>
        </FormProvider>
    )
}
