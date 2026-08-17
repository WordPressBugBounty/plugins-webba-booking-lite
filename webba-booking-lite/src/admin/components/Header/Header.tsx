import { Route } from '../Router/types'
import { useRoute } from '../Router/useRoute'
import './Header.scss'
import { __ } from '@wordpress/i18n'
import { useMemo, useCallback, useState } from 'react'
import { useDispatch, useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import webbaLogo from '../../../../public/images/webba_booking_logo_hq.png'
import { useOpenSettingsSection } from '../Settings/utils/utils'
import { useSidebar } from '../Sidebar/SidebarContext'
import { ShortcodeBuilder } from '../ShortcodeBuilder/ShortcodeBuilder'
import { ReactComponent as GeneratorIcon } from '../../../../public/images/icon-plus-green.svg'
import { useTheme } from '../../providers/ThemeProvider/ThemeProvider'

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

const DOCUMENTATION_URL = 'https://webba-booking.com/documentation'

const MoonIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path
            d="M21 14.3A9 9 0 0 1 9.7 3 7 7 0 1 0 21 14.3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const SunIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <circle
            cx="12"
            cy="12"
            r="4"
            stroke="currentColor"
            strokeWidth="1.8"
        />
        <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
    </svg>
)

const SettingsIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852 1.01 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export const Header = () => {
    const { route } = useRoute()
    const openSettingsSection = useOpenSettingsSection()
    const sidebar = useSidebar()
    const { isDarkMode, toggleTheme } = useTheme()
    const { admin_url } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const { relaunchOnboarding } = useDispatch(store_name) as {
        relaunchOnboarding: () => Promise<void>
    }
    const [isRelaunchingOnboarding, setIsRelaunchingOnboarding] = useState(false)

    const handleQuickSetupGuide = useCallback(async () => {
        if (isRelaunchingOnboarding) {
            return
        }

        setIsRelaunchingOnboarding(true)
        try {
            await relaunchOnboarding()
        } finally {
            setIsRelaunchingOnboarding(false)
        }
    }, [isRelaunchingOnboarding, relaunchOnboarding])

    const settingsLabel = __('Settings', 'webba-booking-lite')
    const supportUrl = admin_url
        ? `${admin_url}admin.php?page=wbk-main-contact`
        : undefined
    const settingsUrl = admin_url
        ? `${admin_url}admin.php?page=wbk-options`
        : undefined

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
                label: __('Calendar', 'webba-booking-lite'),
            },
            {
                route: 'settings',
                url: admin_url + 'admin.php?page=wbk-options',
                label: __('Settings', 'webba-booking-lite'),
            },
            {
                route: 'coupons',
                label: __('Coupons', 'webba-booking-lite'),
            },
            {
                route: 'pricing-rules',
                label: __('Pricing rules', 'webba-booking-lite'),
            },
            {
                route: 'email-templates',
                label: __('Email notifications', 'webba-booking-lite'),
            },
            {
                route: 'connected-calendars',
                label: __('Google calendars', 'webba-booking-lite'),
            },
            {
                route: 'form-builder',
                label: __('Form builder', 'webba-booking-lite'),
            },
            {
                route: 'appearance',
                label: __('Appearance', 'webba-booking-lite'),
            },
        ],
        [admin_url]
    )

    const pageTitle = useMemo(() => {
        return dataAssetsTabs.find((tab) => tab.route === route)?.label
    }, [route, dataAssetsTabs])

    const darkModeLabel = isDarkMode
        ? __('Switch to light mode', 'webba-booking-lite')
        : __('Switch to dark mode', 'webba-booking-lite')

    const renderSettingsControl = () => {
        if (ROUTE_TO_SETTINGS_SECTION[route]) {
            return (
                <button
                    type="button"
                    className="wbk_header__settingsIconButton"
                    data-feature-tour="header-settings"
                    title={settingsLabel}
                    aria-label={settingsLabel}
                    onClick={() =>
                        openSettingsSection(ROUTE_TO_SETTINGS_SECTION[route]!)
                    }
                >
                    <SettingsIcon />
                </button>
            )
        }

        if (!settingsUrl) {
            return null
        }

        return (
            <a
                href={settingsUrl}
                className="wbk_header__settingsIconButton"
                rel="noopener"
                data-feature-tour="header-settings"
                title={settingsLabel}
                aria-label={settingsLabel}
            >
                <SettingsIcon />
            </a>
        )
    }

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
                    className="wbk_header__themeToggle"
                    title={darkModeLabel}
                    aria-label={darkModeLabel}
                    aria-pressed={isDarkMode}
                    onClick={toggleTheme}
                >
                    {isDarkMode ? <SunIcon /> : <MoonIcon />}
                </button>
                <button
                    type="button"
                    className="wbk_header__iconButton"
                    data-feature-tour="shortcode-builder"
                    title={__('Open shortcode builder', 'webba-booking-lite')}
                    aria-label={__(
                        'Open shortcode builder',
                        'webba-booking-lite'
                    )}
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
                {admin_url && (
                    <button
                        type="button"
                        className="wbk_header__quickSetupGuideLink"
                        data-feature-tour="quick-setup-guide"
                        disabled={isRelaunchingOnboarding}
                        onClick={handleQuickSetupGuide}
                    >
                        {__('Quick Setup Guide', 'webba-booking-lite')}
                    </button>
                )}
                <a
                    href={DOCUMENTATION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {__('Documentation', 'webba-booking-lite')}
                </a>
                {supportUrl && (
                    <a
                        href={supportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {__('Support', 'webba-booking-lite')}
                    </a>
                )}
                {renderSettingsControl()}
            </div>
        </header>
    )
}
