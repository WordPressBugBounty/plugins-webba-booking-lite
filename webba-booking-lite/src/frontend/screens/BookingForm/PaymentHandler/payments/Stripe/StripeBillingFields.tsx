import { IStripeBillingFieldsProps, StripeFieldName } from './types'
import { __ } from '@wordpress/i18n'
import './StripeBillingFields.scss'
import { countries, Country } from '../../../../../../utilities/countries'

const fieldLabels: Record<StripeFieldName, string> = {
    name: __('Full name', 'webba-booking-lite'),
    line1: __('Address line 1', 'webba-booking-lite'),
    line2: __('Address line 2', 'webba-booking-lite'),
    city: __('City', 'webba-booking-lite'),
    state: __('State / Province / Region', 'webba-booking-lite'),
    postal_code: __('ZIP / Postal code', 'webba-booking-lite'),
    country: __('Country or region', 'webba-booking-lite'),
}

const fieldPlaceholders: Record<StripeFieldName, string> = {
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
}

export const StripeBillingFields = ({
    stripeFields = [],
    formData,
    setFormData,
}: IStripeBillingFieldsProps) => {
    if (!stripeFields || stripeFields.length === 0) {
        return null
    }

    const handleFieldChange = (field: StripeFieldName, value: string) => {
        if (!setFormData) return

        const currentBillingDetails =
            formData?.stripe_details?.billing_details || {}

        const updatedBillingDetails = {
            ...currentBillingDetails,
            [field]: value,
        }

        const updatedStripeDetails = {
            ...(formData?.stripe_details || {}),
            billing_details: updatedBillingDetails,
        }

        setFormData('stripe_details', updatedStripeDetails)
    }

    const getFieldValue = (field: StripeFieldName): string => {
        return formData?.stripe_details?.billing_details?.[field] || ''
    }

    const renderField = (field: StripeFieldName) => {
        if (field === 'country') {
            return (
                <div key={field} className="wbk-stripe-billing-fields__field">
                    <label
                        htmlFor={`stripe-field-${field}`}
                        className="wbk-stripe-billing-fields__label"
                    >
                        {fieldLabels[field]}
                    </label>
                    <select
                        id={`stripe-field-${field}`}
                        name={field}
                        className="wbk-stripe-billing-fields__select"
                        value={getFieldValue(field)}
                        onChange={(e) =>
                            handleFieldChange(field, e.target.value)
                        }
                    >
                        <option value="">
                            {__('Select a country...', 'webba-booking-lite')}
                        </option>
                        {countries.map((country: Country) => (
                            <option key={country.code} value={country.code}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                </div>
            )
        }

        return (
            <div key={field} className="wbk-stripe-billing-fields__field">
                <label
                    htmlFor={`stripe-field-${field}`}
                    className="wbk-stripe-billing-fields__label"
                >
                    {fieldLabels[field]}
                </label>
                <input
                    type="text"
                    id={`stripe-field-${field}`}
                    name={field}
                    placeholder={fieldPlaceholders[field]}
                    className="wbk-stripe-billing-fields__input"
                    value={getFieldValue(field)}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                />
            </div>
        )
    }

    const fieldOrder: StripeFieldName[] = [
        'name',
        'country',
        'line1',
        'line2',
        'postal_code',
        'city',
        'state',
    ]

    const orderedFields = fieldOrder.filter((field) =>
        stripeFields.includes(field)
    )

    const hasPostalCode = orderedFields.includes('postal_code')
    const hasCity = orderedFields.includes('city')
    const shouldGroupPostalCity = hasPostalCode && hasCity

    const renderOrderedFields = () => {
        const elements: JSX.Element[] = []
        let i = 0

        while (i < orderedFields.length) {
            const field = orderedFields[i]

            if (
                shouldGroupPostalCity &&
                (field === 'postal_code' || field === 'city')
            ) {
                const postalIndex = orderedFields.indexOf('postal_code')
                const cityIndex = orderedFields.indexOf('city')

                if (i === Math.min(postalIndex, cityIndex)) {
                    elements.push(
                        <div
                            key="postal-city-group"
                            className="wbk-stripe-billing-fields__row"
                        >
                            {renderField('postal_code')}
                            {renderField('city')}
                        </div>
                    )
                    i = Math.max(postalIndex, cityIndex) + 1
                    continue
                } else {
                    i++
                    continue
                }
            }

            elements.push(renderField(field))
            i++
        }

        return elements
    }

    return (
        <div className="wbk-stripe-billing-fields">
            <div className="wbk-stripe-billing-fields__title">
                {__('Billing information', 'webba-booking-lite')}
            </div>
            <div className="wbk-stripe-billing-fields__container">
                {renderOrderedFields()}
            </div>
        </div>
    )
}
