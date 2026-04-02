import { useAppearance } from '../../../providers/AppearanceProvider/AppearanceProvider'
import { IAppearanceField, IAppearanceSection, IAppearanceSubsection } from '../types'

export const useAppearanceOption = (fieldConfig: IAppearanceField) => {
    const { id } = fieldConfig
    const { sections } = useAppearance()

    const allFields = sections.flatMap((section: IAppearanceSection) => {
        // Handle direct fields
        const directFields = section.fields || []
        
        // Handle subsection fields
        const subsectionFields = section.subsections?.flatMap(
            (subsection: IAppearanceSubsection) => subsection.fields
        ) || []
        
        return [...directFields, ...subsectionFields]
    })
    
    const field = allFields.find((field: IAppearanceField) => field.id === id)

    return field
}
