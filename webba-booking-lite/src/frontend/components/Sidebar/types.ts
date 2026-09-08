export interface ISelectedItem {
    id: number
    serviceName: string
    timeslots?: string[]
    amount: string
}

export interface ISidebarProps {
    title: string
    onAddMore: () => void
    toggle: boolean
    onToggle: (toggle: boolean) => void
}

export interface IBottomSummaryProps {
    total: string
    hideCost?: boolean
    onShowSummary: () => void
}
