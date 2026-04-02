export type TAllowedButtonTypes =
    | 'primary'
    | 'secondary'
    | 'generic'
    | 'error'
    | 'custom'

export interface IButtonProps {
    title?: string
    type?: TAllowedButtonTypes
    icon?: string
    iconLocation?: 'left' | 'right'
    onClick?: () => void
    showLoading?: boolean
    disabled?: boolean
    classes?: string
    styles?: Record<string, string>
    href?: string
    target?: string
    tooltip?: string
}
