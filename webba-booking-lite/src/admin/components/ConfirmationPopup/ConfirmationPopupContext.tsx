import {
    createContext,
    PropsWithChildren,
    useContext,
    useState,
    useCallback,
} from 'react'

interface ConfirmationPopupData {
    title: string
    message: string
    buttonText?: string
    onConfirm: () => void
}

interface ConfirmationPopupContextValue {
    show: (data: ConfirmationPopupData) => void
    hide: () => void
    isVisible: boolean
    data: ConfirmationPopupData | null
}

const ConfirmationPopupContext = createContext<ConfirmationPopupContextValue | null>(
    null
)

export const useConfirmationPopup = () => {
    const ctx = useContext(ConfirmationPopupContext)

    if (ctx === null) {
        throw new Error(
            `'useConfirmationPopup' can only be used inside of the 'ConfirmationPopupProvider'`
        )
    }

    return ctx
}

export const ConfirmationPopupProvider = ({
    children,
}: PropsWithChildren) => {
    const [isVisible, setIsVisible] = useState(false)
    const [data, setData] = useState<ConfirmationPopupData | null>(null)

    const show = useCallback((popupData: ConfirmationPopupData) => {
        setData(popupData)
        setIsVisible(true)
    }, [])

    const hide = useCallback(() => {
        setIsVisible(false)
        setTimeout(() => {
            setData(null)
        }, 300)
    }, [])

    const contextValue: ConfirmationPopupContextValue = {
        show,
        hide,
        isVisible,
        data,
    }

    return (
        <ConfirmationPopupContext.Provider value={contextValue}>
            {children}
        </ConfirmationPopupContext.Provider>
    )
}
