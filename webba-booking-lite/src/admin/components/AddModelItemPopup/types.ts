import { Model } from '../../types'
import { Width } from '../Sidebar/types'

export type AddableModelEditor = 'form' | 'formBuilder'

export interface AddableModelConfig {
    modelName: string
    title: string
    formId: string
    editor: AddableModelEditor
    width?: Width
    model?: Model
}

export interface AddModelItemPopupProps {
    modelName: string
    onCreated: (item: Record<string, any>) => void
}
