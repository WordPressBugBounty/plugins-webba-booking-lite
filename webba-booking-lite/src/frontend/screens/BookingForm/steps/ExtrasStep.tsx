import { useMemo } from 'react'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { useSelect } from '@wordpress/data'
import { store } from '../../../../store/frontend'
import { Extras } from '../../../components/Extras/Extras'

export const ExtrasStep = () => {
    const { services, units, bookingMode } = useBookingContext()
    const { extras } = useSelect((select: any) => select(store).getPreset(), [])

    const selectedExtrasIds = useMemo(
        () =>
            bookingMode === 'units'
                ? (units || [])
                      .filter(({ selected }) => selected)
                      .flatMap((unit) =>
                          Array.isArray(unit.extra_ids) ? unit.extra_ids : []
                      )
                : services
                      .filter(({ selected }) => selected)
                      .flatMap((service) =>
                          Array.isArray(service.extra_ids)
                              ? service.extra_ids
                              : []
                      ),
        [bookingMode, units, services]
    )

    const selectedExtras = useMemo(() => {
        return (extras || []).filter(({ id }: any) => selectedExtrasIds.includes(id))
    }, [extras, selectedExtrasIds])

    return (
        <div>
            <Extras extras={selectedExtras} />
        </div>
    )
}
