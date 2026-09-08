export const APPEARANCE_ATTRIBUTE_DEFAULTS = {
    bg_accent: '#15B8A9',
    font: '"Ubuntu", sans-serif',
    border_radius: '8px',
    shadow: '0px 0px 16px 0px #3f3f4629',
    button_border_radius: '8px',
    bg_button_primary: '#15B8A9',
    color_button_primary: '#ffffff',
    bg_button_primary_hover: '#1A5B57',
    color_button_primary_hover: '#ffffff',
    bg_button_inactive: '#edeff3',
    color_button_inactive: '#ffffff',
    bg_button_selected: '#15B8A9',
    color_button_selected: '#ffffff',
    bg_button_selected_hover: '#1A5B57',
    color_button_selected_hover: '#ffffff',
    bg_button_selected_selected: '#ffffff',
    color_button_selected_selected: '#22292f',
    bg_button_secondary: '#edeff2',
    color_button_secondary: '#ffffff',
    bg_button_secondary_hover: '#1A5B57',
    color_button_secondary_hover: '#ffffff',
    bg_sidebar: '#f9fafb',
    color_sidebar: '#22292F',
    color_border_selected: '#15B8A9',
}

const DEFAULT_FORM_TYPE = 'classic'
const DEFAULT_WEBBA_FONT = '"Ubuntu", sans-serif'

const getSavedAppearanceSource = () => {
    if (typeof window === 'undefined') {
        return null
    }
    const saved = window.wbkGutenbergAppearanceDefaults
    if (!saved || typeof saved !== 'object') {
        return null
    }
    return saved
}

export const normalizeAppearanceFont = (font) => {
    if (!font || font === 'default') {
        return DEFAULT_WEBBA_FONT
    }
    return String(font)
}

export const normalizeAppearanceFormType = (formType) => {
    return formType === 'waterfall' ? 'waterfall' : DEFAULT_FORM_TYPE
}

export const mergeSavedAppearance = (saved) => {
    const merged = { ...APPEARANCE_ATTRIBUTE_DEFAULTS }

    if (!saved || typeof saved !== 'object') {
        return { ...merged, formType: DEFAULT_FORM_TYPE }
    }

    Object.keys(APPEARANCE_ATTRIBUTE_DEFAULTS).forEach((key) => {
        const value = saved[key]
        if (value === null || value === undefined || value === '') {
            return
        }
        merged[key] =
            key === 'font' ? normalizeAppearanceFont(value) : String(value)
    })

    const savedFormType = saved.formType || saved.form_type

    return {
        ...merged,
        formType: normalizeAppearanceFormType(savedFormType),
    }
}

export const getEditorAppearanceDefaults = () => {
    return mergeSavedAppearance(getSavedAppearanceSource())
}
