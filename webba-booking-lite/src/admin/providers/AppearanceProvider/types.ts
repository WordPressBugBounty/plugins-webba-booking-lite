import { IAppearanceSection } from '../../components/AppearanceEditor/types'

export interface IAppearanceContext {
    sections: IAppearanceSection[]
    formType: string
    setFormType: (value: string) => void
}
