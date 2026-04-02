import './AppearanceEditor.scss'
import toggleIcon from '../../../../public/images/arrow-down.svg'
import {
    IAppearanceField,
    IAppearanceSection,
    IAppearanceSubsection,
    IAppearanceSectionConstructorProps,
    IConstructAppearanceFieldProps,
    IConstructAppearanceSubsectionProps,
} from './types'
import { ColorOption } from './Fields/ColorOption/ColorOption'
import { SelectOption } from './Fields/SelectOption/SelectOption'
import { useState } from 'react'
import classNames from 'classnames'
import {
    generateColorShades,
    generateTextColors,
} from '../../../frontend/lib/colorShades'
import { ShadowOption } from './Fields/ShadowOption/ShadowOption'
import { useSelect } from '@wordpress/data'
import { store } from '../../../store/backend'
import { __, sprintf } from '@wordpress/i18n'
import { ProFeatuerWrapper } from '../ProFeatuerWrapper/ProFeatuerWrapper'

const constructAppearanceField = ({
    fields,
}: IConstructAppearanceFieldProps) => {
    return fields.map((field: IAppearanceField) => {
        const { id, type, label } = field

        switch (type) {
            case 'color':
                return <ColorOption fieldConfig={field} />
                break
            case 'select':
                return <SelectOption fieldConfig={field} />
                break
            case 'shadow':
                return <ShadowOption fieldConfig={field} />
                break
            default:
                break
        }
    })
}

const constructAppearanceSubsection = ({
    subsections,
}: IConstructAppearanceSubsectionProps) => {
    return subsections.map((subsection: IAppearanceSubsection) => (
        <div className={"wbk_appearanceEditor__subsection"} key={subsection.id}>
            {subsection.title && (
                <h4 className={"wbk_appearanceEditor__subsectionTitle"}>{subsection.title}</h4>
            )}
            <div className={"wbk_appearanceEditor__subsectionFields"}>
                {constructAppearanceField({ fields: subsection.fields })}
            </div>
        </div>
    ))
}

export const constructSections = ({
    sections,
}: IAppearanceSectionConstructorProps) => {
    const { plan_map, admin_url, wording } = useSelect(
        (select) => select(store).getPreset(),
        []
    )
    const [activeSection, setActiveSection] = useState(sections[0].id)
    const upgradeLink = sprintf('%sadmin.php?page=wbk-main-pricing', admin_url)

    return sections.map(({ id, title, fields, subsections, requiredPlans }) => (
        <div
            className={"wbk_appearanceEditor__section"}
            key={id}
            onClick={() => setActiveSection(activeSection !== id ? id : '')}
        >
            <div className={"wbk_appearanceEditor__sectionHeader"}>
                <h3 className={"wbk_appearanceEditor__sectionTitle"}>{title}</h3>
                <img
                    className={classNames('wbk_appearanceEditor__accordionIcon', {
                        'wbk_appearanceEditor__accordionIcon--rotate': activeSection === id,
                    })}
                    src={toggleIcon}
                />
            </div>
            <div
                className={classNames('wbk_appearanceEditor__sectionBody', {
                    'wbk_appearanceEditor__sectionBody--active': activeSection === id,
                })}
                onClick={(e) => e.stopPropagation()}
            >
                {plan_map &&
                    requiredPlans &&
                    !requiredPlans.some((plan) => plan_map[plan] === true) && (
                        <ProFeatuerWrapper requiredPlans={requiredPlans} additionalButtonClasses="wbk_appearanceEditor__upgradeButton" additionalClasses="wbk_appearanceEditor__proOverlay" />
                    )}
                {/* Render direct fields if they exist */}
                {fields && (
                    <div className={"wbk_appearanceEditor__fieldsWrapper"}>
                        {constructAppearanceField({ fields })}
                    </div>
                )}

                {/* Render subsections if they exist */}
                {subsections && constructAppearanceSubsection({ subsections })}
            </div>
        </div>
    ))
}

export const extractOptionValues = (sections: IAppearanceSection[]) => {
    return sections.reduce(
        (acc, section: IAppearanceSection) => {
            // Handle direct fields
            if (section.fields) {
                section.fields.forEach((field: IAppearanceField) => {
                    acc[field.id] = field.value
                })
            }

            // Handle subsections
            if (section.subsections) {
                section.subsections.forEach(
                    (subsection: IAppearanceSubsection) => {
                        subsection.fields.forEach((field: IAppearanceField) => {
                            acc[field.id] = field.value
                        })
                    }
                )
            }

            return acc
        },
        {} as { [key: string]: any }
    )
}

/**
 * Generates a CSS config string for appearance options (like PHP's WBK_Appearance_Utils::generate_css_config)
 * and injects or updates it inside <head> for live preview of CSS variable changes.
 */
export function injectCssConfigFromOptions(options: { [key: string]: any }) {
    // Generate CSS variables string for :root
    let cssVars = ''
    Object.entries(options).forEach(([key, value]) => {
        // Convert camelCase or snake_case to dash-case
        const dashKey = key
            .replace(/_/g, '-')
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase()
        cssVars += `\t--wbk-${dashKey}: ${value};\n`
    })

    let css = `/* specific colors */\n:root {\n${cssVars}}\n\n/* color shades */\n`

    // Generate color shades if main colors exist
    if (options.bg_accent && options.bg_sidebar) {
        css += generateCssVariablesForJs({
            primary: generateColorShades(options.bg_accent),
            secondary: generateColorShades(options.bg_sidebar),
        })
    }

    // Remove any previous preview style
    const styleId = 'wbk-appearance-theme-preview'
    let styleTag = document.getElementById(styleId) as HTMLStyleElement | null
    if (!styleTag) {
        styleTag = document.createElement('style')
        styleTag.id = styleId
        document.head.appendChild(styleTag)
    }
    styleTag.textContent = css
}

/**
 * Generates the "color shades" CSS variables, as in PHP's generateCssVariables.
 */
function generateCssVariablesForJs(colorShades: {
    [type: string]: { [shade: number]: string }
}): string {
    let cssVars = ''
    Object.entries(colorShades).forEach(([colorType, shades]) => {
        const textColors = generateTextColors(shades)
        Object.entries(shades).forEach(([shade, color]) => {
            cssVars += `\t--wbk-${colorType}-${shade}: ${color};\n`
            if (textColors[Number(shade)]) {
                cssVars += `\t--wbk-${colorType}-text-${shade}: ${textColors[Number(shade)]};\n`
            }
        })
        cssVars += `\t--wbk-${colorType}-filter-500: none;\n`
    })
    return `:root {\n${cssVars}}\n`
}
