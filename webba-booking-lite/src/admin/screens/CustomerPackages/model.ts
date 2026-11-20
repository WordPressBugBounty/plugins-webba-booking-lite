import CustomerPackagesModel from '../../../schemas/customer_packages.json'
import { removePrefixesFromModelFields } from '../../components/WebbaDataTable/utils'

const baseModel = removePrefixesFromModelFields(
    CustomerPackagesModel,
    'customer_package_'
)

const properties = (baseModel as any).properties || {}

// Never show payment reference in admin UI.
if (properties.payment_ref) {
    delete properties.payment_ref
}

// Keep only the most important fields visible in the table row.
const tableVisibleFields = new Set([
    'name',
    'email',
    'remaining_credits',
    'status',
    'amount_paid',
    'expires_at',
])

Object.keys(properties).forEach((key) => {
    if (!tableVisibleFields.has(key)) {
        properties[key].hidden = true
    } else {
        properties[key].hidden = false
    }
})

export const customerPackagesModel = baseModel
