import { createRoot } from 'react-dom/client'
import { UserDashboard } from './screens/UserDashboard/UserDashboard'
import { BookingForm } from './screens/BookingForm/BookingForm'
import { extractDataAttrs } from './lib/utils'
import { BookingFormProvider } from './providers/BookingFormProvider/BookingFormProvider'
import { LandingPage } from './screens/BookingForm/LandingPages/LandingPage'
import { PaymentSuccess } from './screens/BookingForm/LandingPages/PaymentSuccess/PaymentSuccess'
import { PaymentCancelled } from './screens/BookingForm/LandingPages/PaymentCancelled/PaymentCancelled'

const mountedAttribute = 'data-wbk-react-mounted'

const isMounted = (element) => element.getAttribute(mountedAttribute) === '1'

const markAsMounted = (element) => {
    element.setAttribute(mountedAttribute, '1')
}

const mountDashboard = (root = document) => {
    const dashboardContainer = root.querySelector('#wbk_user_dashboard')
    if (!dashboardContainer || isMounted(dashboardContainer)) {
        return
    }

    markAsMounted(dashboardContainer)
    createRoot(dashboardContainer).render(<UserDashboard />)
}

const mountBookingForms = (root = document) => {
    const bookingFormContainers = root.querySelectorAll('.webba_booking_form_v6')

    if (bookingFormContainers.length === 0) {
        return
    }

    for (let i = 0; i < bookingFormContainers.length; i++) {
        const bookingFormContainer = bookingFormContainers[i]
        if (isMounted(bookingFormContainer)) {
            continue
        }

        markAsMounted(bookingFormContainer)

        const {
            service,
            category,
            location,
            staff,
            units,
            payerid,
            paymentid,
            admin_approve,
            admin_cancel,
            cancelation,
            order_payment,
            paypal_status,
            payment_intent,
            redirect_status,
            hide_category,
        } = extractDataAttrs(bookingFormContainer)

        // If payerid and paymentid are defined, show PaypalSuccess screen
        if (
            (payerid && paymentid) ||
            (payment_intent && redirect_status === 'succeeded')
        ) {
            createRoot(bookingFormContainer).render(
                <BookingFormProvider attrService={null} attrCategory={null} attrLocation={null}>
                    <PaymentSuccess paymentId={paymentid || payment_intent} />
                </BookingFormProvider>
            )
            continue
        }

        if (
            (paypal_status && paypal_status === '5') ||
            redirect_status === 'failed'
        ) {
            createRoot(bookingFormContainer).render(
                <BookingFormProvider attrService={null} attrCategory={null} attrLocation={null}>
                    <PaymentCancelled />
                </BookingFormProvider>
            )
            continue
        }

        // If any special attribute is present, render a landing page placeholder
        let token = null
        let token_type = null
        let action = null

        if (cancelation) {
            token = cancelation
            token_type = 'customer_token'
            action = 'cancelation'
        } else if (order_payment) {
            token = order_payment
            token_type = 'customer_token'
            action = 'order_payment'
        } else if (admin_approve) {
            token = admin_approve
            token_type = 'admin_token'
            action = 'admin_approve'
        } else if (admin_cancel) {
            token = admin_cancel
            token_type = 'admin_token'
            action = 'admin_cancel'
        }

        if (token && token_type && action) {
            if (action === 'order_payment') {
                import(
                    /* webpackMode: "eager" */ './screens/BookingForm/LandingPages/CustomerPayment/CustomerPayment'
                ).then(({ CustomerPayment }) => {
                    createRoot(bookingFormContainer).render(
                        <BookingFormProvider
                            attrService={null}
                            attrCategory={null}
                            attrLocation={null}
                        >
                            <CustomerPayment
                                token={token}
                                token_type={token_type}
                            />
                        </BookingFormProvider>
                    )
                })
                continue
            }
            createRoot(bookingFormContainer).render(
                <BookingFormProvider attrService={null} attrCategory={null} attrLocation={null}>
                    <LandingPage
                        token={token}
                        token_type={token_type}
                        action={action}
                    />
                </BookingFormProvider>
            )
            continue
        }

        setTimeout(() => {
            createRoot(bookingFormContainer).render(
                <BookingFormProvider
                    attrService={service || null}
                    attrCategory={category || null}
                    attrLocation={location || null}
                    attrStaff={staff || null}
                    attrUnits={units || null}
                    attrHideCategory={hide_category || null}
                >
                    <BookingForm />
                </BookingFormProvider>,
                bookingFormContainer
            )
        }, i * 1000)
    }
}

const mountWebbaBookingApps = (root = document) => {
    mountDashboard(root)
    mountBookingForms(root)
}

const startDynamicMountObserver = () => {
    if (
        typeof window === 'undefined' ||
        typeof MutationObserver === 'undefined' ||
        !document.body
    ) {
        return
    }

    let shouldRun = false
    const observer = new MutationObserver((mutationsList) => {
        for (let i = 0; i < mutationsList.length; i++) {
            const mutation = mutationsList[i]
            if (!mutation.addedNodes || mutation.addedNodes.length === 0) {
                continue
            }

            for (let j = 0; j < mutation.addedNodes.length; j++) {
                const addedNode = mutation.addedNodes[j]
                if (
                    addedNode.nodeType === 1 &&
                    (addedNode.matches?.('.webba_booking_form_v6, #wbk_user_dashboard') ||
                        addedNode.querySelector?.('.webba_booking_form_v6, #wbk_user_dashboard'))
                ) {
                    shouldRun = true
                    break
                }
            }

            if (shouldRun) {
                break
            }
        }

        if (!shouldRun) {
            return
        }

        shouldRun = false
        window.requestAnimationFrame(() => {
            mountWebbaBookingApps(document)
        })
    })

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    })
}

let elementorHooksRegistered = false

const registerElementorHooks = () => {
    if (
        typeof window === 'undefined' ||
        typeof window.elementorFrontend === 'undefined' ||
        !window.elementorFrontend.hooks ||
        elementorHooksRegistered
    ) {
        return
    }

    elementorHooksRegistered = true

    window.elementorFrontend.hooks.addAction(
        'frontend/element_ready/wbk_booking_form.default',
        ($scope) => {
            const targetRoot =
                $scope && $scope[0] ? $scope[0] : document
            mountWebbaBookingApps(targetRoot)
        }
    )

    window.elementorFrontend.hooks.addAction(
        'frontend/element_ready/global',
        ($scope) => {
            const targetRoot =
                $scope && $scope[0] ? $scope[0] : document
            mountWebbaBookingApps(targetRoot)
        }
    )
}

mountWebbaBookingApps(document)
startDynamicMountObserver()

window.addEventListener('wbk:mount-react-app', () => mountWebbaBookingApps(document))

registerElementorHooks()

if (typeof window !== 'undefined' && typeof window.jQuery !== 'undefined') {
    window.jQuery(window).on('elementor/frontend/init', registerElementorHooks)
    window
        .jQuery(document)
        .on('et_builder_api_ready et_fb_form_submit_success', () => {
            mountWebbaBookingApps(document)
        })
}
