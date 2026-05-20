export interface IExtraProps {
    id: number
    value?: number
    label: string
    description?: string
    has_description?: boolean
    image?: string | false
    price: string
    min_quantity?: number
    max_quantity?: number
    selected?: boolean
    quantity: number
    selectedAt?: number | null
    onUpdate: (extraProps: Partial<IExtraProps>) => void
}
