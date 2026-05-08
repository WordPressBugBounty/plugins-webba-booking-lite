import { APPEARANCE_ATTRIBUTE_DEFAULTS } from '../appearanceDefaults.js'

const APPEARANCE_KEYS = Object.keys(APPEARANCE_ATTRIBUTE_DEFAULTS)

const resolveAppearance = (attributes) => {
    const out = {}
    APPEARANCE_KEYS.forEach((key) => {
        const value = attributes[key]
        out[key] =
            value === null || value === undefined || value === ''
                ? APPEARANCE_ATTRIBUTE_DEFAULTS[key]
                : String(value)
    })
    return out
}

export const buildScopeInlineStyleObject = (attributes) => {
    const appearance = resolveAppearance(attributes || {})
    const bg_accent = appearance.bg_accent
    const bg_sidebar = appearance.bg_sidebar

    const entries = [
        ['--wbk-bg-accent', bg_accent],
        ['--wbk-font', appearance.font],
        ['--wbk-border-radius', appearance.border_radius],
        ['--wbk-shadow', appearance.shadow],
        ['--wbk-button-border-radius', appearance.button_border_radius],
        ['--wbk-bg-button-primary', appearance.bg_button_primary],
        ['--wbk-color-button-primary', appearance.color_button_primary],
        ['--wbk-bg-button-primary-hover', appearance.bg_button_primary_hover],
        ['--wbk-color-button-primary-hover', appearance.color_button_primary_hover],
        ['--wbk-bg-button-inactive', appearance.bg_button_inactive],
        ['--wbk-color-button-inactive', appearance.color_button_inactive],
        ['--wbk-bg-button-selected', appearance.bg_button_selected],
        ['--wbk-color-button-selected', appearance.color_button_selected],
        ['--wbk-bg-button-selected-hover', appearance.bg_button_selected_hover],
        ['--wbk-color-button-selected-hover', appearance.color_button_selected_hover],
        ['--wbk-bg-button-selected-selected', appearance.bg_button_selected_selected],
        [
            '--wbk-color-button-selected-selected',
            appearance.color_button_selected_selected,
        ],
        ['--wbk-bg-button-secondary', appearance.bg_button_secondary],
        ['--wbk-color-button-secondary', appearance.color_button_secondary],
        ['--wbk-bg-button-secondary-hover', appearance.bg_button_secondary_hover],
        [
            '--wbk-color-button-secondary-hover',
            appearance.color_button_secondary_hover,
        ],
        ['--wbk-bg-sidebar', bg_sidebar],
        ['--wbk-color-sidebar', appearance.color_sidebar],
        ['--wbk-color-border-selected', appearance.color_border_selected],
        [
            '--wbk-primary-50',
            `color-mix(in srgb, ${bg_accent} 5%, white 95%)`,
        ],
        [
            '--wbk-primary-100',
            `color-mix(in srgb, ${bg_accent} 10%, white 90%)`,
        ],
        [
            '--wbk-primary-200',
            `color-mix(in srgb, ${bg_accent} 20%, white 80%)`,
        ],
        [
            '--wbk-primary-300',
            `color-mix(in srgb, ${bg_accent} 30%, white 70%)`,
        ],
        [
            '--wbk-primary-400',
            `color-mix(in srgb, ${bg_accent} 40%, white 60%)`,
        ],
        ['--wbk-primary-500', bg_accent],
        [
            '--wbk-primary-600',
            `color-mix(in srgb, ${bg_accent} 88%, black 12%)`,
        ],
        [
            '--wbk-primary-700',
            `color-mix(in srgb, ${bg_accent} 76%, black 24%)`,
        ],
        [
            '--wbk-primary-800',
            `color-mix(in srgb, ${bg_accent} 64%, black 36%)`,
        ],
        [
            '--wbk-primary-900',
            `color-mix(in srgb, ${bg_accent} 52%, black 48%)`,
        ],
        [
            '--wbk-primary-950',
            `color-mix(in srgb, ${bg_accent} 44%, black 56%)`,
        ],
        ['--wbk-primary-text-50', '#22292F'],
        ['--wbk-primary-text-100', '#22292F'],
        ['--wbk-primary-text-200', '#22292F'],
        ['--wbk-primary-text-300', '#22292F'],
        ['--wbk-primary-text-400', '#22292F'],
        ['--wbk-primary-text-500', '#FFFFFF'],
        ['--wbk-primary-text-600', '#FFFFFF'],
        ['--wbk-primary-text-700', '#FFFFFF'],
        ['--wbk-primary-text-800', '#FFFFFF'],
        ['--wbk-primary-text-900', '#FFFFFF'],
        ['--wbk-primary-text-950', '#FFFFFF'],
        ['--wbk-primary-filter-500', 'none'],
        [
            '--wbk-secondary-50',
            `color-mix(in srgb, ${bg_sidebar} 5%, white 95%)`,
        ],
        [
            '--wbk-secondary-100',
            `color-mix(in srgb, ${bg_sidebar} 10%, white 90%)`,
        ],
        [
            '--wbk-secondary-200',
            `color-mix(in srgb, ${bg_sidebar} 20%, white 80%)`,
        ],
        [
            '--wbk-secondary-300',
            `color-mix(in srgb, ${bg_sidebar} 30%, white 70%)`,
        ],
        [
            '--wbk-secondary-400',
            `color-mix(in srgb, ${bg_sidebar} 40%, white 60%)`,
        ],
        ['--wbk-secondary-500', bg_sidebar],
        [
            '--wbk-secondary-600',
            `color-mix(in srgb, ${bg_sidebar} 88%, black 12%)`,
        ],
        [
            '--wbk-secondary-700',
            `color-mix(in srgb, ${bg_sidebar} 76%, black 24%)`,
        ],
        [
            '--wbk-secondary-800',
            `color-mix(in srgb, ${bg_sidebar} 64%, black 36%)`,
        ],
        [
            '--wbk-secondary-900',
            `color-mix(in srgb, ${bg_sidebar} 52%, black 48%)`,
        ],
        [
            '--wbk-secondary-950',
            `color-mix(in srgb, ${bg_sidebar} 44%, black 56%)`,
        ],
        ['--wbk-secondary-text-50', '#22292F'],
        ['--wbk-secondary-text-100', '#22292F'],
        ['--wbk-secondary-text-200', '#22292F'],
        ['--wbk-secondary-text-300', '#22292F'],
        ['--wbk-secondary-text-400', '#22292F'],
        ['--wbk-secondary-text-500', '#22292F'],
        ['--wbk-secondary-text-600', '#FFFFFF'],
        ['--wbk-secondary-text-700', '#FFFFFF'],
        ['--wbk-secondary-text-800', '#FFFFFF'],
        ['--wbk-secondary-text-900', '#FFFFFF'],
        ['--wbk-secondary-text-950', '#FFFFFF'],
        ['--wbk-secondary-filter-500', 'none'],
    ]

    return Object.fromEntries(entries)
}
