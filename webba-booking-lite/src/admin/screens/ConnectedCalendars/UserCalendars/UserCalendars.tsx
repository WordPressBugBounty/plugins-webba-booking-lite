import './UserCalendars.scss'
import { useSelect } from '@wordpress/data'
import { store } from '../../../../store/backend'
import { useMemo } from 'react'
import { CalendarItem } from './CalendarItem'
import { Loading } from '../../../components/Loading/Loading'
import { __ } from '@wordpress/i18n'

export const UserCalendars = () => {
    const { connectedCalendars, loading } = useSelect(
        (select) => ({
            connectedCalendars: select(store).getItems('connected_calendars'),
            loading: select(store).getLoadingState('connected_calendars'),
        }),
        []
    )
    const { current_user_id, staff_members } = useSelect(
        (select) => select(store).getPreset(),
        []
    )
    const staffMemberCalendars = useMemo(() => {
        return staff_members && staff_members.find((staff: any) => Number(staff.wordpress_user) === Number(current_user_id))?.connected_calendars
    }, [staff_members, current_user_id])

    const myCalendars = useMemo(() => {
        return (connectedCalendars || []).filter((calendar: any) => {
            return Number(calendar.user_id) === Number(current_user_id) || staffMemberCalendars?.includes(Number(calendar.id))
        })
    }, [connectedCalendars, current_user_id])

    if (loading) {
        return <Loading minHeight="100%" transparent />
    }

    return (
        <div className="wbk_userCalendars__wrapper">
            {myCalendars.map((calendar: any) => (
                <CalendarItem calendar={calendar} key={calendar.id} />
            ))}
            {
                myCalendars.length === 0 && (
                    <div className="wbk_userCalendars__message">
                        <h3 className="wbk_userCalendars__title">
                            {__('No calendars found', 'webba-booking-lite')}
                        </h3>
                    </div>
                )
            }
        </div>
    )
}
