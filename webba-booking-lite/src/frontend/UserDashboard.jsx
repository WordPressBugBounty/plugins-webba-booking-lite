import React, { act, useState } from 'react'
import './assets/frontend.scss'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import Navbar from '../components/Navbar'
import LoginForm from '../components/LoginForm/'
import ItemBlock from '../components/ItemBlock/'
import ServiceCalendar from '../components/ServiceCalendar/'
import TimeSlot from '../components/TimeSlot'
import Button from '../components/Button/'
import { CustomScroll } from 'react-custom-scroll'
import { store_name } from '../store/frontend'
import { useSelect, dispatch, select } from '@wordpress/data'
import { useEffect } from '@wordpress/element'

const UserDashboard = () => {
    const [tab, setTab] = useState({ name: 'future_bookings', details: null })
    const [timeSlotsLoading, setTimeSlotsLoading] = useState(false)
    const [isFutureBookingsLoading, setIsFutureBookingsLoading] =
        useState(false)
    const [isPastBookingsLoading, setIsPastBookingsLoading] = useState(false)

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

    const {
        setUserName,
        setFormData,
        fetchTimeSlots,
        updateBooking,
        deleteBooking,
    } = dispatch(store_name)

    const handleSuccessLogin = (response) => {
        // to do: replace with real booking name
        setUserName('abcd')
    }

    const handleBookingAction = (event, action, id, service_id) => {
        event.preventDefault()
        switch (action) {
            case 'reschedule':
                setFormData('booking', id)
                setFormData('services', [service_id])
                setTab({ name: 'reschedule', details: id })
                break
            case 'cancel':
                setFormData('booking', id)
                deleteBooking()
                break
        }
    }

    const handleReschedule = async (event) => {
        await updateBooking()
        setTab({ name: 'future_bookings' })
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

    const handleTimeSelect = (event) => {
        setFormData('time', event.target.value)
    }

    return (
        <div className="main-block-wbk">
            <div
                className={
                    preset?.settings?.narrow_form
                        ? 'appointment-box-wbk narrow-form-wbk'
                        : 'appointment-box-wbk' +
                          (!preset.user ? ' justify-content-center-wbk' : '')
                }
            >
                {Object.keys(preset).length === 0 ? (
                    <Skeleton />
                ) : !preset.user ? (
                    <LoginForm onSuccess={handleSuccessLogin} />
                ) : (
                    <>
                        <div
                            className="appointment-status-wrapper-wbk"
                            style={{ backgroundColor: preset?.appearance[0] }}
                        >
                            <Navbar setTab={setTab} />
                        </div>

                        <div className="appointment-content-wbk">
                            {(() => {
                                switch (tab.name) {
                                    case 'future_bookings':
                                        return (
                                            <CustomScroll
                                                heightRelativeToParent={`640px`}
                                            >
                                                <ul className="items-list-wbk">
                                                    {isFutureBookingsLoading && (
                                                        <Skeleton
                                                            count={4}
                                                            height={`160px`}
                                                            borderRadius={`10px`}
                                                        />
                                                    )}
                                                    {!isFutureBookingsLoading &&
                                                    futureBookings &&
                                                    futureBookings.length > 0
                                                        ? futureBookings.map(
                                                              (
                                                                  value,
                                                                  index
                                                              ) => (
                                                                  <ItemBlock
                                                                      data={
                                                                          value
                                                                      }
                                                                      selected={
                                                                          false
                                                                      }
                                                                      type={
                                                                          'booking'
                                                                      }
                                                                      key={
                                                                          index
                                                                      }
                                                                      key={
                                                                          value.id
                                                                      }
                                                                      handleAction={
                                                                          handleBookingAction
                                                                      }
                                                                  />
                                                              )
                                                          )
                                                        : !isFutureBookingsLoading &&
                                                          preset.wording
                                                              .no_booking}
                                                </ul>
                                            </CustomScroll>
                                        )

                                    case 'reschedule':
                                        return (
                                            <>
                                                <ServiceCalendar
                                                    onChange={handleSetDate}
                                                />
                                                {timeSlotsLoading ? (
                                                    <div className="mt-50-wbk">
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
                                                    <div className="mt-50-wbk">
                                                        <CustomScroll
                                                            heightRelativeToParent={`205px`}
                                                        >
                                                            <ul className="timeslots-list-wbk">
                                                                {dynamicAttributes.timeSlots.map(
                                                                    (
                                                                        value,
                                                                        index
                                                                    ) => (
                                                                        <TimeSlot
                                                                            key={
                                                                                index
                                                                            }
                                                                            data={
                                                                                value
                                                                            }
                                                                            onChange={
                                                                                handleTimeSelect
                                                                            }
                                                                            selected={
                                                                                formData.time
                                                                            }
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
                                                <div className="button-holder-wbk">
                                                    {formData.time && (
                                                        <Button
                                                            onClick={
                                                                handleReschedule
                                                            }
                                                            label={
                                                                preset.wording
                                                                    .reschedule
                                                            }
                                                            loadingLabel={
                                                                preset.wording
                                                                    .loading
                                                            }
                                                            disabled={false}
                                                            style={{
                                                                backgroundColor:
                                                                    preset
                                                                        ?.appearance[1],
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </>
                                        )
                                    case 'booking_history':
                                        return (
                                            <CustomScroll
                                                heightRelativeToParent={`640px`}
                                            >
                                                <ul className="items-list-wbk">
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
                                                              (
                                                                  value,
                                                                  index
                                                              ) => (
                                                                  <ItemBlock
                                                                      data={
                                                                          value
                                                                      }
                                                                      selected={
                                                                          false
                                                                      }
                                                                      type={
                                                                          'past-booking'
                                                                      }
                                                                      index={
                                                                          index
                                                                      }
                                                                      key={
                                                                          value.id
                                                                      }
                                                                      handleAction={
                                                                          handleBookingAction
                                                                      }
                                                                  />
                                                              )
                                                          )
                                                        : !isPastBookingsLoading &&
                                                          preset.wording
                                                              .no_booking}
                                                </ul>
                                            </CustomScroll>
                                        )
                                        break
                                    default:
                                        return <div></div>
                                }
                            })()}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default UserDashboard
