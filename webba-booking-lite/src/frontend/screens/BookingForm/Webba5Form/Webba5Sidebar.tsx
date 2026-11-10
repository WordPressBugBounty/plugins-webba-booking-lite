import { useMemo } from 'react'
import { __ } from '@wordpress/i18n'
import classNames from 'classnames'
import { useBookingContext } from '../../../providers/BookingFormProvider/BookingFormProvider'
import {
    parseCalendarDateString,
    wbkFormat,
} from '../../../../admin/components/Form/utils/dateTime'
import { format } from 'date-fns'
import { useLocale } from '../../../hooks/useLocale'
import { getDateFnsLocale } from '../../../../utilities/timezones'
import { useBookingSummaryTotal } from '../../../hooks/useBookingSummaryTotal'
import { IWebba5SidebarProps, Webba5SidebarItemState } from './types'
import './Webba5Sidebar.scss'

const uniqueValues = (values: string[]) =>
    values.filter((value, index, list) => value && list.indexOf(value) === index)

export const Webba5Sidebar = ({
    currentStep,
    serviceStepLocked,
    onStep,
}: IWebba5SidebarProps) => {
    const { services, units, bookingMode, formData, timeFormat, userTimezone } =
        useBookingContext()
    const { locale } = useLocale()
    const dateFnsLocale = useMemo(() => getDateFnsLocale(locale), [locale])
    const { totalFormatted, hideAllPrices } = useBookingSummaryTotal()

    const selectedItems =
        bookingMode === 'units'
            ? (units || []).filter((item) => item.selected)
            : (services || []).filter((item) => item.selected)
    const serviceLines = selectedItems
        .map((item) => item.label)
        .filter((label): label is string => !!label)

    const places = (services || [])
        .filter((service) => service.selected)
        .flatMap((service) => service.places || [])
    const dateLines = uniqueValues(
        places.map((place) =>
            wbkFormat(place.timeslot, 'F j, Y', userTimezone, {
                locale: dateFnsLocale,
            })
        )
    )
    const timeLines = uniqueValues(
        places.map((place) =>
            wbkFormat(place.timeslot, timeFormat, userTimezone, {
                locale: dateFnsLocale,
            })
        )
    )
    const range = (
        formData as { range?: { start?: string; end?: string } }
    )?.range
    const stayStart = range?.start ? parseCalendarDateString(range.start) : null
    const stayEnd = range?.end ? parseCalendarDateString(range.end) : null
    const stayLabel =
        bookingMode === 'units' && stayStart && stayEnd
            ? `${format(stayStart, 'MMMM d, yyyy', { locale: dateFnsLocale })} – ${format(stayEnd, 'MMMM d, yyyy', { locale: dateFnsLocale })}`
            : ''

    const scheduleLines =
        bookingMode === 'units'
            ? stayLabel
                ? [stayLabel]
                : []
            : dateLines.length
              ? [dateLines.join(', '), ...timeLines]
              : []

    const serviceState: Webba5SidebarItemState =
        currentStep === 'service' ? 'current' : 'complete'
    const scheduleState: Webba5SidebarItemState =
        currentStep === 'schedule'
            ? 'current'
            : currentStep === 'details' || currentStep === 'review'
              ? 'complete'
              : 'upcoming'
    const detailsState: Webba5SidebarItemState =
        currentStep === 'details'
            ? 'current'
            : currentStep === 'review'
              ? 'complete'
              : 'upcoming'
    const paymentState: Webba5SidebarItemState =
        currentStep === 'review' ? 'current' : 'upcoming'

    const items: {
        id: string
        number: number
        label: string
        state: Webba5SidebarItemState
        lines: string[]
        onSelect?: () => void
    }[] = [
        {
            id: 'services',
            number: 1,
            label: __('Services', 'webba-booking-lite'),
            state: serviceState,
            lines: serviceLines,
            onSelect:
                serviceState === 'complete' && !serviceStepLocked
                    ? () => onStep('service')
                    : undefined,
        },
        {
            id: 'schedule',
            number: 2,
            label: __('Date and time', 'webba-booking-lite'),
            state: scheduleState,
            lines: scheduleState === 'upcoming' ? [] : scheduleLines,
            onSelect:
                scheduleState === 'complete' ? () => onStep('schedule') : undefined,
        },
        {
            id: 'details',
            number: 3,
            label: __('Details', 'webba-booking-lite'),
            state: detailsState,
            lines: [],
            onSelect:
                detailsState === 'complete' ? () => onStep('details') : undefined,
        },
        {
            id: 'payment',
            number: 4,
            label: __('Payment', 'webba-booking-lite'),
            state: paymentState,
            lines:
                !hideAllPrices && totalFormatted ? [totalFormatted] : [],
        },
    ]

    return (
        <ol className="wbk_webba5_sidebar">
            {items.map((item) => {
                const content = (
                    <>
                        <span
                            className={classNames('wbk_webba5_sidebar__marker', {
                                'wbk_webba5_sidebar__marker--complete':
                                    item.state === 'complete',
                            })}
                        >
                            {item.state === 'complete' ? (
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M2.5 7.2 5.4 10 11.5 3.8"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            ) : (
                                item.number
                            )}
                        </span>
                        <span className="wbk_webba5_sidebar__label">
                            {item.label}
                        </span>
                    </>
                )

                return (
                    <li
                        key={item.id}
                        className={classNames('wbk_webba5_sidebar__item', {
                            'wbk_webba5_sidebar__item--complete':
                                item.state === 'complete',
                            'wbk_webba5_sidebar__item--current':
                                item.state === 'current',
                            'wbk_webba5_sidebar__item--upcoming':
                                item.state === 'upcoming',
                        })}
                    >
                        {item.onSelect ? (
                            <button
                                type="button"
                                className="wbk_webba5_sidebar__button wbk_webba5_sidebar__button--link"
                                onClick={item.onSelect}
                            >
                                {content}
                            </button>
                        ) : (
                            <div className="wbk_webba5_sidebar__button">
                                {content}
                            </div>
                        )}
                        {item.lines.length > 0 && (
                            <ul className="wbk_webba5_sidebar__details">
                                {item.id === 'schedule' && item.lines.length > 1 ? (
                                    <li>
                                        <span>{item.lines[0]}</span>
                                        {item.lines.slice(1).map((line) => (
                                            <span
                                                key={line}
                                                className="wbk_webba5_sidebar__time"
                                            >
                                                {line}
                                            </span>
                                        ))}
                                    </li>
                                ) : (
                                    item.lines.map((line) => (
                                        <li key={line}>{line}</li>
                                    ))
                                )}
                            </ul>
                        )}
                    </li>
                )
            })}
        </ol>
    )
}
