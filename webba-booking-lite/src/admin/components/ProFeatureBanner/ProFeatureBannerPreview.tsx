import { __ } from '@wordpress/i18n'
import { ProFeatureBannerKey } from '../../types/featureDisplay'
import './ProFeatureBannerPreview.scss'

interface PreviewRow {
    id: string
    name: string
    detail: string
    status: string
}

const PREVIEW_ROWS: Record<ProFeatureBannerKey, PreviewRow[]> = {
    locations: [
        { id: '1', name: 'London', detail: '221B Baker Street', status: __('Visible', 'webba-booking-lite') },
        { id: '2', name: 'Paris', detail: '10 Rue de Rivoli', status: __('Online', 'webba-booking-lite') },
        { id: '3', name: 'Berlin', detail: 'Unter den Linden 5', status: __('Visible', 'webba-booking-lite') },
        { id: '4', name: 'Brussels', detail: 'Grand Place 12', status: __('Hidden', 'webba-booking-lite') },
    ],
    staff_members: [
        { id: '1', name: 'Sarah Chen', detail: 'sarah@example.com', status: __('Active', 'webba-booking-lite') },
        { id: '2', name: 'James Miller', detail: 'james@example.com', status: __('Active', 'webba-booking-lite') },
        { id: '3', name: 'Elena Rossi', detail: 'elena@example.com', status: __('Active', 'webba-booking-lite') },
        { id: '4', name: 'Tom Walker', detail: 'tom@example.com', status: __('Active', 'webba-booking-lite') },
    ],
    extras: [
        { id: '1', name: __('Equipment kit', 'webba-booking-lite'), detail: '$15.00', status: __('Active', 'webba-booking-lite') },
        { id: '2', name: __('Priority setup', 'webba-booking-lite'), detail: '$25.00', status: __('Active', 'webba-booking-lite') },
        { id: '3', name: __('Insurance', 'webba-booking-lite'), detail: '$10.00', status: __('Active', 'webba-booking-lite') },
        { id: '4', name: __('Late checkout', 'webba-booking-lite'), detail: '$20.00', status: __('Active', 'webba-booking-lite') },
    ],
    coupons: [
        { id: '1', name: 'WELCOME10', detail: '10%', status: __('Active', 'webba-booking-lite') },
        { id: '2', name: 'SUMMER25', detail: '$25.00', status: __('Active', 'webba-booking-lite') },
        { id: '3', name: 'VIP15', detail: '15%', status: __('Expired', 'webba-booking-lite') },
        { id: '4', name: 'NEWYEAR', detail: '20%', status: __('Active', 'webba-booking-lite') },
    ],
    forms: [
        { id: '1', name: __('Default form', 'webba-booking-lite'), detail: '8 fields', status: __('Active', 'webba-booking-lite') },
        { id: '2', name: __('Corporate booking', 'webba-booking-lite'), detail: '12 fields', status: __('Active', 'webba-booking-lite') },
        { id: '3', name: __('Event intake', 'webba-booking-lite'), detail: '10 fields', status: __('Draft', 'webba-booking-lite') },
        { id: '4', name: __('Quick booking', 'webba-booking-lite'), detail: '5 fields', status: __('Active', 'webba-booking-lite') },
    ],
    connected_calendars: [
        { id: '1', name: 'Google', detail: 'team@example.com', status: __('Connected', 'webba-booking-lite') },
        { id: '2', name: 'Outlook', detail: 'bookings@example.com', status: __('Connected', 'webba-booking-lite') },
        { id: '3', name: 'Google', detail: 'frontdesk@example.com', status: __('Pending', 'webba-booking-lite') },
        { id: '4', name: 'Outlook', detail: 'sales@example.com', status: __('Connected', 'webba-booking-lite') },
    ],
    daily_services: [
        { id: '1', name: 'Unit A', detail: __('Qty: 2', 'webba-booking-lite'), status: '$50 / day' },
        { id: '2', name: 'Unit B', detail: __('Qty: 1', 'webba-booking-lite'), status: '$75 / day' },
        { id: '3', name: 'Suite 1', detail: __('Qty: 3', 'webba-booking-lite'), status: '$120 / day' },
        { id: '4', name: 'Cabin 4', detail: __('Qty: 1', 'webba-booking-lite'), status: '$90 / day' },
    ],
}

interface ProFeatureBannerPreviewProps {
    previewType: ProFeatureBannerKey
}

export const ProFeatureBannerPreview = ({
    previewType,
}: ProFeatureBannerPreviewProps) => {
    const rows = PREVIEW_ROWS[previewType]

    return (
        <div className="wbk_proFeatureBannerPreview">
            <div className="wbk_proFeatureBannerPreview__glow" />
            <div className="wbk_proFeatureBannerPreview__table">
                <div className="wbk_proFeatureBannerPreview__header">
                    <span>{__('ID', 'webba-booking-lite')}</span>
                    <span>{__('Name', 'webba-booking-lite')}</span>
                    <span>{__('Details', 'webba-booking-lite')}</span>
                    <span>{__('Status', 'webba-booking-lite')}</span>
                </div>
                {rows.map((row) => (
                    <div
                        key={row.id}
                        className="wbk_proFeatureBannerPreview__row"
                    >
                        <span>{row.id}</span>
                        <span>{row.name}</span>
                        <span>{row.detail}</span>
                        <span>{row.status}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
