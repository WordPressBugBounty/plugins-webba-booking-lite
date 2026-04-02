import { IBookingBlockProps } from './types'
import './BookingBlock.scss'
import { wbkFormat } from '../../../admin/components/Form/utils/dateTime'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'

export const BookingBlock = ({ time, serviceName }: IBookingBlockProps) => {
    const { timeFormat, dateFormat } = useBookingContext()
    
    return (
        <div className={'wbk_booking_block'}>
            <div className={'wbk_booking_block__date-label'}>
                <h4>{wbkFormat(Number(time), 'd')}</h4>
                <p>{wbkFormat(Number(time), 'mm')}</p>
            </div>
            <div className={'wbk_booking_block__info'}>
                <h3>{serviceName}</h3>
                <p>
                    {wbkFormat(Number(time), dateFormat)}
                    {', '}
                    {wbkFormat(Number(time), timeFormat)}
                </p>
            </div>
        </div>
    )
}
