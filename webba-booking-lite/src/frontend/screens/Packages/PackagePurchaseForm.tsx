import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { ToastContainer } from 'react-toastify'
import { select, useDispatch, useSelect } from '@wordpress/data'
import apiFetch from '@wordpress/api-fetch'
import { __ } from '@wordpress/i18n'
import 'react-toastify/dist/ReactToastify.css'
import '../BookingForm/BookingForm.scss'
import { Progressbar } from '../../components/Progressbar/Progressbar'
import { Navigation } from '../BookingForm/Navigation/Navigation'
import { BottomSummary } from '../../components/Sidebar/BottomSummary'
import { Loading } from '../../components/Loading/Loading'
import LoginForm from '../../../components/LoginForm/LoginForm'
import { store_name } from '../../../store/frontend'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { useWording } from '../../hooks/useWording'
import {
    PackagePurchaseProvider,
    usePackagePurchase,
} from './PackagePurchaseContext'
import { usePackageScenario } from './usePackageScenario'
import { PackageSidebar } from './PackageSidebar'
import { PackageThankYou } from './PackageThankYou'
import { PackageLoginResponse } from './types'

const PackagePurchaseFormInner = () => {
    const {
        Screen,
        title,
        description,
        currentIndex,
        totalSteps,
        goBack,
        goNext,
        canGoNext,
        nextStepError,
    } = usePackageScenario()
    const {
        setProducts,
        setPaymentMethods,
        setPaymentMethod,
        selectedProduct,
        selectedProductId,
        purchaseResult,
        purchasing,
        setPurchaseResult,
        setPurchaseError,
    } = usePackagePurchase()
    const { preset } = useBookingContext()
    const wording = useWording()
    const { fetchPaymentMethods, setPreset } = useDispatch(store_name)

    const paymentMethodsFromStore = useSelect(
        (select: any) => select(store_name).getPaymentMethods(),
        []
    )
    const loading = useSelect(
        (select: any) => select(store_name).getLoading(),
        []
    )

    const presetReady = !!preset && Object.keys(preset).length > 0
    const isLoggedIn = !!preset?.user

    const applyLoggedInUser = (response: PackageLoginResponse) => {
        const nonceMiddleware = (
            apiFetch as { nonceMiddleware?: { nonce: string } }
        ).nonceMiddleware
        if (response?.token && nonceMiddleware) {
            nonceMiddleware.nonce = response.token
        }

        const currentPreset = select(store_name).getPreset() || {}
        const loggedInUser = response?.user || {}
        const email =
            loggedInUser.user_email || currentPreset.current_user_email || ''

        setPreset({
            ...currentPreset,
            user:
                loggedInUser.user_login ||
                loggedInUser.display_name ||
                'user',
            current_user_email: email,
            current_user_id:
                loggedInUser.ID || currentPreset.current_user_id || 0,
            is_logged_in: true,
            user_data: {
                ...(currentPreset.user_data || {}),
                email,
            },
        })
    }
    const isNarrowForm = preset?.settings?.narrow_form === true
    const [sidebarOpen, setSidebarOpen] = useState(
        isNarrowForm ? false : window.innerWidth > 768
    )
    const [bootstrapping, setBootstrapping] = useState(true)

    useEffect(() => {
        if (!presetReady || !isLoggedIn) {
            return
        }

        const params = new URLSearchParams(window.location.search)
        const paymentId = params.get('paymentId') || ''
        const paypalApproved = params.get('pp_aprove') === 'true'
        const paypalStatus = params.get('paypal_status') || ''
        const mollieStatus = params.get('mollie_status') || ''
        const stripeIntentId = params.get('payment_intent') || ''
        const stripeRedirectStatus = params.get('redirect_status') || ''

        if (paypalStatus === '5' || mollieStatus === 'canceled') {
            setPurchaseError(
                __('Payment was cancelled.', 'webba-booking-lite')
            )
            return
        }

        if (paypalStatus && paypalStatus !== '1') {
            setPurchaseError(
                __('Payment could not be completed.', 'webba-booking-lite')
            )
            return
        }

        if (stripeRedirectStatus && stripeRedirectStatus !== 'succeeded') {
            setPurchaseError(
                __('Payment could not be completed.', 'webba-booking-lite')
            )
            return
        }

        const lookupPaymentId =
            (paypalApproved && paymentId) ||
            (mollieStatus === 'paid' && paymentId) ||
            (stripeRedirectStatus === 'succeeded' && stripeIntentId) ||
            ''

        if (!lookupPaymentId) {
            return
        }

        let cancelled = false
        let attempts = 0
        const maxAttempts = 8

        const loadPaidPackage = async () => {
            try {
                const response: any = await apiFetch({
                    path: `/wbk/v2/package-payment-details/?payment_id=${encodeURIComponent(
                        lookupPaymentId
                    )}`,
                })
                if (cancelled) {
                    return
                }
                if (response?.success && response.package) {
                    setPaymentMethod(
                        response.package.payment_method ||
                            response.payment_method ||
                            'paypal'
                    )
                    setPurchaseResult(response.package)
                    setPurchaseError(null)
                    return
                }
                if (response?.pending && attempts < maxAttempts) {
                    attempts += 1
                    window.setTimeout(loadPaidPackage, 1000)
                    return
                }
                setPurchaseError(
                    response?.message ||
                        __(
                            'Payment could not be completed.',
                            'webba-booking-lite'
                        )
                )
            } catch (error: any) {
                if (cancelled) {
                    return
                }
                setPurchaseError(
                    error?.message ||
                        __(
                            'Payment could not be completed.',
                            'webba-booking-lite'
                        )
                )
            }
        }

        loadPaidPackage()
        return () => {
            cancelled = true
        }
    }, [
        presetReady,
        isLoggedIn,
        setPaymentMethod,
        setPurchaseResult,
        setPurchaseError,
    ])

    useEffect(() => {
        if (!presetReady || !isLoggedIn) {
            setBootstrapping(false)
            return
        }

        let cancelled = false
        const bootstrap = async () => {
            setBootstrapping(true)
            try {
                const prodRes: any = await apiFetch({
                    path: '/wbk/v2/get-package-products/',
                })
                if (!cancelled) {
                    setProducts(prodRes?.products || [])
                }
            } catch (e) {
                // Products errors are handled by empty states.
            } finally {
                if (!cancelled) {
                    setBootstrapping(false)
                }
            }
        }
        bootstrap()
        return () => {
            cancelled = true
        }
    }, [presetReady, isLoggedIn, setProducts])

    useEffect(() => {
        if (!selectedProductId) {
            setPaymentMethods([])
            setPaymentMethod('')
            return
        }

        let cancelled = false
        const loadMethods = async () => {
            setPaymentMethods([])
            setPaymentMethod('')
            await fetchPaymentMethods({
                scope: 'package',
                product_id: selectedProductId,
            })
            if (cancelled) {
                return
            }
        }
        loadMethods()
        return () => {
            cancelled = true
        }
    }, [
        selectedProductId,
        fetchPaymentMethods,
        setPaymentMethods,
        setPaymentMethod,
    ])

    useEffect(() => {
        const methods = paymentMethodsFromStore || []
        setPaymentMethods(methods)
        if (methods.length === 1) {
            setPaymentMethod(methods[0].id)
        }
    }, [paymentMethodsFromStore, setPaymentMethods, setPaymentMethod])

    if (!presetReady || bootstrapping || loading?.preset) {
        return (
            <div className="wbk_booking_form__loading-wrapper">
                <Loading size="large" />
            </div>
        )
    }

    if (!isLoggedIn) {
        return (
            <div
                className={classNames('wbk_booking_form__wrapper', {
                    'wbk_booking_form__wrapper--narrow-form': isNarrowForm,
                })}
            >
                <div className="wbk_booking_form__body__wrapper">
                    <div className="wbk_booking_form__body__inner-wrapper">
                        <div className="wbk_booking_form__left-panel">
                            <div className="wbk_booking_form__content">
                                <LoginForm onSuccess={applyLoggedInUser} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (purchaseResult) {
        return (
            <div
                className={classNames(
                    'wbk_booking_form__wrapper',
                    'wbk_booking_form__wrapper--packages',
                    'wbk_booking_form__wrapper--compact-form',
                    {
                        'wbk_booking_form__wrapper--narrow-form': isNarrowForm,
                    }
                )}
            >
                <PackageThankYou />
            </div>
        )
    }

    return (
        <>
            <ToastContainer limit={1} position="top-right" />
            <div
                className={classNames(
                    'wbk_booking_form__wrapper',
                    'wbk_booking_form__wrapper--packages',
                    {
                        'wbk_booking_form__wrapper--expanded': sidebarOpen,
                        'wbk_booking_form__wrapper--narrow-form': isNarrowForm,
                    }
                )}
            >
                <div className="wbk_booking_form__body__wrapper">
                    <div
                        className={classNames(
                            'wbk_booking_form__body__inner-wrapper',
                            {
                                'wbk_booking_form__body__inner-wrapper--bottom-view':
                                    !sidebarOpen,
                            }
                        )}
                    >
                        <div className="wbk_booking_form__left-panel">
                            <div className="wbk_booking_form__content">
                                <Progressbar
                                    currentStepNumber={currentIndex + 1}
                                    currentStepTitle={
                                        // Reuse classic service wording for package select.
                                        currentIndex === 0
                                            ? wording?.select_services ||
                                              __(
                                                  'Select a package',
                                                  'webba-booking-lite'
                                              )
                                            : title
                                    }
                                    totalSteps={totalSteps}
                                    currentStepDescription={
                                        currentIndex === 0
                                            ? wording?.choose_service_proceed ||
                                              __(
                                                  'Choose a package and continue',
                                                  'webba-booking-lite'
                                              )
                                            : (description as string)
                                    }
                                />
                                <Screen />
                            </div>
                            <Navigation
                                goBack={goBack}
                                goNext={goNext}
                                totalSteps={totalSteps}
                                currentIndex={currentIndex}
                                canGoNext={canGoNext && !purchasing}
                                nextStepError={nextStepError}
                            />
                        </div>
                        <div className="wbk_booking_form__right-panel">
                            <PackageSidebar
                                toggle={sidebarOpen}
                                onToggle={setSidebarOpen}
                            />
                        </div>
                    </div>
                    {!sidebarOpen && (
                        <BottomSummary
                            total={selectedProduct?.price_formatted || ''}
                            hideCost={!selectedProduct}
                            onShowSummary={() => setSidebarOpen(true)}
                        />
                    )}
                </div>
            </div>
        </>
    )
}

export const PackagePurchaseForm = () => (
    <PackagePurchaseProvider>
        <PackagePurchaseFormInner />
    </PackagePurchaseProvider>
)
