import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import { useDispatch } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { ThemeContextValue, ThemeMode } from './types'

const DASHBOARD_ROOT_ID = 'wbk_spa_dashboard'
const SIDEBAR_ROOT_SELECTOR = '.wbk_sidebar__container'

const LIGHT_THEME_TOKENS: Record<string, string> = {
    '--wbk-admin-primary': '#1f6763',
    '--wbk-admin-primary-hover': '#18524f',
    '--wbk-admin-primary-soft': 'rgba(31, 103, 99, 0.14)',
    '--wbk-admin-text-black': '#333333',
    '--wbk-admin-text-white': '#ffffff',
    '--wbk-admin-bg-white': '#ffffff',
    '--wbk-admin-bg-offwhite': '#f9fafb',
    '--wbk-admin-page-bg': '#f0f0f1',
    '--wbk-admin-border': 'rgba(0, 0, 0, 0.1)',
    '--wbk-admin-shadow': 'rgba(0, 0, 0, 0.1)',
    '--wbk-admin-input-border': '#e5e7eb',
    '--wbk-admin-input-text': '#1f2937',
    '--wbk-admin-text-grey': '#4b5563',
    '--wbk-admin-row-border': '#f3f4f6',
    '--wbk-admin-light-grey': '#6b7280',
    '--wbk-admin-off-black': '#111827',
    '--wbk-admin-red': '#ef4444',
    '--wbk-admin-green': '#0f766e',
    '--wbk-admin-border-dark': '#8a9393',
    '--wbk-admin-field-background': '#f9fafb',
    '--wbk-admin-field-border': '#d1d5db',
    '--wbk-admin-header-border': '#d3d3d3',
    '--wbk-admin-icon-button-bg': '#ffffff',
    '--wbk-admin-icon-button-border': '#e5e7eb',
    '--wbk-admin-icon-button-hover-bg': '#eef2f3',
    '--wbk-admin-icon-button-hover-border': '#d1d5db',
    '--wbk-admin-icon-button-label': '#22292f',
    '--wbk-admin-link': '#000000',
    '--wbk-admin-secondary-button-bg': '#ffffff',
    '--wbk-admin-secondary-button-text': '#333333',
    '--wbk-admin-surface-elevated': '#ffffff',
}

const DARK_THEME_TOKENS: Record<string, string> = {
    '--wbk-admin-primary': '#3d9b95',
    '--wbk-admin-primary-hover': '#4eb0a9',
    '--wbk-admin-primary-soft': 'rgba(61, 155, 149, 0.22)',
    '--wbk-admin-text-black': '#e5e7eb',
    '--wbk-admin-text-white': '#ffffff',
    '--wbk-admin-bg-white': '#1e1f22',
    '--wbk-admin-bg-offwhite': '#26272b',
    '--wbk-admin-page-bg': '#141516',
    '--wbk-admin-border': 'rgba(255, 255, 255, 0.12)',
    '--wbk-admin-shadow': 'rgba(0, 0, 0, 0.4)',
    '--wbk-admin-input-border': '#3f4147',
    '--wbk-admin-input-text': '#e5e7eb',
    '--wbk-admin-text-grey': '#9ca3af',
    '--wbk-admin-row-border': '#2d2f34',
    '--wbk-admin-light-grey': '#9ca3af',
    '--wbk-admin-off-black': '#f3f4f6',
    '--wbk-admin-red': '#f87171',
    '--wbk-admin-green': '#2dd4bf',
    '--wbk-admin-border-dark': '#6b7280',
    '--wbk-admin-field-background': '#32343a',
    '--wbk-admin-field-border': '#5b5e66',
    '--wbk-admin-header-border': '#3f4147',
    '--wbk-admin-icon-button-bg': '#26272b',
    '--wbk-admin-icon-button-border': '#3f4147',
    '--wbk-admin-icon-button-hover-bg': '#32343a',
    '--wbk-admin-icon-button-hover-border': '#4b5563',
    '--wbk-admin-icon-button-label': '#e5e7eb',
    '--wbk-admin-link': '#e5e7eb',
    '--wbk-admin-secondary-button-bg': '#26272b',
    '--wbk-admin-secondary-button-text': '#e5e7eb',
    '--wbk-admin-surface-elevated': '#26272b',
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const isThemeMode = (value: unknown): value is ThemeMode =>
    value === 'dark' || value === 'light'

const getInitialTheme = (): ThemeMode => {
    const dashboard = document.getElementById(DASHBOARD_ROOT_ID)
    const fromAttribute = dashboard?.getAttribute('data-theme')

    if (isThemeMode(fromAttribute)) {
        return fromAttribute
    }

    const fromBody = document.body.getAttribute('data-wbk-theme')

    if (isThemeMode(fromBody)) {
        return fromBody
    }

    return 'light'
}

const applyThemeTokens = (theme: ThemeMode) => {
    const tokens = theme === 'dark' ? DARK_THEME_TOKENS : LIGHT_THEME_TOKENS

    Object.entries(tokens).forEach(([tokenName, tokenValue]) => {
        document.body.style.setProperty(tokenName, tokenValue)
    })
}

const applyThemeToRoot = (theme: ThemeMode) => {
    const dashboard = document.getElementById(DASHBOARD_ROOT_ID)
    dashboard?.setAttribute('data-theme', theme)

    document
        .querySelectorAll(SIDEBAR_ROOT_SELECTOR)
        .forEach((sidebar) => sidebar.setAttribute('data-theme', theme))

    document.body.setAttribute('data-wbk-theme', theme)
    applyThemeTokens(theme)
}

export const useTheme = () => {
    const context = useContext(ThemeContext)

    if (!context) {
        throw new Error('useTheme can only be used inside ThemeProvider')
    }

    return context
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
    const [theme, setThemeState] = useState<ThemeMode>(() => getInitialTheme())
    const hasMountedRef = useRef(false)
    const { saveAdminTheme } = useDispatch(store_name) as {
        saveAdminTheme: (theme: ThemeMode) => Promise<unknown>
    }

    useLayoutEffect(() => {
        applyThemeToRoot(theme)

        if (!hasMountedRef.current) {
            hasMountedRef.current = true
            return
        }

        Promise.resolve(saveAdminTheme(theme)).catch(() => {
            // Preference still applies for this session if save fails
        })
    }, [theme, saveAdminTheme])

    const setTheme = useCallback((nextTheme: ThemeMode) => {
        setThemeState(nextTheme)
    }, [])

    const toggleTheme = useCallback(() => {
        setThemeState((currentTheme) =>
            currentTheme === 'dark' ? 'light' : 'dark'
        )
    }, [])

    return (
        <ThemeContext.Provider
            value={{
                theme,
                isDarkMode: theme === 'dark',
                toggleTheme,
                setTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    )
}
