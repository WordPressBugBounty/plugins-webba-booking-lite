import { Header } from './components/Header/Header'
import { Router, RouterConfig } from './components/Router/Router'
import { Sidebar } from './components/Sidebar/Sidebar'
import { SidebarProvider } from './components/Sidebar/SidebarContext'
import { ServicesScreen } from './screens/Services/ServicesScreen'
import { CouponsScreen } from './screens/Coupons/CouponsScreen'
import { GGCalendarsScreen } from './screens/GGCalendars/GGCalendars'
import { EmailTemplateScreen } from './screens/EmailTemplates/EmailTemplates'
import { PricingRulesScreen } from './screens/PricingRules/PricingRules'
import { Page } from './components/Router/types'
import { usePage } from './components/Router/usePage'
import { BookingsScreen } from './screens/Bookings/BookingsScreen'
import { CalendarScreen } from './screens/Calendar/CalendarScreen'
import { Dashboard } from './screens/Dashboard/Dashboard'
import { SettingsProvider } from './providers/SettingsProvider'
import { useSelect } from '@wordpress/data'
import { store_name } from '../store/backend'
import { CanecelledBookingsScreen } from './screens/Bookings/CanecelledBookingsScreen'

const tabToScreenMap: RouterConfig = {
    services: <ServicesScreen />,
    'service-categories': <ServicesScreen />,
    'pricing-rules': <PricingRulesScreen />,
    'email-templates': <EmailTemplateScreen />,
    coupons: <CouponsScreen />,
    bookings: <BookingsScreen />,
    'cancelled-bookings': <CanecelledBookingsScreen />,
    calendar: <CalendarScreen />,
    dashboard: <Dashboard />,
    calendars: <GGCalendarsScreen />,
    settings: 'settings',
}

const pageToRoutesMap: Record<Page, RouterConfig> = {
    'wbk-services': {
        services: <ServicesScreen />,
        ...tabToScreenMap,
    },
    'wbk-pricing-rules': {
        'pricing-rules': <PricingRulesScreen />,
        ...tabToScreenMap,
    },
    'wbk-email-templates': {
        'email-templates': <EmailTemplateScreen />,
        ...tabToScreenMap,
    },
    'wbk-coupons': {
        coupons: <CouponsScreen />,
        ...tabToScreenMap,
    },
    'wbk-gg-calendars': {
        calendars: <GGCalendarsScreen />,
        ...tabToScreenMap,
    },
    'wbk-service-categories': {
        services: <ServicesScreen />,
        ...tabToScreenMap,
    },
    'wbk-appointments': {
        bookings: <BookingsScreen />,
        ...tabToScreenMap,
    },
    'wbk-canecelled-appointments': {
        'cancelled-bookings': <CanecelledBookingsScreen />,
        ...tabToScreenMap,
    },
    'wbk-calendar': {
        calendar: <CalendarScreen />,
        ...tabToScreenMap,
    },
    'wbk-dashboard': {
        dashboard: <Dashboard />,
        ...tabToScreenMap,
    },
    'wbk-settings': {
        settings: 'settings',
        ...tabToScreenMap,
    },
}

export const App = () => {
    const { page } = usePage()
    const { settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )

    return (
        <SidebarProvider>
            <SettingsProvider settings={settings}>
                <Header />
                <Router config={pageToRoutesMap[page]} />
                <Sidebar />
            </SettingsProvider>
        </SidebarProvider>
    )
}
