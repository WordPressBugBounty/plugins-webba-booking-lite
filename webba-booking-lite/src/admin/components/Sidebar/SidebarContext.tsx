import {
    createContext,
    PropsWithChildren,
    ReactElement,
    useContext,
    useState,
} from 'react'

interface SidebarContextValue {
    shown: boolean
    element: ReactElement | null
    open: (element: ReactElement) => void
    close: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export const useSidebar = () => {
    const ctx = useContext(SidebarContext)

    if (ctx === null) {
        throw new Error(
            `'useSidebar' can only be used inside of the 'SidebarProvider'`
        )
    }

    return ctx
}

export const SidebarProvider = ({ children }: PropsWithChildren) => {
    const [shown, setShown] = useState(false)
    const [element, setElement] = useState<ReactElement | null>(null)

    const open = (element: ReactElement) => {
        setShown(true)
        setElement(element)
    }

    const close = () => {
        setElement(null)
        setShown(false)
    }

    const contextValue: SidebarContextValue = {
        shown,
        element,
        open,
        close,
    }

    return (
        <SidebarContext.Provider value={contextValue}>
            {children}
        </SidebarContext.Provider>
    )
}
