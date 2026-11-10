import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import { FormProvider } from '../../../components/Form/FormProvider'
import { useWebba5Booking } from './useWebba5Booking'
import { Webba5Sidebar } from './Webba5Sidebar'
import { Webba5StepHeader } from './Webba5StepHeader'
import { Webba5ServiceStep } from './Webba5ServiceStep'
import { Webba5ScheduleStep } from './Webba5ScheduleStep'
import { Webba5DetailsStep } from './Webba5DetailsStep'
import { Webba5ReviewStep } from './Webba5ReviewStep'
import { IWebba5FormProps } from './types'
import './Webba5Form.scss'

export const Webba5Form = ({ onBookingComplete }: IWebba5FormProps) => {
    const booking = useWebba5Booking(onBookingComplete)
    const { fields, setFields } = useBookingContext()

    return (
        <FormProvider fields={fields} setFields={setFields}>
            <div className="wbk_webba5_form">
                <div className="wbk_webba5_form__layout">
                    <Webba5Sidebar
                        currentStep={booking.step}
                        serviceStepLocked={booking.skipServiceStep}
                        onStep={booking.openStep}
                    />
                    <div className="wbk_webba5_form__main">
                        <Webba5StepHeader
                            currentStep={booking.step}
                            serviceStepLocked={booking.skipServiceStep}
                            canOpenSchedule={booking.canContinueService}
                            canOpenDetails={booking.canContinueSchedule}
                            canOpenReview={booking.canContinueDetails}
                            onStep={booking.openStep}
                        />
                        {booking.catalogReady && booking.step === 'service' && (
                            <Webba5ServiceStep booking={booking} />
                        )}
                        {booking.step === 'schedule' && (
                            <Webba5ScheduleStep booking={booking} />
                        )}
                        {booking.step === 'details' && (
                            <Webba5DetailsStep booking={booking} />
                        )}
                        {booking.step === 'review' && (
                            <Webba5ReviewStep booking={booking} />
                        )}
                    </div>
                </div>
            </div>
        </FormProvider>
    )
}
