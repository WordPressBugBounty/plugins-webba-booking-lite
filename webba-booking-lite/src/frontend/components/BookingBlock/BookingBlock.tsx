import { IBookingBlockProps } from './types'
import './BookingBlock.scss'
import { wbkFormat } from '../../../admin/components/Form/utils/dateTime'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { normalizeToUnixSeconds } from '../../lib/utils'

export const BookingBlock = ({ time, serviceName }: IBookingBlockProps) => {
    const { timeFormat, dateFormat } = useBookingContext()
    const unixSeconds = normalizeToUnixSeconds(Number(time))

    return (
        <div className={'wbk_booking_block'}>
            <div className={'wbk_booking_block__date-label'}>
                <h4>{wbkFormat(unixSeconds, 'd')}</h4>
                <p>{wbkFormat(unixSeconds, 'mm')}</p>
            </div>
            <div className={'wbk_booking_block__info'}>
                <h3>{serviceName}</h3>
                <p>
                    {wbkFormat(unixSeconds, dateFormat)}
                    {', '}
                    {wbkFormat(unixSeconds, timeFormat)}
                </p>
            </div>
        </div>
    )
}
