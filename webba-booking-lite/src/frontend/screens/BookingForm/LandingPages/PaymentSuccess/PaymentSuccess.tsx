import { useEffect } from 'react'
import { useDispatch, useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/frontend'
import { ThankYou } from '../../ThankYou/ThankYou'
import { PaymentSuccessProps } from './types'
import '../../ThankYou/ThankYou.scss'

export const PaymentSuccess = ({ paymentId }: PaymentSuccessProps) => {
    const dispatch = useDispatch(store_name)
    
    useEffect(() => {
        if (paymentId) {
            dispatch.fetchBookingDetails(paymentId, 'payment_id')
        }
    }, [dispatch, paymentId])

    const bookingDetails = useSelect(
        (select: any) =>
            select(store_name).getBookingDetails(paymentId, 'payment_id'),
        [paymentId]
    )

    const isLoaded =
        bookingDetails &&
        (bookingDetails.booking_data || bookingDetails.payment_details)

    if (!isLoaded) {
        return (
            <div
                className={'wbk_thank_you__wrapper'}
                style={{ textAlign: 'center', padding: '48px 0' }}
            >
                <div className={';wbk_thank_you__header'}>
                    <h3>Loading booking details...</h3>
                </div>
            </div>
        )
    }

    return <ThankYou bookingDetails={{...bookingDetails, ...bookingDetails?.payment_details}} />
}
