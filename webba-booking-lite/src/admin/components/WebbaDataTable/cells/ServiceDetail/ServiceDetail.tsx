import { CellContext } from '@tanstack/react-table'
import { useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { useMemo } from 'react'
import { store_name } from '../../../../../store/backend'
import styles from './ServiceDetail.module.scss'

export const ServiceDetail = ({ cell }: CellContext<any, any>) => {
    const {
        id,
        min_quantity,
        quantity,
        form,
        interval_between,
        step,
        payment_methods,
    } = cell.row.original

    const paymentMethods: Record<string, string> = useMemo(() => {
        return {
            paypal: __('PayPal', 'webba-booking-lite'),
            stripe: __('Stripe', 'webba-booking-lite'),
            arrival: __('On arrival', 'webba-booking-lite'),
            bank: __('Bank transfer', 'webba-booking-lite'),
            woocommerce: __('WooCommerce', 'webba-booking-lite'),
        }
    }, [])

    const { forms } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getCellData('services'),
        []
    )

    return (
        <table className={styles.table}>
            <tbody>
                <tr>
                    <td>
                        {__('ID:', 'webba-booking-lite')}&nbsp;
                        <strong>{id}</strong>
                    </td>
                    <td>
                        {__('Minimum booking count per time slot:')}&nbsp;
                        <strong>{min_quantity}</strong>
                    </td>
                    <td>
                        {__('Maximum booking count per time slot:')}&nbsp;
                        <strong>{quantity}</strong>
                    </td>
                    <td>
                        {__('Booking form:')}&nbsp;
                        <strong>
                            {forms && forms[form] ? forms[form] : ''}
                        </strong>
                    </td>
                    <td>
                        {__('Gap (minutes):')}&nbsp;
                        <strong>{interval_between}</strong>
                    </td>
                    <td>
                        {__('Step (minutes):')}&nbsp;
                        <strong>{step}</strong>
                    </td>
                    {payment_methods && (
                        <td>
                            {__('Payment methods:')}&nbsp;
                            <strong>
                                {JSON.parse(payment_methods)
                                    .map(
                                        (method: any) => paymentMethods[method]
                                    )
                                    .join(', ')}
                            </strong>
                        </td>
                    )}
                </tr>
            </tbody>
        </table>
    )
}
