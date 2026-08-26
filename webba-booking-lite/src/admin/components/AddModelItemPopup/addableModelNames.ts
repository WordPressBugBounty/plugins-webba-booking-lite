const ADDABLE_MODEL_NAMES = new Set([
    'locations',
    'extras',
    'forms',
    'services',
    'units',
    'staff_members',
    'service_categories',
    'email_templates',
    'coupons',
    'pricing_rules',
])

export const getAddableModelName = (options: unknown): string | null => {
    if (typeof options !== 'string') {
        return null
    }

    if (options === 'backend' || options.startsWith('source:')) {
        return null
    }

    if (!ADDABLE_MODEL_NAMES.has(options)) {
        return null
    }

    return options
}
