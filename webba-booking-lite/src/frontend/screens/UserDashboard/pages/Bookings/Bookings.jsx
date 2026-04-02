import { useCallback, useEffect, useMemo, useState } from 'react'
import { __ } from '@wordpress/i18n'
import Skeleton from 'react-loading-skeleton'
import { CustomScroll } from 'react-custom-scroll'
import styles from './Bookings.module.scss'
import { Button } from '../../../../components/Button/Button'
import ItemBlock from '../../../../../components/ItemBlock/ItemBlock'
import ServiceCalendar from '../../../../../components/ServiceCalendar'
import TimeSlot from '../../../../../components/TimeSlot'
import { dispatch, useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/frontend'
import classNames from 'classnames'
import { BookingForm } from '../../../BookingForm/BookingForm'
import { BookingFormProvider } from '../../../../providers/BookingFormProvider/BookingFormProvider'
const { render } = wp.element
import { toast, ToastContainer } from 'react-toastify'

export const Bookings = () => {
    const [tab, setTab] = useState('upcoming')

    const {
        preset,
        futureBookings,
        pastBookings,
        formData,
        dynamicAttributes,
    } = useSelect(
        (select) => {
            const currentPreset = select(store_name).getPreset()
            return {
                preset: currentPreset,
                futureBookings:
                    currentPreset && currentPreset.user
                        ? select(store_name).getUserFutureBookings()
                        : null,
                pastBookings:
                    currentPreset && currentPreset.user
                        ? select(store_name).getUserPastBookings()
                        : null,
                formData: select(store_name).getFormData(),
                dynamicAttributes: select(store_name).getDynamicAttributes(),
            }
        },
        [store_name]
    )
    const { wording } = preset?.wording || {}

    const tabs = useMemo(
        () => [
            {
                slug: 'upcoming',
                label: wording?.label_upcoming_bookings_title || __('Upcoming', 'webba-booking-lite'),
            },
            {
                slug: 'past',
                label: wording?.label_past_bookings_title || __('Past', 'webba-booking-lite'),
            },
        ],
        [wording]
    )

    const {
        setUserName,
        setFormData,
        fetchTimeSlots,
        updateBooking,
        deleteBooking,
    } = dispatch(store_name)

    const [timeSlotsLoading, setTimeSlotsLoading] = useState(false)
    const [isFutureBookingsLoading, setIsFutureBookingsLoading] =
        useState(false)
    const [isPastBookingsLoading, setIsPastBookingsLoading] = useState(false)

    useEffect(() => {
        if (!futureBookings) {
            setIsFutureBookingsLoading(true)
        } else {
            setIsFutureBookingsLoading(false)
        }

        if (!pastBookings) {
            setIsPastBookingsLoading(true)
        } else {
            setIsPastBookingsLoading(false)
        }
    }, [futureBookings, pastBookings])

    const handleBookingAction = async (event, action, id, service_id) => {
        event.preventDefault()
        switch (action) {
            case 'reschedule':
                setFormData('booking', id)
                setFormData('services', [service_id])
                setRescheduling(true)
                break
            case 'cancel':
                setFormData('booking', id)
                try {
                    const response = await deleteBooking()

                    return response
                } catch (error) {
                    toast.error(error?.description)
                }

                break
        }
    }

    const handleReschedule = async (event) => {
        await updateBooking()
        setTab('upcoming')
        setRescheduling(false)
    }

    const handleSetDate = async (value, event) => {
        var timeZoneOffsetInMinutes = new Date().getTimezoneOffset()
        setFormData('time', null)
        setFormData('offset', timeZoneOffsetInMinutes)
        setFormData('date', value)
        setTimeSlotsLoading(true)
        await fetchTimeSlots()
        setTimeSlotsLoading(false)
    }
    const [rescheduling, setRescheduling] = useState(false)

    const handleTimeSelect = (event) => {
        setFormData('time', event.target.value)
    }
    const renderBookingForm = useCallback(() => {
        render(
            <BookingFormProvider attrService={'0'} attrCategory={'0'}>
                <BookingForm />
            </BookingFormProvider>,
            document.getElementById('wbk_user_dashboard')
        )
    }, [])

    return (
        <>
            <div className={styles.wrapper}>
                {!rescheduling && (
                    <>
                        <div className={styles.header}>
                            <div className={styles.headerLeft}>
                                <h2>
                                    {__('My Bookings', 'webba-booking-lite')}
                                </h2>
                                <p>
                                    { wording?.label_manage_appointments_title || __(
                                        'Manage your appointments and reservations',
                                        'webba-booking-lite'
                                    )}
                                </p>
                            </div>
                            <Button
                                onClick={renderBookingForm}
                                classes={styles.headerAddButton}
                            >
                                { wording?.label_new_booking_title || __('+ New Booking', 'webba-booking-lite')}
                            </Button>
                        </div>
                        <div className={styles.tabWrapper}>
                            <div className={styles.tabHeader}>
                                {tabs.map(({ slug, label }) => (
                                    <div
                                        key={slug}
                                        onClick={() => setTab(slug)}
                                        className={classNames(styles.tabIndex, {
                                            [styles.active]: tab === slug,
                                        })}
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>
                            <div className={styles.tabBody}>
                                <CustomScroll heightRelativeToParent={'434px'}>
                                    {tab === 'upcoming' && (
                                        <ul className={styles.itemsWrapper}>
                                            {isFutureBookingsLoading && (
                                                <Skeleton
                                                    count={4}
                                                    height={`134px`}
                                                    borderRadius={`10px`}
                                                />
                                            )}
                                            {!isFutureBookingsLoading &&
                                                futureBookings &&
                                                futureBookings.length > 0
                                                ? futureBookings.map(
                                                    (value, index) => (
                                                        <ItemBlock
                                                            data={value}
                                                            selected={false}
                                                            type={'booking'}
                                                            key={value.id}
                                                            handleAction={
                                                                handleBookingAction
                                                            }
                                                        />
                                                    )
                                                )
                                                : !isFutureBookingsLoading &&
                                                preset.wording.no_booking}
                                        </ul>
                                    )}

                                    {tab === 'past' && (
                                        <ul className={styles.itemsWrapper}>
                                            {isPastBookingsLoading && (
                                                <Skeleton
                                                    count={4}
                                                    height={`130px`}
                                                    borderRadius={`10px`}
                                                />
                                            )}
                                            {!isPastBookingsLoading &&
                                                pastBookings &&
                                                pastBookings.length > 0
                                                ? pastBookings.map(
                                                    (value, index) => (
                                                        <ItemBlock
                                                            data={value}
                                                            selected={false}
                                                            type={
                                                                'past-booking'
                                                            }
                                                            index={index}
                                                            key={value.id}
                                                            handleAction={
                                                                handleBookingAction
                                                            }
                                                        />
                                                    )
                                                )
                                                : !isPastBookingsLoading &&
                                                preset.wording.no_booking}
                                        </ul>
                                    )}
                                </CustomScroll>
                            </div>
                        </div>
                    </>
                )}
                {rescheduling && (
                    <div className={styles.reschedulePanel}>
                        <ServiceCalendar onChange={handleSetDate} />
                        {timeSlotsLoading ? (
                            <div className="mt-10-wbk">
                                <Skeleton
                                    count={8}
                                    inline={true}
                                    width={`calc(25% - 10px)`}
                                    height={`50px`}
                                    style={{
                                        marginRight: `10px`,
                                    }}
                                    borderRadius={`10px`}
                                />
                            </div>
                        ) : dynamicAttributes.timeSlots ? (
                            <div className="mt-10-wbk">
                                <CustomScroll heightRelativeToParent={`205px`}>
                                    <ul className="timeslots-list-wbk">
                                        {dynamicAttributes.timeSlots.map(
                                            (value, index) => (
                                                <TimeSlot
                                                    key={index}
                                                    data={value}
                                                    onChange={handleTimeSelect}
                                                    selected={formData.time}
                                                    style={{
                                                        backgroundColor:
                                                            preset
                                                                ?.appearance[1],
                                                    }}
                                                />
                                            )
                                        )}
                                    </ul>
                                </CustomScroll>
                            </div>
                        ) : null}
                        <div className="button-holder-wbk"></div>
                        <div className={styles.rescheduleFooter}>
                            <Button
                                type={'error'}
                                className={styles.cancelRescheduleButton}
                                onClick={() => setRescheduling(false)}
                            >
                                {__('Cancel', 'webba-booking-lite')}
                            </Button>
                            {formData.time && (
                                <Button
                                    onClick={handleReschedule}
                                    title={preset.wording.reschedule}
                                    // loadingLabel={preset.wording.loading}
                                    disabled={false}
                                    style={{
                                        backgroundColor: preset?.appearance[1],
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer className={styles.toast} limit={1} />
        </>
    )
}
