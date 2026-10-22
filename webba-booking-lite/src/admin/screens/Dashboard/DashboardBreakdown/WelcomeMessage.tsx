import { __, sprintf } from '@wordpress/i18n'
import { useDispatch, useSelect } from '@wordpress/data'
import { store, store_name } from '../../../../store/backend'
import { Button } from '../../../components/Button/Button'
import { Form } from '../../../components/Form/Form'
import { createFormFromModel } from '../../../components/Form/lib/createForm'
import { FormValueFromModel } from '../../../components/Form/lib/types'
import { createFormMenuSectionsFromModel } from '../../../components/Form/utils/utils'
import { useSidebar } from '../../../components/Sidebar/SidebarContext'
import { removePrefixesFromModelFields } from '../../../components/WebbaDataTable/utils'
import { usePage } from '../../../components/Router/usePage'
import { stripIncompleteBookingExtrasForSubmit } from '../../../components/Form/Fields/ExtrasSelectorField/ExtrasSelectorField'
import BookingsModel from '../../../../schemas/appointments.json'
import { WelcomeMessageProps } from './types'
import {
    formatDashboardDate,
    useDashboardTimezone,
} from './dashboardTime'
import './WelcomeMessage.scss'
import { useRoute } from '../../../components/Router/useRoute'

const bookingsModel = removePrefixesFromModelFields(
    BookingsModel,
    'appointment_'
)

const form = createFormFromModel(bookingsModel)

const menuSections = createFormMenuSectionsFromModel({
    model: bookingsModel,
    form,
    modelName: 'appointments',
})

const formatNextAppointmentLabel = (
    data: WelcomeMessageProps['data'],
    timezone: string,
    timeFormat: string
) => {
    if (!data?.nextAppointmentTime || !data.nextAppointmentRelation) {
        return data?.nextAppointmentLabel || ''
    }

    const timeLabel = formatDashboardDate(
        data.nextAppointmentTime,
        timeFormat,
        timezone
    )

    if (data.nextAppointmentRelation === 'today') {
        return sprintf(
            __('The next appointment is today at %s.', 'webba-booking-lite'),
            timeLabel
        )
    }

    if (data.nextAppointmentRelation === 'tomorrow') {
        return sprintf(
            __('The next appointment is tomorrow at %s.', 'webba-booking-lite'),
            timeLabel
        )
    }

    return sprintf(
        __('The next appointment is on %1$s at %2$s.', 'webba-booking-lite'),
        formatDashboardDate(data.nextAppointmentTime, 'M j', timezone),
        timeLabel
    )
}

const sanitizeBookingFormPayload = (data: Record<string, unknown>) => {
    const payload = { ...data }
    if (typeof payload.booking_extra === 'string') {
        payload.booking_extra =
            stripIncompleteBookingExtrasForSubmit(payload.booking_extra)
    }
    return payload
}

export const WelcomeMessage = ({ data }: WelcomeMessageProps) => {
    const sidebar = useSidebar()
    const { setPage } = usePage()
    const { setRoute } = useRoute()
    const { addItem } = useDispatch(store)
    const settings = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset()?.settings,
        []
    )
    const { timezone, timeFormat } = useDashboardTimezone()

    if (!data) {
        return null
    }

    const dateLabel =
        data.dateTimestamp
            ? formatDashboardDate(data.dateTimestamp, 'l, F j, Y', timezone)
            : data.dateLabel

    const nextAppointmentLabel = formatNextAppointmentLabel(
        data,
        timezone,
        timeFormat
    )

    const openAddBooking = () => {
        sidebar.open(
            <Form
                id="dashboard-add-booking-form"
                name={__('Add Booking', 'webba-booking-lite')}
                form={form}
                sections={menuSections}
                onSubmit={async (formData) => {
                    return await addItem(
                        'appointments',
                        sanitizeBookingFormPayload(formData)
                    )
                }}
                defaultValue={{} as FormValueFromModel<typeof bookingsModel>}
            />
        )
    }

    return (
        <section className="wbk_welcomeMessage">
            <div className="wbk_welcomeMessage__header">
                <div className="wbk_welcomeMessage__titles">
                    <h2 className="wbk_welcomeMessage__title">{data.title}</h2>
                    <p className="wbk_welcomeMessage__date">{dateLabel}</p>
                </div>
                <div className="wbk_welcomeMessage__actions">
                    <Button
                        type="secondary"
                        className="wbk_welcomeMessage__calendarButton"
                        onClick={() => setRoute('calendar')}
                    >
                        {__('Open calendar', 'webba-booking-lite')}
                    </Button>
                    {settings?.is_admin !== false && (
                        <Button
                            type="primary"
                            className="wbk_welcomeMessage__addButton"
                            onClick={openAddBooking}
                        >
                            + {__('Add booking', 'webba-booking-lite')}
                        </Button>
                    )}
                </div>
            </div>

            <div
                className={
                    data.hasPending
                        ? 'wbk_welcomeMessage__alert'
                        : 'wbk_welcomeMessage__alert wbk_welcomeMessage__alert--success'
                }
            >
                <div className="wbk_welcomeMessage__alertContent">
                    <span
                        className="wbk_welcomeMessage__alertIcon"
                        aria-hidden="true"
                    >
                        {data.hasPending ? '!' : '✓'}
                    </span>
                    <div className="wbk_welcomeMessage__alertText">
                        <p className="wbk_welcomeMessage__alertTitle">
                            {data.pendingTitle}
                        </p>
                        {nextAppointmentLabel && (
                            <p className="wbk_welcomeMessage__alertSubtitle">
                                {nextAppointmentLabel}
                            </p>
                        )}
                    </div>
                </div>
                <Button
                    type="custom"
                    className="wbk_welcomeMessage__reviewButton"
                    onClick={() => setRoute('bookings')}
                >
                    {data.hasPending
                        ? __('Review bookings', 'webba-booking-lite')
                        : __('View bookings', 'webba-booking-lite')}{' '}
                    →
                </Button>
            </div>
        </section>
    )
}
