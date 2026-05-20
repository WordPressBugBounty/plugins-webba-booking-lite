import { __ } from '@wordpress/i18n'
import { useMemo } from 'react'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { useWording } from '../../hooks/useWording'
import { IExtraProps } from './types'
import { ExtraItem } from './ExtraItem'
import './Extras.scss'

interface IExtrasProps {
    extras: Array<Pick<IExtraProps, 'id'>>
}

export const Extras = ({ extras }: IExtrasProps) => {
    const wording = useWording()
    const { extras: formExtras } = useBookingContext()

    const allowedExtraIds = useMemo(
        () => new Set((extras || []).map((extra) => Number(extra.id))),
        [extras]
    )

    const extrasToView = useMemo(
        () =>
            (formExtras || []).filter((extra) =>
                allowedExtraIds.has(Number(extra.id))
            ),
        [formExtras, allowedExtraIds]
    )

    return (
        <div className="wbk_services_wrapper wbk_extras_wrapper">
            {extrasToView.map((extra: IExtraProps, index: number) => (
                <div
                    key={`extra-${extra.id}-${index}`}
                    className="wbk_services_item_appear"
                >
                    <ExtraItem {...extra} />
                </div>
            ))}
            {extrasToView.length === 0 && (
                <p>
                    {wording.no_extras_found ||
                        wording.no_services_found ||
                        __('No extras found!', 'webba-booking-lite')}
                </p>
            )}
        </div>
    )
}
