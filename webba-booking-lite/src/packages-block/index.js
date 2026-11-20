import { registerBlockType } from '@wordpress/blocks'
import '../block/editor.scss'
import Edit from './edit'
import save from './save'
import metadata from './block.json'
import { getEditorAppearanceDefaults } from '../block/appearanceDefaults.js'

const editorAppearanceDefaults = getEditorAppearanceDefaults()
const blockAttributes = { ...metadata.attributes }
Object.keys(editorAppearanceDefaults).forEach((key) => {
    if (!blockAttributes[key]) {
        return
    }
    blockAttributes[key] = {
        ...blockAttributes[key],
        default: editorAppearanceDefaults[key],
    }
})

registerBlockType(metadata.name, {
    ...metadata,
    attributes: blockAttributes,
    edit: Edit,
    save,
})
