import PackageProductsModel from '../../../schemas/package_products.json'
import { removePrefixesFromModelFields } from '../../components/WebbaDataTable/utils'
import { __ } from '@wordpress/i18n'

const baseModel = removePrefixesFromModelFields(
    PackageProductsModel,
    'package_product_'
)

// Overrides for PHP model changes; schema JSON is not edited by convention
// and is not regenerated on field updates.
const properties = (baseModel as any).properties || {}

if (properties.sort_order) {
    delete properties.sort_order
}

if (properties.description) {
    properties.description.required = false
}

const fieldTabs: Record<string, string> = {
    name: 'details',
    description: 'details',
    status: 'details',
    applicable_for_all_services: 'details',
    services: 'details',
    visit_count: 'pricing',
    price: 'pricing',
    payment_methods: 'pricing',
    woo_product: 'pricing',
    expiry_type: 'rules',
    expiry_fixed_date: 'rules',
    expiry_relative_days: 'rules',
    validity_starts: 'rules',
    min_interval_days: 'rules',
    max_visits_per_day: 'rules',
    max_visits_per_week: 'rules',
    max_visits_per_month: 'rules',
    cancel_restore_credits: 'rules',
    max_active_per_customer: 'rules',
}

Object.keys(fieldTabs).forEach((key) => {
    if (properties[key]) {
        properties[key].tab = fieldTabs[key]
    }
})

if (!properties.payment_methods) {
    properties.payment_methods = {
        type: 'string',
        input_type: 'select',
        hidden: true,
        title: __('Payment methods', 'webba-booking-lite'),
        tab: 'pricing',
        misc: {
            tooltip: __(
                'Select the preferred payment method(s) for this package.',
                'webba-booking-lite'
            ),
            multiple: true,
            options: 'backend',
            description: __(
                'IMPORTANT! For Google Pay/Apple pay and Other Payment Methods to work you have to activate them in your Stripe account',
                'webba-booking-lite'
            ),
        },
        required: false,
        dependency: [],
        default_value: null,
        editable: true,
    }
} else {
    properties.payment_methods.tab = 'pricing'
    properties.payment_methods.misc = {
        ...(properties.payment_methods.misc || {}),
        multiple: true,
        options: 'backend',
    }
}

if (!properties.woo_product && properties.service_woo_product) {
    properties.woo_product = properties.service_woo_product
    delete properties.service_woo_product
}

if (properties.woo_product) {
    properties.woo_product.tab = 'pricing'
    properties.woo_product.dependency = [
        ['payment_methods', 'contains', 'woocommerce'],
    ]
}

// Keep only the most important fields visible in the table row.
const tableVisibleFields = new Set(['name', 'visit_count', 'price', 'status'])
Object.keys(properties).forEach((key) => {
    if (!tableVisibleFields.has(key)) {
        properties[key].hidden = true
    }
})

export const packageProductsModel = baseModel
