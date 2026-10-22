import ConnectedCalendarsModel from '../../../schemas/connected_calendars.json'
import { removePrefixesFromModelFields } from '../../components/WebbaDataTable/utils'

const baseModel = removePrefixesFromModelFields(
    ConnectedCalendarsModel,
    'calendar_'
)

// Extend provider options in TS (src/schemas JSON is not edited by convention).
// Fields live under .properties after removePrefixesFromModelFields().
const providerField = (baseModel as any).properties?.provider
if (providerField?.misc?.options) {
    const hasIcloud = providerField.misc.options.some(
        (opt: { value: string }) => opt.value === 'icloud'
    )
    if (!hasIcloud) {
        providerField.misc.options.push({
            value: 'icloud',
            title: 'iCloud Calendar',
            icon: 'icon-brand-apple.svg',
            required_plan: 'premium',
        })
        providerField.misc.tooltip =
            'Select the calendar provider to connect (Google Calendar, Microsoft Outlook, or iCloud Calendar).'
    }
}

export const connectedCalendarsModel = baseModel
