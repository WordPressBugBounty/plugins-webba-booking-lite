import { ReactElement } from 'react'

export type View = 'sidebar' | 'modal'
export type Width = 'small' | 'medium' | 'large' | 'full'
export type Height = 'small' | 'medium' | 'large' | 'auto'
export type Position = 'top' | 'bottom' | 'left' | 'right' | 'center'

export interface OpenOptions {
    view?: View
    width?: Width
    height?: Height
    position?: Position
    nested?: boolean
}

export interface SidebarLayer {
    id: number
    element: ReactElement
    view: View
    width: Width
    height: Height
    position: Position
}

export interface SidebarContextValue {
    shown: boolean
    element: ReactElement | null
    view: View
    width: Width
    height: Height
    position: Position
    nestedLayers: SidebarLayer[]
    open: (element: ReactElement, options?: OpenOptions) => void
    close: () => void
    handleEscape: () => void
    registerCloseHandler: (handler: () => void) => () => void
}
