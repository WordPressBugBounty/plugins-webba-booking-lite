export type ThemeMode = 'light' | 'dark'

export interface ThemeContextValue {
    theme: ThemeMode
    isDarkMode: boolean
    toggleTheme: () => void
    setTheme: (theme: ThemeMode) => void
}
