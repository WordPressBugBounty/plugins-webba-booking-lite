import { IBookingFormProviderProps } from '../../../providers/BookingFormProvider/types'

export interface IBookingFormPopupProps extends Partial<IBookingFormProviderProps> {
    onClose: () => void
}
