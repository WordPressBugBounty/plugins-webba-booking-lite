export const CURRENCY_OPTIONS: Record<string, string> = {
    EUR: 'EUR - Euro',
    USD: 'USD - U.S. Dollar',
    AED: 'AED - United Arab Emirates Dirham',
    AUD: 'AUD - Australian Dollar',
    BGN: 'BGN - Bulgarian Lev',
    BRL: 'BRL - Brazilian Real',
    CAD: 'CAD - Canadian Dollar',
    CHF: 'CHF - Swiss Franc',
    CNY: 'CNY - Chinese Yuan',
    CZK: 'CZK - Czech Koruna',
    DKK: 'DKK - Danish Krone',
    GBP: 'GBP - British Pound',
    HKD: 'HKD - Hong Kong Dollar',
    HRK: 'HRK - Croatian Kuna',
    HUF: 'HUF - Hungarian Forint',
    IDR: 'IDR - Indonesian Rupiah',
    ILS: 'ILS - Israeli New Shekel',
    INR: 'INR - Indian Rupee',
    ISK: 'ISK - Icelandic Króna',
    JPY: 'JPY - Japanese Yen',
    KRW: 'KRW - South Korean Won',
    MXN: 'MXN - Mexican Peso',
    MYR: 'MYR - Malaysian Ringgit',
    NOK: 'NOK - Norwegian Krone',
    NZD: 'NZD - New Zealand Dollar',
    PHP: 'PHP - Philippine Peso',
    PLN: 'PLN - Polish Złoty',
    RON: 'RON - Romanian Leu',
    RUB: 'RUB - Russian Ruble',
    SEK: 'SEK - Swedish Krona',
    SGD: 'SGD - Singapore Dollar',
    THB: 'THB - Thai Baht',
    TRY: 'TRY - Turkish Lira',
    ZAR: 'ZAR - South African Rand',
}

export interface WizardFieldSchema {
    type: string
    input_type: string
    hidden?: boolean
    title: string
    tab?: string
    misc?: Record<string, unknown> | null
    required?: boolean
    dependency?: [string, string, string][]
    default_value: unknown
    editable?: boolean
    modelName?: string
}

export interface WizardStepSchema {
    title: string
    fields: string[]
}

const getTimezoneOptions = (): Record<string, string> => {
    if (typeof Intl !== 'undefined' && Intl.supportedValuesOf) {
        try {
            const zones = Intl.supportedValuesOf('timeZone') as string[]
            return Object.fromEntries(zones.map((z) => [z, z]))
        } catch {
            //
        }
    }
    const fallbacks: Record<string, string> = {
        'Europe/London': 'Europe/London',
        'Europe/Paris': 'Europe/Paris',
        'America/New_York': 'America/New_York',
        'Asia/Dhaka': 'Asia/Dhaka',
        'UTC': 'UTC',
    }
    return fallbacks
}

export const WIZARD_FIELD_SCHEMAS: Record<string, WizardFieldSchema> = {
    email: {
        type: 'string',
        input_type: 'text',
        hidden: false,
        title: 'Main notifications email',
        misc: { description: "We'll send booking alerts and notifications here", sub_type: 'email' },
        required: true,
        dependency: [],
        default_value: '',
        editable: true,
    },
    wbk_sidebar_help_email: {
        type: 'string',
        input_type: 'text',
        hidden: false,
        title: 'Customer support email',
        misc: { description: 'Will be shown in the booking form' },
        required: false,
        dependency: [],
        default_value: '',
        editable: true,
    },
    wbk_sidebar_help_phone: {
        type: 'string',
        input_type: 'text',
        hidden: false,
        title: 'Customer support phone number',
        misc: { description: 'Will be shown in the booking form' },
        required: false,
        dependency: [],
        default_value: '',
        editable: true,
    },
    timezone: {
        type: 'string',
        input_type: 'select',
        hidden: false,
        title: 'Time-zone',
        misc: {
            description: 'All booking times will be shown in this timezone',
            options: getTimezoneOptions(),
        },
        required: true,
        dependency: [],
        default_value: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
        editable: true,
    },
    currency: {
        type: 'string',
        input_type: 'select',
        hidden: false,
        title: 'Currency',
        misc: {
            description:
                'Used for services pricing. You will be able to set the currency symbol location (before or after) in General Settings',
            options: CURRENCY_OPTIONS,
        },
        required: true,
        dependency: [],
        default_value: 'USD',
        editable: true,
    },
    service_name: {
        type: 'string',
        input_type: 'text',
        hidden: false,
        title: 'Service name',
        misc: { tooltip: 'Enter service name' },
        required: true,
        dependency: [],
        default_value: 'Consultation',
        editable: true,
    },
    service_description: {
        type: 'string',
        input_type: 'textarea',
        hidden: false,
        title: 'Description',
        misc: { tooltip: 'Enter service description' },
        required: false,
        dependency: [],
        default_value: 'Initial consultation session',
        editable: true,
    },
    service_price: {
        type: 'string',
        input_type: 'text',
        hidden: false,
        title: 'Price',
        misc: { tooltip: 'Enter price', sub_type: 'none_negative_float' },
        required: false,
        dependency: [],
        default_value: '50',
        editable: true,
    },
    service_hide_price: {
        type: 'string',
        input_type: 'checkbox',
        hidden: false,
        title: 'Do not show price',
        misc: { yes: 'Yes' },
        required: false,
        dependency: [],
        default_value: '',
        editable: true,
    },
    service_payment_methods: {
        type: 'string',
        input_type: 'select_multiple',
        hidden: false,
        title: 'Payment methods',
        misc: {
            options: 'backend',
            multiple: true,
            description:
                'IMPORTANT! For Google Pay/Apple pay and Other Payment Methods to work you have to activate them in your Stripe account',
            required_plan: 'standard',
        },
        required: false,
        dependency: [],
        default_value: [],
        editable: true,
        modelName: 'services',
    },

    service_duration: {
        type: 'string',
        input_type: 'duration',
        hidden: false,
        title: 'Duration',
        misc: { sub_type: 'duration', tooltip: 'Enter the duration of each booking.' },
        required: true,
        dependency: [],
        default_value: 60,
        editable: true,
    },
    service_interval: {
        type: 'string',
        input_type: 'text',
        hidden: false,
        title: 'Global timeslot interval (step)',
        misc: {
            description: 'In what time intervals time slots should appear on the booking form. For example: "30 minutes" creates slots at 9:00, 9:30, 10:00, etc.',
        },
        required: false,
        dependency: [],
        default_value: '30',
        editable: true,
    },
    service_buffer: {
        type: 'string',
        input_type: 'duration',
        hidden: false,
        title: 'Break time between appointments (buffer time)',
        misc: {
            description:
                'Time between appointments to prepare, clean up, or have a quick break.',
            sub_type: 'duration',
        },
        required: false,
        dependency: [],
        default_value: 15,
        editable: true,
    },
    service_advance: {
        type: 'string',
        input_type: 'duration',
        hidden: false,
        title: 'How far in advance customers must book',
        misc: {
            description:
                "Prevents last-minute bookings. Set how much time in advance customers can book an appointment.",
            sub_type: 'duration',
        },
        required: false,
        dependency: [],
        default_value: 120,
        editable: true,
    },
    service_quantity: {
        type: 'string',
        input_type: 'text',
        hidden: false,
        title: 'Total Slot Capacity',
        misc: {
            sub_type: 'positive_integer',
            description:
                'Set the maximum number of spots available for this service per time slot. Once this limit is reached, the slot will close for everyone.',
        },
        required: false,
        dependency: [],
        default_value: '1',
        editable: true,
    },
    service_min_quantity: {
        type: 'string',
        input_type: 'text',
        hidden: true,
        title: 'Group size min',
        misc: { sub_type: 'positive_integer' },
        required: false,
        dependency: [],
        default_value: '1',
        editable: true,
    },
    service_max_quantity: {
        type: 'string',
        input_type: 'text',
        hidden: true,
        title: 'Group size max / capacity per slot',
        misc: { sub_type: 'positive_integer' },
        required: false,
        dependency: [],
        default_value: '1',
        editable: true,
    },
    service_people_limitation: {
        type: 'string',
        input_type: 'limitation',
        hidden: false,
        title: 'Group Size Limits',
        misc: {
            min_field: 'service_min_quantity',
            max_field: 'service_max_quantity',
            description:
                'Set the minimum and maximum number of spots a single customer can reserve in one transaction. E.g. if you require minimum 4 spots for a slot to be booked, enter 4 in the "min" field.',
        },
        required: false,
        dependency: [],
        default_value: '',
        editable: true,
    },
    wbk_global_working_hours: {
        type: 'json',
        input_type: 'business_hours',
        hidden: false,
        title: 'What are your business hours?',
        misc: {
            description:
                'You will be able to adjust and add additional intervals for different weekdays in the Service settings.',
            tooltip:
                'Enter your operating hours here. Do not worry - you can change hours and dates in the settings page at any time.',
        },
        required: false,
        dependency: [],
        default_value: [
            { start: 32400, end: 46800, day_of_week: '1', status: 'active' },
            { start: 50400, end: 64800, day_of_week: '1', status: 'active' },
            { start: 32400, end: 46800, day_of_week: '2', status: 'active' },
            { start: 50400, end: 64800, day_of_week: '2', status: 'active' },
            { start: 32400, end: 46800, day_of_week: '3', status: 'active' },
            { start: 50400, end: 64800, day_of_week: '3', status: 'active' },
            { start: 32400, end: 46800, day_of_week: '4', status: 'active' },
            { start: 50400, end: 64800, day_of_week: '4', status: 'active' },
            { start: 32400, end: 46800, day_of_week: '5', status: 'active' },
            { start: 50400, end: 64800, day_of_week: '5', status: 'active' },
        ],
        editable: true,
    },
    closed_dates: {
        type: 'string',
        input_type: 'date_multiple',
        hidden: false,
        title: 'Closed Dates / Holidays',
        misc: {
            description: "Add specific dates when you're unavailable",
        },
        required: false,
        dependency: [],
        default_value: '',
        editable: true,
    },
    service_type: {
        type: 'string',
        input_type: 'text',
        hidden: true,
        title: 'Service type',
        required: true,
        dependency: [],
        default_value: 'hourly',
        editable: true,
    },
    unit_name: {
        type: 'string',
        input_type: 'text',
        hidden: false,
        title: 'Name',
        misc: { tooltip: 'Enter the unit name.' },
        required: true,
        dependency: [],
        default_value: 'Studio Apartment',
        editable: true,
    },
    unit_description: {
        type: 'string',
        input_type: 'textarea',
        hidden: false,
        title: 'Description',
        misc: { tooltip: 'Enter a description of the unit.' },
        required: false,
        dependency: [],
        default_value: '',
        editable: true,
    },
    unit_image: {
        type: 'string',
        input_type: 'file',
        hidden: false,
        title: 'Image',
        misc: {
            tooltip:
                'Upload an image for this unit. Leave empty if you do not want to show an image.',
        },
        required: false,
        dependency: [],
        default_value: '',
        editable: true,
    },
    unit_quantity: {
        type: 'string',
        input_type: 'text',
        hidden: false,
        title: 'Quantity',
        misc: {
            tooltip:
                'How many units of this type are available at the selected location(s).',
            sub_type: 'positive_integer',
        },
        required: true,
        dependency: [],
        default_value: '1',
        editable: true,
    },
    unit_capacity: {
        type: 'string',
        input_type: 'text',
        hidden: false,
        title: 'Capacity',
        misc: {
            tooltip:
                'Maximum number of people allowed per unit. Leave empty if not applicable.',
            sub_type: 'positive_integer',
        },
        required: false,
        dependency: [],
        default_value: '1',
        editable: true,
    },
    unit_price: {
        type: 'string',
        input_type: 'price_variant',
        hidden: false,
        title: 'Price',
        misc: { tooltip: 'Enter the price for this unit.' },
        required: true,
        dependency: [],
        default_value: '{"pricing":{"weekday":50,"weekend_holiday":50}}',
        editable: true,
    },
    unit_payment_methods: {
        type: 'string',
        input_type: 'select_multiple',
        hidden: false,
        title: 'Payment methods',
        misc: {
            options: 'backend',
            multiple: true,
            description:
                'IMPORTANT! For Google Pay/Apple pay and Other Payment Methods to work you have to activate them in your Stripe account',
            required_plan: 'standard',
        },
        required: false,
        dependency: [],
        default_value: [],
        editable: true,
        modelName: 'units',
    },
    unit_attendee_type_adult: {
        type: 'string',
        input_type: 'checkbox',
        hidden: true,
        title: 'Adult',
        misc: { yes: 'Yes' },
        required: false,
        dependency: [],
        default_value: 'yes',
        editable: true,
    },
    unit_min_booking_days: {
        type: 'string',
        input_type: 'text',
        hidden: false,
        title: 'Min booking days',
        misc: {
            tooltip: 'Minimum length of a booking in days.',
            sub_type: 'positive_integer',
        },
        required: false,
        dependency: [],
        default_value: '',
        editable: true,
    },
    unit_max_booking_days: {
        type: 'string',
        input_type: 'text',
        hidden: false,
        title: 'Max booking days',
        misc: {
            tooltip: 'Maximum length of a booking in days.',
            sub_type: 'positive_integer',
        },
        required: false,
        dependency: [],
        default_value: '',
        editable: true,
    },
    unit_buffer_before: {
        type: 'string',
        input_type: 'text',
        hidden: false,
        title: 'Buffer before (days)',
        misc: {
            tooltip:
                'Minimum number of days required between the booking date and the start of the stay (or rental period).',
            sub_type: 'none_negative_integer',
        },
        required: false,
        dependency: [],
        default_value: '',
        editable: true,
    },
    unit_buffer_after: {
        type: 'string',
        input_type: 'text',
        hidden: false,
        title: 'Buffer after (days)',
        misc: {
            tooltip:
                'Minimum number of days required after the end of the stay before the unit can be booked again.',
            sub_type: 'none_negative_integer',
        },
        required: false,
        dependency: [],
        default_value: '',
        editable: true,
    },
}

export type WizardServiceType = 'hourly' | 'daily'

export const FIRST_SERVICE_HOURLY_FIELDS = [
    'service_name',
    'service_description',
    'service_price',
    'currency',
    'service_hide_price',
    'service_payment_methods',
    'service_duration',
    'service_interval',
    'service_buffer',
    'service_advance',
    'service_quantity',
    'service_people_limitation',
    'service_min_quantity',
    'service_max_quantity',
] as const

export const FIRST_SERVICE_DAILY_FIELDS = [
    'unit_name',
    'unit_description',
    'unit_image',
    'unit_quantity',
    'unit_capacity',
    'unit_price',
    'currency',
    'unit_payment_methods',
] as const

export const FIRST_SERVICE_DAILY_HIDDEN_FIELDS = ['unit_attendee_type_adult'] as const

export const AVAILABILITY_HOURLY_FIELDS = [
    'wbk_global_working_hours',
    'closed_dates',
] as const

export const AVAILABILITY_DAILY_FIELDS = [
    'unit_min_booking_days',
    'unit_max_booking_days',
    'unit_buffer_before',
    'unit_buffer_after',
    'closed_dates',
] as const

export const getFirstServiceFields = (
    serviceType: WizardServiceType
): readonly string[] =>
    serviceType === 'daily'
        ? FIRST_SERVICE_DAILY_FIELDS
        : FIRST_SERVICE_HOURLY_FIELDS

export const getAvailabilityFields = (
    serviceType: WizardServiceType
): readonly string[] =>
    serviceType === 'daily'
        ? AVAILABILITY_DAILY_FIELDS
        : AVAILABILITY_HOURLY_FIELDS

export const getWizardModelProperties = (): Record<string, WizardFieldSchema & { validators?: unknown[] }> => {
    const allFieldNames = Array.from(
        new Set([
            'service_type',
            ...FIRST_SERVICE_HOURLY_FIELDS,
            ...FIRST_SERVICE_DAILY_FIELDS,
            ...FIRST_SERVICE_DAILY_HIDDEN_FIELDS,
            ...AVAILABILITY_HOURLY_FIELDS,
            ...AVAILABILITY_DAILY_FIELDS,
            ...Object.values(STEP_FIELDS).flat().filter(Boolean),
        ])
    )
    const props: Record<string, WizardFieldSchema & { validators?: unknown[] }> = {}
    for (const name of allFieldNames) {
        const schema = WIZARD_FIELD_SCHEMAS[name]
        if (schema) props[name] = { ...schema, editable: true }
    }
    return props
}

export const getWizardModel = () => ({
    properties: getWizardModelProperties(),
})

export const STEP_FIELDS: Record<string, string[]> = {
    welcome: [],
    businessInfo: ['email', 'wbk_sidebar_help_email', 'wbk_sidebar_help_phone', 'timezone'],
    firstService: [...FIRST_SERVICE_HOURLY_FIELDS],
    availability: [...AVAILABILITY_HOURLY_FIELDS],
    choosePlan: [],
    summary: [],
}

export const WIZARD_STEP_TITLES: Record<string, string> = {
    welcome: 'Welcome',
    businessInfo: 'Step 1 / Business Info',
    firstService: 'Step 2 / First Service',
    availability: 'Step 3 / Availability',
    choosePlan: 'Step 4 / Choose Your Plan',
    summary: 'Summary',
}

export const WIZARD_STEP_ORDER = [
    'welcome',
    'businessInfo',
    'firstService',
    'availability',
    'choosePlan',
    'summary',
] as const

export type WizardStepId = (typeof WIZARD_STEP_ORDER)[number]
