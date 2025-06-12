import { Page, Route } from '../Router/types'
import { useRoute } from '../Router/useRoute'
import styles from './Header.module.scss'
import { usePage } from '../Router/usePage'
import { __ } from '@wordpress/i18n'
import { useMemo } from 'react'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import webbaLogo from '../../../../public/images/webba_booking_logo_hq.png'

interface TabConfig {
    route: Route
    label: string
    url?: string
}

export const Header = () => {
    const { page } = usePage()
    const { setRoute, route } = useRoute()
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
                route: 'calendars',
                slug: 'wbk-gg-calendars',
                label: __('Google calendars', 'webba-booking-lite'),
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
        <header className={styles.header}>
            <div className={styles.logoLinkContainer}>
                <a
                    className={styles.logoLink}
                    href="https://webba-booking.com/"
                    target="_blank"
                    rel="noopener"
                >
                    <img className={styles.logoImg} src={webbaLogo} />
                </a>
            </div>
            <div className={styles.verticalLine} />
            <p className={styles.title}>{pageTitle}</p>
            <div className={styles.tabItemsContainer}></div>
        </header>
    )
}
