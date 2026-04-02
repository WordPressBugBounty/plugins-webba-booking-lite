import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { IAppearanceContext } from './types'
import { useSettings } from '../SettingsProvider'
import { select, useSelect } from '@wordpress/data'
import { store } from '../../../store/backend'
import {
    IAppearanceField,
    IAppearanceSection,
    IAppearanceSubsection,
} from '../../components/AppearanceEditor/types'
import { extractOptionValues, injectCssConfigFromOptions } from '../../components/AppearanceEditor/utils'

const AppearanceContext = createContext<IAppearanceContext | null>(null)

export const useAppearance = () => {
    const ctx = useContext(AppearanceContext)

    if (!ctx) {
        throw new Error('No appearance context')
    }

    return ctx
}

export const AppearanceProvider = ({
    sections,
    children,
}: PropsWithChildren<IAppearanceContext>) => {
    const { appearance_options: appearanceData } = useSelect(
        (select) => select(store).getPreset(),
        []
    )
    const [processedSections, setProcessedSections] = useState(sections)

    const setOption = useCallback(
        ({ id, value }: Partial<IAppearanceField>) => {
            setProcessedSections((prevSections: IAppearanceSection[]) =>
                prevSections.map((section: IAppearanceSection) => {
                    // Handle direct fields
                    if (section.fields) {
                        return {
                            ...section,
                            fields: section.fields.map(
                                (field: IAppearanceField) => {
                                    return field.id === id
                                        ? { ...field, value }
                                        : field
                                }
                            ),
                        }
                    }
                    
                    // Handle subsections
                    if (section.subsections) {
                        return {
                            ...section,
                            subsections: section.subsections.map(
                                (subsection: IAppearanceSubsection) => ({
                                    ...subsection,
                                    fields: subsection.fields.map(
                                        (field: IAppearanceField) => {
                                            return field.id === id
                                                ? { ...field, value }
                                                : field
                                        }
                                    ),
                                })
                            ),
                        }
                    }
                    
                    return section
                })
            )
        },
        []
    )

    useEffect(() => {
        setProcessedSections(
            sections.map((section: IAppearanceSection) => {
                // Handle direct fields
                if (section.fields) {
                    return {
                        ...section,
                        fields: section.fields.map((field: IAppearanceField) => {
                            return {
                                ...field,
                                value:
                                    appearanceData?.[field.id] ||
                                    field.default ||
                                    '',
                                setValue: (value: any) =>
                                    setOption({ id: field.id, value }),
                            }
                        }),
                    }
                }
                
                // Handle subsections
                if (section.subsections) {
                    return {
                        ...section,
                        subsections: section.subsections.map((subsection: IAppearanceSubsection) => ({
                            ...subsection,
                            fields: subsection.fields.map((field: IAppearanceField) => {
                                return {
                                    ...field,
                                    value:
                                        appearanceData?.[field.id] ||
                                        field.default ||
                                        '',
                                    setValue: (value: any) =>
                                        setOption({ id: field.id, value }),
                                }
                            }),
                        })),
                    }
                }
                
                return section
            })
        )
    }, [sections, appearanceData, setOption]) // Also include setOption as dependency (it's stable now)

    useEffect(() => {
        injectCssConfigFromOptions(extractOptionValues(processedSections))
    }, [processedSections])

    if (!processedSections) {
        return null
    }

    return (
        <AppearanceContext.Provider value={{ sections: processedSections }}>
            {children}
        </AppearanceContext.Provider>
    )
}
