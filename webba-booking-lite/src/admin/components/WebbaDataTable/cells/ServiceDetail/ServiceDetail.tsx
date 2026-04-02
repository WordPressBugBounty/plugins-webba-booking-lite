import { CellContext } from '@tanstack/react-table'
import { useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { useMemo } from 'react'
import { store } from '../../../../../store/backend'
import { useSettings } from '../../../../providers/SettingsProvider'
import { minutesToText } from '../../utils'
import './ServiceDetail.scss'

export const ServiceDetail = ({ cell }: CellContext<any, any>) => {
    const {
        quantity,
        form_builder: form,
        interval_between,
        prepare_time,
        override_email,
        email,
    } = cell.row.original

    const settings = useSettings()
    const notificationsEmail =
        override_email === 'yes' ? email : settings?.admin_email || ''

    const forms = useSelect((select) => select(store).getItems('forms'), [])
    const SelectedForm = useMemo(
        () => forms.find((f: any) => Number(f.id) === Number(form)),
        [forms, form]
    )

    const bufferTimeText = useMemo(
        () => minutesToText(Number(interval_between) || 0),
        [interval_between]
    )
    const noticeTimeText = useMemo(
        () => minutesToText(Number(prepare_time) || 0),
        [prepare_time]
    )

    const fields = [
        {
            label: __('Total slot capacity', 'webba-booking-lite'),
            value: String(quantity ?? 1),
        },
        {
            label: __('Buffer time', 'webba-booking-lite'),
            value: bufferTimeText,
        },
        {
            label: __('Notice time', 'webba-booking-lite'),
            value: noticeTimeText,
        },
        {
            label: __('Booking form', 'webba-booking-lite'),
            value:
                (SelectedForm && SelectedForm.name) ||
                __('Default Form', 'webba-booking-lite'),
        },
        {
            label: __('Notifications email', 'webba-booking-lite'),
            value: notificationsEmail,
        },
    ]

    return (
        <div className="wbk_serviceDetail__grid">
            {fields.map(({ label, value }) => (
                <div key={label} className="wbk_serviceDetail__gridItem">
                    <span className="wbk_serviceDetail__label">{label}</span>
                    <strong className="wbk_serviceDetail__value">{value}</strong>
                </div>
            ))}
        </div>
    )
}
