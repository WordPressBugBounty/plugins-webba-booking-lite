import PricingRulesModel from '../../../schemas/pricing_rules.json'

import { removePrefixesFromModelFields } from '../../components/WebbaDataTable/utils'

export const pricingRulesModel = removePrefixesFromModelFields(
    PricingRulesModel,
    'pricing_rule_'
)

export const mockedPricingRule = {}
