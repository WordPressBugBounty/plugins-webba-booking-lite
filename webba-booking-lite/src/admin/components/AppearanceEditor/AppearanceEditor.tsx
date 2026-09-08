import { useAppearance } from '../../providers/AppearanceProvider/AppearanceProvider'
import { constructSections } from './utils'
import './AppearanceEditor.scss'
import { useMemo } from 'react'

export const AppearanceEditor = () => {
    const { sections, formType } = useAppearance()

    const visibleSections = useMemo(
        () =>
            sections.map((section) => ({
                ...section,
                subsections: section.subsections?.filter(
                    (subsection) =>
                        !subsection.applicableFormTypes ||
                        subsection.applicableFormTypes.includes(formType)
                ),
            })),
        [sections, formType]
    )

    const sectionsElements = constructSections({ sections: visibleSections })
    return <div className="wbk_appearanceEditor__wrapper">{sectionsElements}</div>
}
