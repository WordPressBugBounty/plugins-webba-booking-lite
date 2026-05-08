import { useEffect, useMemo } from 'react'
import { useBookingContext } from '../../providers/BookingFormProvider/BookingFormProvider'
import { SelectedItem } from './SelectedItem'
import './SelectedServices.scss'

export const SelectedServices = () => {
    const { bookingMode, services } = useBookingContext()
    if (bookingMode === 'units') {
        return null
    }
    const selectedServices = useMemo(
        () =>
            services
                .filter((service) => service.selected)
                .sort((a, b) => (a.selectedAt || 0) - (b.selectedAt || 0)),
        [services]
    )
    const expandedServices = useMemo(
        () => selectedServices.filter(({ expanded }) => expanded),
        [selectedServices]
    )

    useEffect(() => {
        if (expandedServices.length === 0 && selectedServices.length > 0) {
            selectedServices[0].onUpdate({
                expanded: true,
            })
        }
    }, [expandedServices])

    return (
        <div className={'wbk_selected_services__wrapper'}>
            {selectedServices.map((service, index) => (
                <SelectedItem key={service.id} {...service} index={index} />
            ))}
        </div>
    )
}
