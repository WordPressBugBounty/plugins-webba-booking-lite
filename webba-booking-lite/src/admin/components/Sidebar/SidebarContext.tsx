import {
    createContext,
    PropsWithChildren,
    ReactElement,
    useCallback,
    useContext,
    useRef,
    useState,
} from 'react'
import {
    Height,
    OpenOptions,
    Position,
    SidebarContextValue,
    SidebarLayer,
    View,
    Width,
} from './types'

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

export const useOptionalSidebar = () => {
    return useContext(SidebarContext)
}

let nextLayerId = 1

const createLayer = (
    element: ReactElement,
    options: OpenOptions = {}
): SidebarLayer => ({
    id: nextLayerId++,
    element,
    view: options.view || 'modal',
    width: options.width || 'small',
    height: options.height || 'medium',
    position: options.position || 'top',
})

export const SidebarProvider = ({ children }: PropsWithChildren) => {
    const [shown, setShown] = useState(false)
    const [element, setElement] = useState<ReactElement | null>(null)
    const [view, setView] = useState<View>('sidebar')
    const [width, setWidth] = useState<Width>('small')
    const [height, setHeight] = useState<Height>('medium')
    const [position, setPosition] = useState<Position>('top')
    const [nestedLayers, setNestedLayers] = useState<SidebarLayer[]>([])
    const isClosingRef = useRef(false)
    const closeHandlersRef = useRef<Array<() => void>>([])

    const open = useCallback(
        (nextElement: ReactElement, options: OpenOptions = {}) => {
            if (options.nested && shown) {
                setNestedLayers((current) => [
                    ...current,
                    createLayer(nextElement, options),
                ])
                return
            }

            setNestedLayers([])
            setShown(true)
            setElement(nextElement)
            setView(options.view || 'modal')
            setWidth(options.width || 'small')
            setHeight(options.height || 'medium')
            setPosition(options.position || 'top')
        },
        [shown]
    )

    const close = useCallback(() => {
        if (isClosingRef.current) {
            return
        }

        isClosingRef.current = true
        requestAnimationFrame(() => {
            isClosingRef.current = false
        })

        if (nestedLayers.length > 0) {
            setNestedLayers((current) => current.slice(0, -1))
            return
        }

        setShown(false)
        setTimeout(() => {
            setElement(null)
        }, 350)
    }, [nestedLayers.length])

    const registerCloseHandler = useCallback((handler: () => void) => {
        closeHandlersRef.current.push(handler)

        return () => {
            closeHandlersRef.current = closeHandlersRef.current.filter(
                (registeredHandler) => registeredHandler !== handler
            )
        }
    }, [])

    const handleEscape = useCallback(() => {
        const handlers = closeHandlersRef.current
        if (handlers.length > 0) {
            handlers[handlers.length - 1]()
            return
        }

        close()
    }, [close])

    const contextValue: SidebarContextValue = {
        shown,
        element,
        view,
        height,
        position,
        open,
        close,
        width,
        nestedLayers,
        registerCloseHandler,
        handleEscape,
    }

    return (
        <SidebarContext.Provider value={contextValue}>
            {children}
        </SidebarContext.Provider>
    )
}
