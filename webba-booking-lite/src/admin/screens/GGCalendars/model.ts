import GGCalendarsModel from '../../../schemas/gg_calendars.json'

import { removePrefixesFromModelFields } from '../../components/WebbaDataTable/utils'

export const ggcalendarsModel = removePrefixesFromModelFields(
    GGCalendarsModel,
    'calendar_'
)

export const mockedGGCalendar = {}
