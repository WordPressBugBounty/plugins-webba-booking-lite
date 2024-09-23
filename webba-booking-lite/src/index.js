/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/#registering-a-block
 */
import { registerBlockType } from '@wordpress/blocks'

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor. All other files
 * get applied to the editor only.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './style.scss'
import './editor.scss'

/**
 * Internal dependencies
 */
import Edit from './edit'
import save from './save'
import metadata from './block.json'

registerBlockType(metadata.name, {
    attributes: {
        singleOrMulripleService: {
            type: 'string',
            default: 'multiple',
        },
        multipleServices: {
            type: 'boolean',
            default: false,
        },
        showCategoryList: {
            type: 'boolean',
            default: false,
        },
        serviceId: {
            type: 'integer',
            default: 0,
        },
        categoryId: {
            type: 'integer',
            default: 0,
        },
    },
    icon: 'calendar-alt',
    edit: Edit,
    save,
})
