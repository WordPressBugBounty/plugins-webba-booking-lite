import { createRoot } from '@wordpress/element'
import '../store/backend/index.ts'
import { NavMenuBookingForm } from './NavMenuBookingForm/NavMenuBookingForm'
import { NavMenuBookingFormErrorBoundary } from './NavMenuBookingFormErrorBoundary/NavMenuBookingFormErrorBoundary'
import './nav-menu.scss'

const ACCORDION_CONTENT_ID = 'wbk_booking_form_nav-content'
const FILTERS_CONTAINER_ID = 'wbk_nav_menu_booking_filters'

const resetAccordionContentLayout = () => {
    const content = document.getElementById(ACCORDION_CONTENT_ID)
    if (!content) {
        return
    }

    content.style.height = ''
    content.style.overflow = 'visible'
}

const bindAccordionLayoutFix = (container) => {
    const section = container.closest('.accordion-section')
    const toggle = section?.querySelector('button.accordion-trigger')
    if (!toggle) {
        return
    }

    toggle.addEventListener('click', () => {
        window.setTimeout(resetAccordionContentLayout, 200)
    })
}

const mountNavMenuBookingForm = () => {
    const filtersContainer = document.getElementById(FILTERS_CONTAINER_ID)
    if (
        !filtersContainer ||
        filtersContainer.getAttribute('data-wbk-mounted') === '1'
    ) {
        return
    }

    filtersContainer.setAttribute('data-wbk-mounted', '1')
    bindAccordionLayoutFix(filtersContainer)

    try {
        createRoot(filtersContainer).render(
            <NavMenuBookingFormErrorBoundary>
                <NavMenuBookingForm />
            </NavMenuBookingFormErrorBoundary>
        )
        resetAccordionContentLayout()
    } catch (error) {
        filtersContainer.removeAttribute('data-wbk-mounted')
        console.error(error)
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountNavMenuBookingForm)
} else {
    mountNavMenuBookingForm()
}
