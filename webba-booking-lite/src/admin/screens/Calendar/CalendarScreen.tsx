import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import {
    format,
    parse,
    startOfWeek as dateFnsStartOfWeek,
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
import './CalendarScreen.scss'
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
import { Button } from '../../components/Button/Button'
import metadata from '../../../schemas/appointments.json'
import { TAllowedFilterValue } from '../../components/Filter/types'
import { increaseOpacity } from '../../components/Form/Fields/ColorField/utils'
import classNames from 'classnames'
import { weekDaysSlugs } from '../../components/Form/utils/dateTime'

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
    const [currentView, setCurrentView] = useState<string>('month')
    const allStatus: Record<string, string> = useMemo(
        () => metadata.properties?.appointment_status.misc?.options,
        []
    )

    const { settings, admin_url } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )

    const weekStart = useMemo(() => {
        const weekStartValue = settings?.week_start
        if (weekStartValue === undefined || weekStartValue === null) {
            return 0
        }

        const valueStr = String(weekStartValue).toLowerCase()
        if (weekDaysSlugs.hasOwnProperty(valueStr)) {
            return weekDaysSlugs[valueStr]
        }

        const parsed = parseInt(String(weekStartValue), 10)
        const result = isNaN(parsed) ? 0 : parsed
        return result
    }, [settings?.week_start])

    const customStartOfWeek = useCallback(
        (date: Date, locale?: any) => {
            return dateFnsStartOfWeek(date, {
                weekStartsOn: weekStart as 0 | 1 | 2 | 3 | 4 | 5 | 6,
                locale,
            })
        },
        [weekStart]
    )

    const customEndOfWeek = useCallback(
        (date: Date, locale?: any) => {
            return endOfWeek(date, {
                weekStartsOn: weekStart as 0 | 1 | 2 | 3 | 4 | 5 | 6,
                locale,
            })
        },
        [weekStart]
    )

    const localizer = useMemo(
        () =>
            dateFnsLocalizer({
                format,
                parse,
                startOfWeek: customStartOfWeek,
                getDay,
                locales,
            }),
        [customStartOfWeek]
    )

    const bookings = useSelect(
        (select) =>
            // @ts-ignore
            select(store_name).getItems('appointments', [
                {
                    name: 'appointment_day',
                    value: formatWbkDate(
                        customStartOfWeek(startOfMonth(new Date()))
                    ),
                },
                {
                    name: 'appointment_day',
                    value: formatWbkDate(
                        customEndOfWeek(endOfMonth(new Date()))
                    ),
                },
                {
                    name: 'appointment_status',
                    value: Object.keys(allStatus).filter(
                        (status) => status === 'approved'
                    ),
                },
            ]),
        [customStartOfWeek, customEndOfWeek, allStatus]
    )
    const services = useSelect(
        // @ts-ignore
        (select) => select(store_name).getItems('services'),
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
            return await addItem('appointments', data)
        } catch (e) {
            console.error(e)
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
                    return await addBooking(data)
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
                    .find(
                        (service: any) => service.id === booking.service_id
                    )?.duration

                calculatedEnd = getUnixTime(
                    addMinutes(fromUnixTime(booking.time), duration)
                )
            }
            return {
                id: booking.id.toString(),
                title: booking?.extra_data?.dynamic_title || booking.name,
                start: toZonedTime(
                    fromUnixTime(booking.time),
                    settings?.timezone ||
                        Intl.DateTimeFormat().resolvedOptions().timeZone
                ),
                end: toZonedTime(
                    fromUnixTime(booking?.end ? booking?.end : calculatedEnd),
                    settings?.timezone ||
                        Intl.DateTimeFormat().resolvedOptions().timeZone
                ),
                status: booking.status,
                color:
                    services.find(
                        (service: any) => service.id == booking.service_id
                    )?.color || 'transparent',
            }
        })
    }, [bookings, services])

    const [customFilter, setCustomFilter] = useState<
        TAllowedFilterValue<any>[]
    >([
        {
            name: 'appointment_day',
            value: formatWbkDate(customStartOfWeek(startOfMonth(new Date()))),
        },
        {
            name: 'appointment_day',
            value: formatWbkDate(customEndOfWeek(endOfMonth(new Date()))),
        },
    ])

    const updateRange = useCallback(
        (fullRange: Date[] | Record<'start' | 'end', Date>) => {
            const formattedRange: [Date, Date] = Array.isArray(fullRange)
                ? [fullRange[0], fullRange[fullRange.length - 1]]
                : [fullRange.start, fullRange.end]

            const query = generateFilterFromDateRange(formattedRange)
            setCustomFilter(query)

            filterItems('appointments', query)
        },
        [customFilter]
    )

    const generateFilterFromDateRange = useCallback(
        (formattedRange: [Date, Date]) => {
            return [
                {
                    name: 'appointment_day',
                    value: formatWbkDate(formattedRange[0]),
                },
                {
                    name: 'appointment_day',
                    value: formatWbkDate(formattedRange[1]),
                },
                ...customFilter.filter(
                    (filter: TAllowedFilterValue<any>) =>
                        filter.name !== 'appointment_day'
                ),
            ]
        },
        [customFilter]
    )

    const EventWrapper = useCallback(
        ({ event, children }: any) => (
            <div
                className={classNames(
                    'wbk_calendar__eventWrapper',
                    event.status && `wbk_calendar__eventWrapper--${event.status}`
                )}
                style={{ backgroundColor: increaseOpacity(event.color, 0.5) }}
            >
                {children}
            </div>
        ),
        []
    )

    return (
        <div className="wbk_calendar__wrapper">
            <div className="wbk_calendar__toolWrapper">
                <FilterForm
                    fields={filterFields}
                    model="appointments"
                    columnCount={2}
                    customQuery={customFilter}
                    setCustomQuery={setCustomFilter}
                    classes="wbk_calendar__filterWrapper"
                />
                <Button
                    onClick={handleAddBookingClick}
                    className="wbk_calendar__addButton"
                >
                    {__('Add booking +', 'webba-booking-lite')}
                </Button>
                <Button
                    onClick={() =>
                        (window.location.href =
                            admin_url +
                            `/admin.php?page=wbk-calendar&tools=true`)
                    }
                    type="secondary-green"
                >
                    {__('Schedule tools', 'webba-booking-lite')}
                </Button>
            </div>
            <Calendar
                key={`calendar-${weekStart}`}
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
                onRangeChange={(fullRange, view) => {
                    updateRange(fullRange)
                    if (view) {
                        setCurrentView(view as string)
                    }
                }}
                components={{
                    eventWrapper: EventWrapper,
                    event: (props: any) => {
                        // Only customize for day view
                        if (props.isAllDay || props.view !== 'day') {
                            // Use default rendering for other views
                            return <span>{props.title}</span>
                        }
                        // Use the event color with opacity if available, fallback to default
                        const bgColor = props.event.color
                            ? increaseOpacity(props.event.color, 0.5)
                            : undefined
                        return (
                            <div
                                className={classNames(
                                    'wbk_calendar__eventWrapper',
                                    props.event.status && `wbk_calendar__eventWrapper--${props.event.status}`
                                )}
                                style={{
                                    backgroundColor: bgColor,
                                    marginTop: 2,
                                    marginBottom: 2,
                                    width: '98%',
                                    left: '1%',
                                    position: 'relative',
                                    zIndex: 1,
                                }}
                            >
                                <div style={{ fontSize: 12, fontWeight: 600 }}>
                                    {props.event.title}
                                </div>
                            </div>
                        )
                    },
                }}
                dayLayoutAlgorithm="no-overlap"
                // Track current view to help with event rendering
                view={currentView as any}
                onView={(view) => setCurrentView(view)}
            />
        </div>
    )
}
