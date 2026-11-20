import { useCallback, useState } from 'react'
import { useSrictUrlParams } from '../../hooks/useStrictUrlParam'
import { BOOKING_SCREEN_TAB_IDS, BookingScreenTabId } from './types'

const isBookingScreenTabId = (value: string): value is BookingScreenTabId =>
    (BOOKING_SCREEN_TAB_IDS as readonly string[]).includes(value)

export const useBookingScreenTab = () => {
    const { paramValue, setParamValue } = useSrictUrlParams(
        'booking_tab',
        BOOKING_SCREEN_TAB_IDS
    )

    const initialTab: BookingScreenTabId = isBookingScreenTabId(paramValue)
        ? paramValue
        : 'bookings'

    const [activeTab, setActiveTabState] =
        useState<BookingScreenTabId>(initialTab)

    const setActiveTab = useCallback(
        (tabId: BookingScreenTabId) => {
            if (tabId === activeTab) {
                return
            }

            setActiveTabState(tabId)
            setParamValue(tabId)
        },
        [activeTab, setParamValue]
    )

    return {
        activeTab,
        setActiveTab,
    }
}
