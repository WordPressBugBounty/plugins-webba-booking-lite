export interface IWaitListPendingSlot {
    serviceId: number
    serviceLabel: string
    time: number
    endTime?: number
    staffMemberId?: string | null
    quantity?: number
}

export interface IWaitListPopupProps {
    isOpen: boolean
    pendingSlot: IWaitListPendingSlot | null
    onClose: () => void
    onSuccess?: (slot: IWaitListPendingSlot) => void
}
