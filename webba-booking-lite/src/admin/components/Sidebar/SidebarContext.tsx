import {
    createContext,
    PropsWithChildren,
    ReactElement,
    useContext,
    useState,
} from 'react'

type View = 'sidebar' | 'modal'
type Width = 'small' | 'medium' | 'large' | 'full'
type Height = 'small' | 'medium' | 'large' | 'auto'
type Position = 'top' | 'bottom' | 'left' | 'right' | 'center'

interface SidebarContextValue {
    shown: boolean
    element: ReactElement | null
    view: View
    width: Width
    height: Height
    position: Position
    open: (element: ReactElement, options?: OpenOptions) => void
    close: () => void
}

interface OpenOptions {
    view?: View
    width?: Width
    height?: Height
    position?: Position
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
    const [view, setView] = useState<'sidebar' | 'modal'>('sidebar')
    const [width, setWidth] = useState<Width>('small')
    const [height, setHeight] = useState<Height>('medium')
    const [position, setPosition] = useState<Position>('top')

    const open = (element: ReactElement, options: OpenOptions = {}) => {
        setShown(true)
        setElement(element)
        setView(options.view || 'modal')
        setWidth(options.width || 'small')
        setHeight(options.height || 'medium')
        setPosition(options.position || 'top')
    }

    const close = () => {
        setShown(false)
        // Wait for closing animation to complete before removing element
        // Add extra time to ensure animation is fully visible
        setTimeout(() => {
            setElement(null)
        }, 350)
    }

    const contextValue: SidebarContextValue = {
        shown,
        element,
        view,
        height,
        position,
        open,
        close,
        width,
    }

    return (
        <SidebarContext.Provider value={contextValue}>
            {children}
        </SidebarContext.Provider>
    )
}
