import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { BookingScreenTab, BookingScreenTabId } from './types'
import './BookingsScreenTabs.scss'

const BookingsIcon = (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <rect
            x="4"
            y="5"
            width="16"
            height="15"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
        />
        <path
            d="M8 3.5V7M16 3.5V7M4 10h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
    </svg>
)

const PackagesIcon = (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <path
            d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
        <path
            d="M12 12 4 8.5M12 12l8-3.5M12 12v8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

type BookingsScreenTabsProps = {
    activeTab: BookingScreenTabId
    onTabChange: (tabId: BookingScreenTabId) => void
}

export const BookingsScreenTabs = ({
    activeTab,
    onTabChange,
}: BookingsScreenTabsProps) => {
    const tabs: BookingScreenTab[] = [
        {
            id: 'bookings',
            label: __('Bookings', 'webba-booking-lite'),
            icon: BookingsIcon,
        },
        {
            id: 'customer-packages',
            label: __('Customer packages', 'webba-booking-lite'),
            icon: PackagesIcon,
        },
    ]

    return (
        <div
            className="wbk_bookingsScreen__tabs"
            role="tablist"
            aria-label={__('Bookings', 'webba-booking-lite')}
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id

                return (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        id={`wbk-bookings-tab-${tab.id}`}
                        aria-selected={isActive}
                        aria-controls={`wbk-bookings-panel-${tab.id}`}
                        className={classNames('wbk_bookingsScreen__tab', {
                            'wbk_bookingsScreen__tab--active': isActive,
                        })}
                        onClick={() => onTabChange(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                )
            })}
        </div>
    )
}
