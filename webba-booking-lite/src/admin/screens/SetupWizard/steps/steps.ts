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
        title: 'Service interval',
        misc: null,
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
        title: 'Total slot capacity',
        misc: {
            sub_type: 'positive_integer',
            tooltip:
                'Maximum number of spots available per time slot. Once this limit is reached, the slot closes for everyone.',
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
            tooltip:
                'Group size limits. Min/max spots allowed per individual booking',
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
}

export const getWizardModelProperties = (): Record<string, WizardFieldSchema & { validators?: unknown[] }> => {
    const allFieldNames = Array.from(
        new Set(Object.values(STEP_FIELDS).flat().filter(Boolean))
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
    businessInfo: ['email', 'wbk_sidebar_help_email', 'wbk_sidebar_help_phone', 'timezone', 'currency'],
    firstService: [
        'service_name',
        'service_description',
        'service_price',
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
    ],
    availability: ['wbk_global_working_hours', 'closed_dates'],
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
