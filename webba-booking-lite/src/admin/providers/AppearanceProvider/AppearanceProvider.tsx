import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react'
import { IAppearanceContext } from './types'
import {
    IAppearanceField,
    IAppearanceSection,
    IAppearanceSubsection,
} from '../../components/AppearanceEditor/types'
import { extractOptionValues, injectCssConfigFromOptions } from '../../components/AppearanceEditor/utils'
import { useSelect } from '@wordpress/data'
import { store } from '../../../store/backend'
import {
    FORM_TYPE_CLASSIC,
    formTypeOptions,
} from '../../screens/AppearanceEditor/sections'

const AppearanceContext = createContext<IAppearanceContext | null>(null)

export const useAppearance = () => {
    const ctx = useContext(AppearanceContext)

    if (!ctx) {
        throw new Error('No appearance context')
    }

    return ctx
}

const isValidFormType = (value: unknown): value is string =>
    formTypeOptions.some((option) => option.value === value)

export const AppearanceProvider = ({
    sections,
    children,
}: PropsWithChildren<{ sections: IAppearanceSection[] }>) => {
    const { appearance_options: appearanceData } = useSelect(
        (select) => select(store).getPreset(),
        []
    )
    const [processedSections, setProcessedSections] = useState(sections)
    const [formType, setFormTypeState] = useState(FORM_TYPE_CLASSIC)

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

    const setFormType = useCallback((value: string) => {
        if (isValidFormType(value)) {
            setFormTypeState(value)
        }
    }, [])

    useEffect(() => {
        const savedFormType = appearanceData?.form_type
        setFormTypeState(
            isValidFormType(savedFormType) ? savedFormType : FORM_TYPE_CLASSIC
        )
    }, [appearanceData])

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
                        subsections: section.subsections.map(
                            (subsection: IAppearanceSubsection) => ({
                                ...subsection,
                                fields: subsection.fields.map(
                                    (field: IAppearanceField) => {
                                        return {
                                            ...field,
                                            value:
                                                appearanceData?.[field.id] ||
                                                field.default ||
                                                '',
                                            setValue: (value: any) =>
                                                setOption({
                                                    id: field.id,
                                                    value,
                                                }),
                                        }
                                    }
                                ),
                            })
                        ),
                    }
                }

                return section
            })
        )
    }, [sections, appearanceData, setOption])

    useEffect(() => {
        injectCssConfigFromOptions(extractOptionValues(processedSections))
    }, [processedSections])

    if (!processedSections) {
        return null
    }

    return (
        <AppearanceContext.Provider
            value={{
                sections: processedSections,
                formType,
                setFormType,
            }}
        >
            {children}
        </AppearanceContext.Provider>
    )
}
