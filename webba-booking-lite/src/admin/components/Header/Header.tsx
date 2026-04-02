import { Page, Route } from '../Router/types'
import { useRoute } from '../Router/useRoute'
import './Header.scss'
import { usePage } from '../Router/usePage'
import { __ } from '@wordpress/i18n'
import { useMemo } from 'react'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import webbaLogo from '../../../../public/images/webba_booking_logo_hq.png'
import { useOpenSettingsSection } from '../Settings/utils/utils'
import { useSidebar } from '../Sidebar/SidebarContext'
import { ShortcodeBuilder } from '../ShortcodeBuilder/ShortcodeBuilder'
import { ReactComponent as GeneratorIcon } from '../../../../public/images/icon-plus-green.svg'

interface TabConfig {
    route: Route
    label: string
    url?: string
}

const ROUTE_TO_SETTINGS_SECTION: Partial<Record<Route, string>> = {
    'email-templates': 'wbk_notifications_settings_section',
    calendar: 'wbk_integrations_settings_section',
    bookings: 'wbk_advanced_booking_rules_section',
}

export const Header = () => {
    const { page } = usePage()
    const { setRoute, route } = useRoute()
    const openSettingsSection = useOpenSettingsSection()
    const sidebar = useSidebar()
    const { admin_url } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )

    const dataAssetsTabs: TabConfig[] = useMemo(
        () => [
            {
                route: 'dashboard',
                label: __('Dashboard', 'webba-booking-lite'),
            },
            {
                route: 'bookings',
                label: __('Bookings', 'webba-booking-lite'),
            },
            {
                route: 'cancelled-bookings',
                label: __('Cancelled Bookings (legacy)', 'webba-booking-lite'),
            },
            {
                route: 'services',
                label: __('Services', 'webba-booking-lite'),
            },
            {
                route: 'calendar',
                slug: 'wbk-calendar',
                label: __('Calendar', 'webba-booking-lite'),
            },
            {
                route: 'settings',
                slug: 'wbk-settings',
                url: admin_url + 'admin.php?page=wbk-options',
                label: __('Settings', 'webba-booking-lite'),
            },
            {
                route: 'coupons',
                slug: 'wbk-coupons',
                label: __('Coupons', 'webba-booking-lite'),
            },
            {
                route: 'pricing-rules',
                slug: 'wbk-pricing-rules',
                label: __('Pricing rules', 'webba-booking-lite'),
            },
            {
                route: 'email-templates',
                slug: 'wbk-email-templates',
                label: __('Email notifications', 'webba-booking-lite'),
            },
            {
                route: 'connected-calendars',
                slug: 'wbk-gg-calendars',
                label: __('Google calendars', 'webba-booking-lite'),
            },
            {
                route: 'form-builder',
                slug: 'wbk-form-builder',
                label: __('Form builder', 'webba-booking-lite'),
            },
            {
                route: 'appearance',
                slug: 'wbk-appearance',
                label: __('Appearance', 'webba-booking-lite'),
            },
        ],
        [admin_url]
    )

    // const pageToTabMap: Record<Page, TabConfig[]> = useMemo(() => {
    //     return {
    //         'wbk-services': dataAssetsTabs,
    //         'wbk-pricing-rules': dataAssetsTabs,
    //         'wbk-email-templates': dataAssetsTabs,
    //         'wbk-coupons': dataAssetsTabs,
    //         'wbk-gg-calendars': dataAssetsTabs,
    //         'wbk-service-categories': dataAssetsTabs,
    //         'wbk-calendar': dataAssetsTabs,
    //         'wbk-appointments': dataAssetsTabs,
    //         'wbk-dashboard': dataAssetsTabs,
    //         'wbk-settings': dataAssetsTabs,
    //     }
    // }, [dataAssetsTabs])

    const pageTitle = useMemo(
        () => dataAssetsTabs.find((tab) => tab.route === route)?.label,
        [page, dataAssetsTabs]
    )

    return (
        <header className="wbk_header">
            <div className="wbk_header__logoLinkContainer">
                <a
                    className="wbk_header__logoLink"
                    href="https://webba-booking.com/"
                    target="_blank"
                    rel="noopener"
                >
                    <img className="wbk_header__logoImg" src={webbaLogo} />
                </a>
            </div>
            <div className="wbk_header__verticalLine" />
            <p className="wbk_header__title">{pageTitle}</p>
            <div className="wbk_header__tabItemsContainer"></div>
            <div className="wbk_header__quickLinksContainer">
                <button
                    type="button"
                    className="wbk_header__iconButton"
                    title={__('Open shortcode builder', 'webba-booking-lite')}
                    aria-label={__('Open shortcode builder', 'webba-booking-lite')}
                    onClick={() =>
                        sidebar.open(<ShortcodeBuilder />, {
                            view: 'modal',
                            width: 'small',
                            height: 'auto',
                            position: 'center',
                        })
                    }
                >
                    <GeneratorIcon />
                    <span className="wbk_header__iconButtonLabel">
                        {__('Generate Booking Form', 'webba-booking-lite')}
                    </span>
                </button>
                <span
                    className="wbk_header__quickLinksSeparator"
                    aria-hidden="true"
                />
                <a
                    href={
                        admin_url +
                        'admin.php?page=wbk-options&wbk-activation=true'
                    }
                    rel="noopener"
                >
                    {__('Setup Wizard', 'webba-booking-lite')}
                </a>
                {ROUTE_TO_SETTINGS_SECTION[route] ? (
                    <button
                        type="button"
                        className="wbk_header__settingsLink"
                        onClick={() =>
                            openSettingsSection(
                                ROUTE_TO_SETTINGS_SECTION[route]!
                            )
                        }
                    >
                        {__('Settings', 'webba-booking-lite')}
                    </button>
                ) : (
                    <a
                        href={admin_url + 'admin.php?page=wbk-options'}
                        rel="noopener"
                    >
                        {__('Settings', 'webba-booking-lite')}
                    </a>
                )}
            </div>
        </header>
    )
}
