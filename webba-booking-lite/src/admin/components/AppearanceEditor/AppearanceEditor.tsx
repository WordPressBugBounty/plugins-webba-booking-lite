import { useAppearance } from '../../providers/AppearanceProvider/AppearanceProvider'
import { constructSections } from './utils'
import './AppearanceEditor.scss'

export const AppearanceEditor = () => {
    const { sections } = useAppearance()

    const sectionsElements = constructSections({ sections })
    return <div className="wbk_appearanceEditor__wrapper">{sectionsElements}</div>
}
