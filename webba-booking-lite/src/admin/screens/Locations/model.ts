import LocationsModel from '../../../schemas/locations.json'

import { removePrefixesFromModelFields } from '../../components/WebbaDataTable/utils'

export const locationsModel = removePrefixesFromModelFields(
    LocationsModel,
    'location_'
)

export const mockedLocation = {}

