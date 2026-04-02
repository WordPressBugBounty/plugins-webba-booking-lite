export interface IConfirmationPopupProps {
    title: string
    message: string
    onConfirm: () => void
    onClose?: () => void
}
