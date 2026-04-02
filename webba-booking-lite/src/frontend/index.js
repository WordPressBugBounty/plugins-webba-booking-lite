import { createRoot } from 'react-dom/client'
import { UserDashboard } from './screens/UserDashboard/UserDashboard'
import { BookingForm } from './screens/BookingForm/BookingForm'
import { extractDataAttrs } from './lib/utils'
import { BookingFormProvider } from './providers/BookingFormProvider/BookingFormProvider'
import { LandingPage } from './screens/BookingForm/LandingPages/LandingPage'
import { CustomerPayment } from './screens/BookingForm/LandingPages/CustomerPayment/CustomerPayment'
import { PaymentSuccess } from './screens/BookingForm/LandingPages/PaymentSuccess/PaymentSuccess'
import { PaymentCancelled } from './screens/BookingForm/LandingPages/PaymentCancelled/PaymentCancelled'

const dashboardContainer = document.getElementById('wbk_user_dashboard')
const bookingFormContainers = document.getElementsByClassName(
    'webba_booking_form_v6'
)

if (dashboardContainer) {
    createRoot(dashboardContainer).render(<UserDashboard />)
}

if (bookingFormContainers.length > 0) {
    for (let i = 0; i < bookingFormContainers.length; i++) {
        const bookingFormContainer = bookingFormContainers[i]
        const {
            service,
            category,
            location,
            staff,
            payerid,
            paymentid,
            admin_approve,
            admin_cancel,
            cancelation,
            order_payment,
            paypal_status,
            payment_intent,
            redirect_status,
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
                createRoot(bookingFormContainer).render(
                    <BookingFormProvider attrService={null} attrCategory={null} attrLocation={null}>
                        <CustomerPayment
                            token={token}
                            token_type={token_type}
                        />
                    </BookingFormProvider>
                )
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
                >
                    <BookingForm />
                </BookingFormProvider>,
                bookingFormContainer
            )
        }, i * 1000)
    }
}
