import { __ } from '@wordpress/i18n'
import {
    ProFeatureBannerContent,
    ProFeatureBannerKey,
} from '../../types/featureDisplay'

export const PRO_FEATURE_BANNER_CONTENT: Record<
    ProFeatureBannerKey,
    ProFeatureBannerContent
> = {
    locations: {
        icon: 'icon-map-pin.svg',
        title: __('Locations', 'webba-booking-lite'),
        headline: __(
            'Effortless management for every location',
            'webba-booking-lite'
        ),
        description: __(
            'Easily organize multiple business locations in one place, ensuring smooth operations and a consistent booking experience no matter where your services are offered.',
            'webba-booking-lite'
        ),
        features: [
            __(
                'Centralize scheduling across all branches for clearer, simpler management',
                'webba-booking-lite'
            ),
            __(
                'Improve customer experience by letting clients choose the location that suits them best',
                'webba-booking-lite'
            ),
            __(
                'Keep operations aligned with unified settings, availability, and resource control',
                'webba-booking-lite'
            ),
        ],
        previewType: 'locations',
    },
    staff_members: {
        icon: 'icon-person.svg',
        title: __('Staff Members', 'webba-booking-lite'),
        headline: __(
            'Coordinate your team with confidence',
            'webba-booking-lite'
        ),
        description: __(
            'Assign services, manage availability, and keep every staff member connected to the right locations and calendars.',
            'webba-booking-lite'
        ),
        features: [
            __(
                'Assign staff to services and locations for accurate scheduling',
                'webba-booking-lite'
            ),
            __(
                'Give each team member their own profile and booking visibility',
                'webba-booking-lite'
            ),
            __(
                'Streamline operations with centralized staff management',
                'webba-booking-lite'
            ),
        ],
        previewType: 'staff_members',
    },
    extras: {
        icon: 'icon-cart-increase.svg',
        title: __('Extras', 'webba-booking-lite'),
        headline: __(
            'Boost revenue with optional add-ons',
            'webba-booking-lite'
        ),
        description: __(
            'Let customers personalize their bookings by adding optional services, equipment, or upgrades during checkout.',
            'webba-booking-lite'
        ),
        features: [
            __(
                'Offer add-ons that increase average booking value',
                'webba-booking-lite'
            ),
            __(
                'Attach extras to specific services or rentals',
                'webba-booking-lite'
            ),
            __(
                'Present upsells at the right moment in the booking flow',
                'webba-booking-lite'
            ),
        ],
        previewType: 'extras',
    },
    coupons: {
        icon: 'icon-ud-currency.svg',
        title: __('Coupons', 'webba-booking-lite'),
        headline: __(
            'Drive bookings with flexible discounts',
            'webba-booking-lite'
        ),
        description: __(
            'Create coupon codes to reward loyal customers, fill slow periods, and run targeted promotions across your services.',
            'webba-booking-lite'
        ),
        features: [
            __(
                'Offer percentage or fixed-amount discounts',
                'webba-booking-lite'
            ),
            __(
                'Control coupon usage limits and expiration dates',
                'webba-booking-lite'
            ),
            __(
                'Track promotion performance from one place',
                'webba-booking-lite'
            ),
        ],
        previewType: 'coupons',
    },
    forms: {
        icon: 'icon-clipboard.svg',
        title: __('Booking forms', 'webba-booking-lite'),
        headline: __(
            'Build forms that match your workflow',
            'webba-booking-lite'
        ),
        description: __(
            'Design custom booking forms with the fields you need, then assign them to services for a tailored customer experience.',
            'webba-booking-lite'
        ),
        features: [
            __(
                'Create multiple forms for different services or audiences',
                'webba-booking-lite'
            ),
            __(
                'Collect the exact information your business requires',
                'webba-booking-lite'
            ),
            __(
                'Switch between forms without changing your booking flow',
                'webba-booking-lite'
            ),
        ],
        previewType: 'forms',
    },
    connected_calendars: {
        icon: 'icon-calendar.svg',
        title: __('Connected Calendars', 'webba-booking-lite'),
        headline: __(
            'Keep every calendar in sync',
            'webba-booking-lite'
        ),
        description: __(
            'Connect Google or Outlook calendars to prevent double bookings and keep your team aligned in real time.',
            'webba-booking-lite'
        ),
        features: [
            __(
                'Sync bookings automatically with external calendars',
                'webba-booking-lite'
            ),
            __(
                'Support Google and Outlook providers',
                'webba-booking-lite'
            ),
            __(
                'Reduce manual updates and scheduling conflicts',
                'webba-booking-lite'
            ),
        ],
        previewType: 'connected_calendars',
    },
    daily_services: {
        icon: 'icon-calendar.svg',
        title: __('Daily Services / Rentals', 'webba-booking-lite'),
        headline: __(
            'Manage multi-day rentals with ease',
            'webba-booking-lite'
        ),
        description: __(
            'Offer daily or multi-day rentals with flexible pricing, availability ranges, and inventory control built for longer bookings.',
            'webba-booking-lite'
        ),
        features: [
            __(
                'Set weekday and weekend pricing for rental units',
                'webba-booking-lite'
            ),
            __(
                'Manage quantity and capacity per rental item',
                'webba-booking-lite'
            ),
            __(
                'Handle date-range bookings alongside hourly services',
                'webba-booking-lite'
            ),
        ],
        previewType: 'daily_services',
    },
}
