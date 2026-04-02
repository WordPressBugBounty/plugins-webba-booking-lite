import { __ } from '@wordpress/i18n'
import { useMemo } from 'react'
import { buildCalendarUrls } from './calendarLinks'
import type { BookingDataForCalendar, FirstEventFallback } from './types'
import { ReactComponent as IconGoogle } from '../../../../../../public/images/icon-brand-google.svg'
import { ReactComponent as IconOutlook } from '../../../../../../public/images/icon-brand-outlook.svg'
import { ReactComponent as IconYahoo } from '../../../../../../public/images/icon-brand-yahoo.svg'
import { ReactComponent as IconApple } from '../../../../../../public/images/icon-brand-apple.svg'
import './AddToCalendar.scss'

export interface AddToCalendarProps {
    bookingData: BookingDataForCalendar | null | undefined
    userTimezone: string
    sectionTitle?: string
    isIcalAvailable: boolean
    fallbackFirstEvent?: FirstEventFallback | null
}

export const AddToCalendar = ({
    bookingData,
    userTimezone,
    sectionTitle,
    isIcalAvailable,
    fallbackFirstEvent,
}: AddToCalendarProps) => {
    const calendarLinks = useMemo(
        () =>
            buildCalendarUrls(
                bookingData,
                userTimezone,
                fallbackFirstEvent
            ),
        [bookingData, userTimezone, fallbackFirstEvent]
    )

    const hasApple = Boolean(bookingData?.ical_url)
    const hasAnyLink =
        hasApple ||
        calendarLinks.google ||
        calendarLinks.outlook ||
        calendarLinks.yahoo

    if (!isIcalAvailable || !hasAnyLink) {
        return null
    }

    const title =
        sectionTitle ||
        __('Add to Calendar', 'webba-booking-lite')

    return (
        <div className="wbk_add_to_calendar">
            <h4 className="wbk_add_to_calendar__title">{title}</h4>
            <div className="wbk_add_to_calendar__grid">
                {calendarLinks.google && (
                    <a
                        className="wbk_add_to_calendar__link"
                        href={calendarLinks.google}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Google Calendar"
                    >
                        <span className="wbk_add_to_calendar__icon">
                            <IconGoogle />
                        </span>
                        <span>Google</span>
                    </a>
                )}
                {calendarLinks.outlook && (
                    <a
                        className="wbk_add_to_calendar__link"
                        href={calendarLinks.outlook}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Outlook"
                    >
                        <span className="wbk_add_to_calendar__icon">
                            <IconOutlook />
                        </span>
                        <span>Outlook</span>
                    </a>
                )}
                {calendarLinks.yahoo && (
                    <a
                        className="wbk_add_to_calendar__link"
                        href={calendarLinks.yahoo}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Yahoo Calendar"
                    >
                        <span className="wbk_add_to_calendar__icon">
                            <IconYahoo />
                        </span>
                        <span>Yahoo</span>
                    </a>
                )}
                {hasApple && (
                    <a
                        className="wbk_add_to_calendar__link"
                        href={bookingData!.ical_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Apple Calendar"
                    >
                        <span className="wbk_add_to_calendar__icon">
                            <IconApple />
                        </span>
                        <span>Apple</span>
                    </a>
                )}
            </div>
        </div>
    )
}
