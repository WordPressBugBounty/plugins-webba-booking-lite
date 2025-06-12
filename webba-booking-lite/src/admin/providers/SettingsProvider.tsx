import { createContext, PropsWithChildren, useContext } from 'react'

interface ISettingsContext {
    settings: any
}

const SettingsContext = createContext<ISettingsContext | null>(null)

export const useSettings = () => {
    const ctx = useContext(SettingsContext)

    if (!ctx) {
        throw new Error('No settings context')
    }

    return ctx.settings
}

export const SettingsProvider = ({
    settings,
    children,
}: PropsWithChildren<ISettingsContext>) => (
    <SettingsContext.Provider value={{ settings }}>
        {children}
    </SettingsContext.Provider>
)
