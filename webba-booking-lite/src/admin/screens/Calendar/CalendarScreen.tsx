import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import {
    format,
    parse,
    startOfWeek,
    getDay,
    fromUnixTime,
    getUnixTime,
    addMinutes,
    startOfMonth,
    endOfWeek,
    endOfMonth,
} from 'date-fns'
import * as locales from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import styles from './CalendarScreen.module.scss'
import { useCallback, useMemo, useState } from 'react'
import { createFormFromModel } from '../../components/Form/lib/createForm'
import { useSidebar } from '../../components/Sidebar/SidebarContext'
import { Form } from '../../components/Form/Form'
import { dispatch, select, useDispatch, useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import { createFormMenuSectionsFromModel } from '../../components/Form/utils/utils'
import { removePrefixesFromModelFields } from '../../components/WebbaDataTable/utils'
import BookingsModel from '../../../schemas/appointments.json'
import { FilterForm } from '../../components/Filter/FilterForm'
import { filterFields } from './FilterConfigs'
import { __ } from '@wordpress/i18n'
import { toZonedTime } from 'date-fns-tz'
import { formatWbkDate } from '../../components/Filter/utils'

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

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

export const CalendarScreen = () => {
    const sidebar = useSidebar()
    const { filterItems } = useDispatch(store_name)
    const bookings = useSelect(
        (select) =>
            // @ts-ignore
            select(store_name).getItems('appointments', [
                {
                    name: 'appointment_day',
                    value: formatWbkDate(startOfWeek(startOfMonth(new Date()))),
                },
                {
                    name: 'appointment_day',
                    value: formatWbkDate(endOfWeek(endOfMonth(new Date()))),
                },
            ]),
        []
    )

    const { settings } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )
    const { deleteItems, setItem, addItem }: any = dispatch(store_name)

    const getBookingFromEvent = useCallback(
        (event: IEvent) => {
            return bookings.find((booking: any) => booking.id == event.id)
        },
        [bookings]
    )

    const onDelete = useCallback(async (id: number) => {
        await deleteItems('appointments', [id])
        sidebar.close()
    }, [])

    const onSubmit = useCallback(async (update: any, id: number) => {
        await setItem('appointments', { ...update, id })
        sidebar.close()
    }, [])

    const onDuplicate = useCallback(async (data: any) => {
        const newId = Number(data.id) + 1
        const update = {
            ...data,
            name: `Copy of ${data.name}`,
            id: String(newId),
        }
        await addItem('appointments', update)
        sidebar.close()
    }, [])

    const handleEventClick = useCallback(
        (event: IEvent) => {
            sidebar.open(
                <Form
                    id="edit-booking-form"
                    name="Edit Booking"
                    defaultValue={getBookingFromEvent(event)}
                    form={form}
                    sections={menuSections}
                    onSubmit={(data) => onSubmit(data, event.id)}
                    onDelete={() => onDelete(event.id)}
                    onDuplicate={() => onDuplicate(getBookingFromEvent(event))}
                />
            )
        },
        [bookings]
    )
    const addBooking = async (data: any) => {
        try {
            await addItem('appointments', data)
        } catch (e) {
            console.error('failed to add booking', e)
        }
    }
    const handleAddBookingClick = () => {
        sidebar.open(
            <Form
                id="add-booking-form"
                name={__('Add Booking', 'webba-booking-lite')}
                form={form}
                sections={menuSections}
                onSubmit={async (data) => {
                    await addBooking(data)
                    sidebar.close()
                }}
            />
        )
    }

    const messages = useMemo(() => {
        return {
            allDay: __('All Day', 'webba-booking-lite'),
            previous: '<',
            next: '>',
            today: __('Today', 'webba-booking-lite'),
            month: __('Month', 'webba-booking-lite'),
            week: __('Week', 'webba-booking-lite'),
            day: __('Day', 'webba-booking-lite'),
            agenda: __('Agenda', 'webba-booking-lite'),
            date: __('Date', 'webba-booking-lite'),
            time: __('Time', 'webba-booking-lite'),
            event: __('Event', 'webba-booking-lite'),
            showMore: (total: number) =>
                __(`+ (${total}) Events`, 'webba-booking-lite'),
        }
    }, [])

    const events = useMemo(() => {
        return bookings.map((booking: any) => {
            let calculatedEnd = null

            if (!booking?.end) {
                const duration = select(store_name)
                    .getItems('services', [])
                    .find((service: any) => service.id === booking.service_id)
                    ?.duration

                calculatedEnd = getUnixTime(
                    addMinutes(fromUnixTime(booking.time), duration)
                )
            }
            return {
                id: booking.id.toString(),
                title: booking?.extra_data.dynamic_title || booking.name,
                start: toZonedTime(
                    fromUnixTime(booking.time),
                    Intl.DateTimeFormat().resolvedOptions().timeZone
                ),
                end: toZonedTime(
                    fromUnixTime(booking?.end ? booking?.end : calculatedEnd),
                    Intl.DateTimeFormat().resolvedOptions().timeZone
                ),
                status: booking.status,
            }
        })
    }, [bookings])

    const updateRange = useCallback(
        (fullRange: Date[] | Record<'start' | 'end', Date>) => {
            const formattedRange: [Date, Date] = Array.isArray(fullRange)
                ? [fullRange[0], fullRange[fullRange.length - 1]]
                : [fullRange.start, fullRange.end]

            filterItems('appointments', [
                {
                    name: 'appointment_day',
                    value: formatWbkDate(formattedRange[0]),
                },
                {
                    name: 'appointment_day',
                    value: formatWbkDate(formattedRange[1]),
                },
            ])
        },
        []
    )

    return (
        <div className={styles.wrapper}>
            <div className={styles.toolWrapper}>
                <FilterForm
                    fields={filterFields}
                    model="appointments"
                    columnCount={2}
                />
                <button
                    onClick={handleAddBookingClick}
                    className="schedule-tools-button-wbk"
                >
                    {__('Add booking +', 'webba-booking-lite')}
                </button>
            </div>
            <Calendar
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{
                    height: '1000px',
                    backgroundColor: '#fff',
                    boxShadow: '0 0 15px rgba(161, 164, 182, 0.5)',
                    borderRadius: 20,
                    overflow: 'hidden',
                }}
                localizer={localizer}
                onSelectEvent={handleEventClick}
                culture={settings?.locale.split('_')[0] || 'en'}
                messages={messages}
                step={15}
                popup
                onRangeChange={(fullRange) => updateRange(fullRange)}
            />
            <a
                href="/wp-admin/admin.php?page=wbk-options&tools=true"
                className="schedule-tools-button-wbk"
            >
                {__('Schedule tools', 'webba-booking-lite')}
            </a>
        </div>
    )
}
