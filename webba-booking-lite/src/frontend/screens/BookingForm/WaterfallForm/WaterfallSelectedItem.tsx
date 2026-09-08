import { ServiceItem } from '../../../components/Services/ServiceItem'
import { UnitItem } from '../../../components/Services/UnitItem'
import { IServiceProps, IUnitProps } from '../../../components/Services/types'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'

export const WaterfallSelectedItem = () => {
    const { bookingMode, services, units } = useBookingContext()

    if (bookingMode === 'units') {
        const selectedUnit = (units || []).find(
            (unit: IUnitProps) => unit.selected
        )
        if (!selectedUnit) {
            return null
        }

        return (
            <div className="wbk_waterfall_form__selected-item">
                <UnitItem {...selectedUnit} lockSelection />
            </div>
        )
    }

    const selectedService = (services || []).find(
        (service: IServiceProps) => service.selected
    )
    if (!selectedService) {
        return null
    }

    return (
        <div className="wbk_waterfall_form__selected-item">
            <ServiceItem {...selectedService} lockSelection />
        </div>
    )
}
