import { __ } from '@wordpress/i18n'
import { FieldType, FieldTypeInfo } from '../types'

const DOCS_BASE =
    'https://webba-booking.com/documentation/how-to-create-a-form/'

export const getFieldTypeInfo = (type: FieldType): FieldTypeInfo => {
    const fieldTypeInfo: Record<FieldType, FieldTypeInfo> = {
        [FieldType.Text]: {
            description: __(
                'Collect short, single-line text inputs. Examples: Name, City, Company Name.',
                'webba-booking-lite'
            ),
            documentationUrl: `${DOCS_BASE}#2-toc-title`,
        },
        [FieldType.Email]: {
            description: __(
                'Collect and validate email addresses. Examples: Customer email, alternative contact email.',
                'webba-booking-lite'
            ),
            documentationUrl: `${DOCS_BASE}#3-toc-title`,
        },
        [FieldType.Textarea]: {
            description: __(
                'Collect longer text input over multiple lines. Examples: Additional comments, special requirements, notes.',
                'webba-booking-lite'
            ),
            documentationUrl: `${DOCS_BASE}#4-toc-title`,
        },
        [FieldType.Number]: {
            description: __(
                'Collect numeric values only. Examples: Number of guests, membership ID, order quantity.',
                'webba-booking-lite'
            ),
            documentationUrl: `${DOCS_BASE}#5-toc-title`,
        },
        [FieldType.Phone]: {
            description: __(
                'Collect phone numbers with proper formatting. Examples: Mobile phone, office phone.',
                'webba-booking-lite'
            ),
            documentationUrl: `${DOCS_BASE}#6-toc-title`,
        },
        [FieldType.Description]: {
            description: __(
                'Display text or instructions; does not collect user data. Example: “Please arrive 10 minutes early for your appointment.”',
                'webba-booking-lite'
            ),
            documentationUrl: `${DOCS_BASE}#7-toc-title`,
        },
        [FieldType.Dropdown]: {
            description: __(
                'Present a list of predefined options; user selects one. Examples: Choose service type, select country.',
                'webba-booking-lite'
            ),
            documentationUrl: `${DOCS_BASE}#8-toc-title`,
        },
        [FieldType.Radio]: {
            description: __(
                'Display multiple predefined options as radio buttons; user selects one. Examples: Choose gender, pick preferred location.',
                'webba-booking-lite'
            ),
            documentationUrl: `${DOCS_BASE}#9-toc-title`,
        },
        [FieldType.Checkbox]: {
            description: __(
                'Allow one or multiple selections or simple agreement confirmation. Examples: Accept terms & conditions, select add-ons.',
                'webba-booking-lite'
            ),
            documentationUrl: `${DOCS_BASE}#10-toc-title`,
        },
        [FieldType.File]: {
            description: __(
                'Allow customers to upload files. Examples: Attach ID, upload resumes, submit design files.',
                'webba-booking-lite'
            ),
            documentationUrl: `${DOCS_BASE}#11-toc-title`,
        },
        [FieldType.QuantityFields]: {
            description: __(
                'Collect quantities across related options, such as adults, children, or infants.',
                'webba-booking-lite'
            ),
            documentationUrl: DOCS_BASE,
        },
    }

    return fieldTypeInfo[type]
}
