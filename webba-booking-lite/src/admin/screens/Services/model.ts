import ServicesModel from '../../../schemas/services.json'
import ServiceCategoriesModel from '../../../schemas/service_categories.json'

import { removePrefixesFromModelFields } from '../../components/WebbaDataTable/utils'

export const servicesModel = removePrefixesFromModelFields(
    ServicesModel,
    'service_'
)
export const serviceCategoriesModel = removePrefixesFromModelFields(
    ServiceCategoriesModel,
    'category_'
)

export const mockedService = {}
export const mockedServiceCategory = {}
