import { registerBlockType } from '@wordpress/blocks'
import { RawHTML } from '@wordpress/element'
import './style.scss'
import './editor.scss'
import Edit from './edit'
import save from './save'
import metadata from './block.json'
import { APPEARANCE_ATTRIBUTE_DEFAULTS } from './appearanceDefaults.js'

const deprecatedLegacySave = ({ attributes }) => {
    const isNumeric = (value) =>
        !isNaN(parseFloat(value)) && isFinite(value)
    let categoryString = ''
    let locationString = ''
    const locationIds = attributes.locationIds || []
    if (locationIds.length > 0) {
        locationString = ' location=' + locationIds.join(',')
    }
    let shortcode = ''
    if (attributes.singleOrMulripleService == 'multiple') {
        if (attributes.showCategoryList) {
            categoryString = ' category_list=yes '
        } else {
            if (attributes.categoryId != 0) {
                categoryString = ' category=' + attributes.categoryId
            }
        }
        shortcode = '[webbabooking ' + categoryString + locationString + ']'
    } else {
        if (isNumeric(attributes.serviceId)) {
            shortcode =
                '[webbabooking service=' +
                attributes.serviceId +
                locationString +
                ']'
        } else {
            shortcode = ''
        }
    }
    return (
        <div>
            <RawHTML>{shortcode}</RawHTML>
        </div>
    )
}

registerBlockType(metadata.name, {
    ...metadata,
    edit: Edit,
    save,
    deprecated: [
        {
            attributes: {
                singleOrMulripleService: {
                    type: 'string',
                    default: 'multiple',
                },
                multipleServices: { type: 'boolean', default: false },
                showCategoryList: { type: 'boolean', default: false },
                serviceId: { type: 'number', default: 0 },
                categoryId: { type: 'number', default: 0 },
                locationIds: { type: 'array', default: [] },
            },
            migrate(attributes) {
                const service =
                    attributes.singleOrMulripleService === 'single' &&
                    attributes.serviceId > 0
                        ? String(attributes.serviceId)
                        : ''
                const category =
                    attributes.singleOrMulripleService === 'multiple' &&
                    !attributes.showCategoryList &&
                    attributes.categoryId > 0
                        ? [String(attributes.categoryId)]
                        : []
                const location = (attributes.locationIds || []).map(String)
                return {
                    ...APPEARANCE_ATTRIBUTE_DEFAULTS,
                    service,
                    category,
                    location,
                    staff: [],
                    categoryList: !!attributes.showCategoryList,
                }
            },
            save: deprecatedLegacySave,
        },
    ],
})
