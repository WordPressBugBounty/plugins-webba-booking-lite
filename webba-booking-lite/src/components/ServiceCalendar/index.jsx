import React, { useState } from 'react'
import Calendar from 'react-calendar'
import { store_name } from '../../store/frontend'
import { select, useSelect } from '@wordpress/data'
import 'react-calendar/dist/Calendar.css'

const ServiceCalendar = ({ onChange }) => {
    const formData = select(store_name).getFormData()
    const { settings } = select(store_name).getPreset()
    const { services } = select(store_name).getPreset()

    const service = services.find(
        (service) => service.id == formData.services[0]
    )
    const daysOfWeekToDisable = Object.values(service.business_days).map(Number)
    const tileDisabled = ({ date }) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (date < today) {
            return true
        }
        if (!daysOfWeekToDisable.includes(date.getDay())) {
            return true
        }
        return false
    }

    return (
        <>
            {formData && (
                <Calendar
                    calendarType={
                        settings.week_start == 1 ? 'iso8601' : 'gregory'
                    }
                    onChange={onChange}
                    value={formData.date}
                    tileDisabled={tileDisabled}
                />
            )}
        </>
    )
}
export default ServiceCalendar
