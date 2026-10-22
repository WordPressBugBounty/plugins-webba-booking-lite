import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { useServiceScreenTab } from './useServiceScreenTab'
import { ServiceScreenTab } from './types'
import './ServicesScreenTabs.scss'

const HourlyServicesIcon = (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <circle
            cx="12"
            cy="12"
            r="8"
            stroke="currentColor"
            strokeWidth="1.8"
        />
        <path
            d="M12 8v4.5l3 2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const DailyServicesIcon = (
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

const CategoriesIcon = (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <rect
            x="4"
            y="4"
            width="7"
            height="7"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.8"
        />
        <rect
            x="13"
            y="4"
            width="7"
            height="7"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.8"
        />
        <rect
            x="4"
            y="13"
            width="7"
            height="7"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.8"
        />
        <rect
            x="13"
            y="13"
            width="7"
            height="7"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.8"
        />
    </svg>
)

const ExtrasIcon = (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
        <circle
            cx="12"
            cy="12"
            r="8"
            stroke="currentColor"
            strokeWidth="1.8"
        />
    </svg>
)

export const ServicesScreenTabs = () => {
    const { activeTab, setActiveTab } = useServiceScreenTab()

    const tabs: ServiceScreenTab[] = [
        {
            id: 'hourly',
            label: __('Hourly Services', 'webba-booking-lite'),
            icon: HourlyServicesIcon,
        },
        {
            id: 'daily',
            label: __('Daily Services', 'webba-booking-lite'),
            icon: DailyServicesIcon,
        },
        {
            id: 'categories',
            label: __('Categories', 'webba-booking-lite'),
            icon: CategoriesIcon,
        },
        {
            id: 'extras',
            label: __('Extras', 'webba-booking-lite'),
            icon: ExtrasIcon,
        },
    ]

    return (
        <div
            className="wbk_servicesScreen__tabs"
            role="tablist"
            aria-label={__('Services', 'webba-booking-lite')}
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id

                return (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        id={`wbk-services-tab-${tab.id}`}
                        aria-selected={isActive}
                        aria-controls={`wbk-services-panel-${tab.id}`}
                        className={classNames('wbk_servicesScreen__tab', {
                            'wbk_servicesScreen__tab--active': isActive,
                        })}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                )
            })}
        </div>
    )
}
