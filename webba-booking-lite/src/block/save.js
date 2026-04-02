/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from '@wordpress/block-editor'

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @param {Object} props Properties passed to the function.
 * @param {Object} props.attributes Available block attributes.
 * @return {WPElement} Element to render.
 */
const { RawHTML } = wp.element
export default function save({ attributes }) {
    const isNumeric = (value) => {
        return !isNaN(parseFloat(value)) && isFinite(value)
    }
    let shortcode = ''

    let categoryString = ''
    let locationString = ''
    const locationIds = attributes.locationIds || []
    if (locationIds.length > 0) {
        locationString = ' location=' + locationIds.join(',')
    }
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
