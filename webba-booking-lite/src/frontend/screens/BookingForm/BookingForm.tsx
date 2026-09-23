import 'react-loading-skeleton/dist/skeleton.css'
import 'react-toastify/dist/ReactToastify.css'
import './BookingForm.scss'
import { ToastContainer } from 'react-toastify'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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
import { FormProvider } from '../../components/Form/FormProvider'
import { stripeMethods } from './PaymentHandler/payments/Stripe/StripeMethods'
import { WaterfallForm } from './WaterfallForm/WaterfallForm'
import { useBookingSummaryTotal } from '../../hooks/useBookingSummaryTotal'

const FORM_TYPE_WATERFALL = 'waterfall'
const HOSTED_CHECKOUT_METHODS = ['paypal', 'woocommerce', 'mollie']

const isHostedCheckoutMethod = (method?: string | null) =>
    !!method && HOSTED_CHECKOUT_METHODS.includes(method)

type BookingFormProps = {
    formType?: string
}

export const BookingForm = ({ formType: formTypeProp }: BookingFormProps) => {
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
    const { fields, setFields, preset, setPopupPortalElement } =
        useBookingContext()
    const formType =
        formTypeProp || preset?.appearance_options?.form_type || 'classic'
    const handlePopupPortalRef = useCallback(
        (node: HTMLDivElement | null) => {
            setPopupPortalElement(node)
        },
        [setPopupPortalElement]
    )
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

    const hasCompletedBooking = Boolean(
        bookingData &&
            (bookingData.success === true ||
                (Array.isArray(bookingData.booking_ids) &&
                    bookingData.booking_ids.length > 0) ||
                bookingData.payment_required === false ||
                (Array.isArray(bookingData.payment_details?.items) &&
                    bookingData.payment_details.items.length > 0))
    )

    // Hosted checkout methods that require PaymentHandler after booking
    const needsPaymentHandler =
    hasCompletedBooking && isHostedCheckoutMethod(paymentMethod)

    // Payment methods that go straight to ThankYou
    const isDirectThankYou =
        hasCompletedBooking && bookingData.payment_required === false
    // Show Thank You if there is no payment method and payment is not required (or not set)
    const isNoPaymentMethodThankYou =
        hasCompletedBooking &&
        (!paymentMethod || paymentMethod === '') &&
        (bookingData.payment_required === false ||
            bookingData.payment_required === undefined)
    const showThankYouFromStripeWallets =
        ['google_pay', 'apple_pay'].includes(paymentMethod) &&
        stripeExecutedResult &&
        stripeExecutedResult?.status === 'success'

    const showThankYouScreen =
        showThankYou ||
        isDirectThankYou ||
        isNoPaymentMethodThankYou ||
        showThankYouFromStripeWallets ||
        (hasCompletedBooking &&
            !needsPaymentHandler &&
            bookingData?.payment_required !== true)

    const { totalFormatted, hideAllPrices } = useBookingSummaryTotal()

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

    if (formType === FORM_TYPE_WATERFALL) {
        const handleWaterfallBookingComplete = (response?: any) => {
            const method =
                response?.payment_method || response?.details?.payment_method
            if (
                isHostedCheckoutMethod(method) &&
                response?.payment_required === true
            ) {
                return
            }
            setShowThankYou(true)
        }

        let waterfallContent: ReactNode = (
            <WaterfallForm onBookingComplete={handleWaterfallBookingComplete} />
        )

        if (needsPaymentHandler && !showThankYou) {
            waterfallContent = (
                <PaymentHandler
                    bookingData={bookingData}
                    onPaid={() => setShowThankYou(true)}
                />
            )
        } else if (showThankYouScreen && !isStripePaymentRequired) {
            waterfallContent = <ThankYou />
        } else if (isStripePaymentRequired) {
            waterfallContent = (
                <WaterfallForm
                    onBookingComplete={handleWaterfallBookingComplete}
                />
            )
        }

        return (
            <>
                <ToastContainer limit={1} position="top-right" />
                <div
                    className={classNames(
                        'wbk_booking_form__wrapper',
                        'wbk_booking_form__wrapper--waterfall',
                        {
                            ['wbk_booking_form__wrapper--compact-form']:
                                needsPaymentHandler || showThankYouScreen,
                        }
                    )}
                    ref={wrapperRef}
                >
                    {waterfallContent}
                    <div
                        ref={handlePopupPortalRef}
                        className="wbk_booking_form__popup-portal"
                    />
                </div>
            </>
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
                        needsPaymentHandler || showThankYouScreen,
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
                                hideCost={hideAllPrices}
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
                    (showThankYouScreen && <ThankYou />)}
                <div
                    ref={handlePopupPortalRef}
                    className="wbk_booking_form__popup-portal"
                />
            </div>
        </FormProvider>
    )
}
