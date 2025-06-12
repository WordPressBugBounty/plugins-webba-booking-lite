import EmailTemplatesModel from '../../../schemas/email_templates.json'

import { removePrefixesFromModelFields } from '../../components/WebbaDataTable/utils'

export const emailTemplatesModel = removePrefixesFromModelFields(
    EmailTemplatesModel,
    'email_template_'
)

export const mockedEmailTemplate = {}
