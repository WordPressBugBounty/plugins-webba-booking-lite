export interface Model {
    properties: Record<string, any>
}

export interface IStatProps {
    icon?: string
    title: string
    value: string | JSX.Element
}

export interface IConfirmationProps {
    confirmationMessage: string
    action: () => void
    classes?: string
    title?: string
    icon?: string
    buttonType?: 'primary' | 'secondary'
    position?: 'top' | 'right' | 'bottom' | 'left'
}

export type TItemsRawData<T extends Record<string, any>> = T[] | T

export interface ITableError {
    code: number
    message: string
    data: {
        status: number
    }
}
