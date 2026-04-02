import ConnectedCalendarsModel from '../../../schemas/connected_calendars.json'
import { removePrefixesFromModelFields } from '../../components/WebbaDataTable/utils'

export const connectedCalendarsModel = removePrefixesFromModelFields(
    ConnectedCalendarsModel,
    'calendar_'
)
