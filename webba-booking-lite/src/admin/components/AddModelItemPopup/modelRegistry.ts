import { __ } from '@wordpress/i18n'
import extrasModelRaw from '../../../schemas/extras.json'
import { couponsModel } from '../../screens/Coupons/model'
import { emailTemplatesModel } from '../../screens/EmailTemplates/model'
import { formsModel } from '../../screens/FormBuilder/model'
import { locationsModel } from '../../screens/Locations/model'
import { pricingRulesModel } from '../../screens/PricingRules/model'
import {
    serviceCategoriesModel,
    servicesModel,
    unitsModel,
} from '../../screens/Services/model'
import { staffMembersModel } from '../../screens/StaffMembers/model'
import { removePrefixesFromModelFields } from '../WebbaDataTable/utils'
import { AddableModelConfig } from './types'

export { getAddableModelName } from './addableModelNames'

const extrasModel = removePrefixesFromModelFields(extrasModelRaw, 'extra_')

const ADDABLE_MODELS: Record<string, AddableModelConfig> = {
    locations: {
        modelName: 'locations',
        title: __('Add location', 'webba-booking-lite'),
        formId: 'add-location-form',
        editor: 'form',
        model: locationsModel,
    },
    extras: {
        modelName: 'extras',
        title: __('Add extra', 'webba-booking-lite'),
        formId: 'add-extra-form',
        editor: 'form',
        model: extrasModel,
    },
    forms: {
        modelName: 'forms',
        title: __('Add Form', 'webba-booking-lite'),
        formId: 'add-form-form',
        editor: 'formBuilder',
        model: formsModel,
    },
    services: {
        modelName: 'services',
        title: __('Add hourly service', 'webba-booking-lite'),
        formId: 'add-service-form',
        editor: 'form',
        model: servicesModel,
        width: 'medium',
    },
    units: {
        modelName: 'units',
        title: __('Add daily service', 'webba-booking-lite'),
        formId: 'add-unit-form',
        editor: 'form',
        model: unitsModel,
    },
    staff_members: {
        modelName: 'staff_members',
        title: __('Add staff member', 'webba-booking-lite'),
        formId: 'add-staff-member-form',
        editor: 'form',
        model: staffMembersModel,
    },
    service_categories: {
        modelName: 'service_categories',
        title: __('Add service category', 'webba-booking-lite'),
        formId: 'add-service-category-form',
        editor: 'form',
        model: serviceCategoriesModel,
    },
    email_templates: {
        modelName: 'email_templates',
        title: __('Add Email Template', 'webba-booking-lite'),
        formId: 'add-emailTemplate-form',
        editor: 'form',
        model: emailTemplatesModel,
    },
    coupons: {
        modelName: 'coupons',
        title: __('Add coupon', 'webba-booking-lite'),
        formId: 'add-coupon-form',
        editor: 'form',
        model: couponsModel,
    },
    pricing_rules: {
        modelName: 'pricing_rules',
        title: __('Add Pricing Rule', 'webba-booking-lite'),
        formId: 'add-pricing-rule-form',
        editor: 'form',
        model: pricingRulesModel,
    },
}

export const getAddableModelConfig = (
    modelName: string
): AddableModelConfig | null => {
    return ADDABLE_MODELS[modelName] || null
}
