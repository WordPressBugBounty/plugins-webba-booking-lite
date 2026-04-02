import FormsModel from '../../../schemas/forms.json'

import { removePrefixesFromModelFields } from '../../components/WebbaDataTable/utils'

export const formsModel = removePrefixesFromModelFields(
    FormsModel,
    'form_'
)

