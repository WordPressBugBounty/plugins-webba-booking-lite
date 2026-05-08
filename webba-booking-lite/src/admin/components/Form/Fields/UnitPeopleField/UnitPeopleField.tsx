import { useEffect, useMemo } from 'react'
import { useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { store_name } from '../../../../../store/backend'
import { useForm } from '../../lib/FormProvider'
import { useField } from '../../lib/hooks/useField'
import { FormComponentConstructor } from '../../lib/types'
import { FormFieldProps } from '../../types'
import { getFormState } from '../../lib/utils'
import { Label } from '../Label/Label'
import { fetchConnectedOptions, isConnectedField } from '../GenericSelectField/utils'
import './UnitPeopleField.scss'

type AttendeeCounts = {
    adult: number
    child: number
    infant: number
}

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value))

const toNumber = (value: unknown, fallback = 0) => {
    const numericValue = Number(value)
    return Number.isFinite(numericValue) ? numericValue : fallback
}

const parseAttendeeValue = (rawValue: unknown): AttendeeCounts | null => {
    if (rawValue === null || rawValue === undefined || rawValue === '') {
        return null
    }

    if (typeof rawValue === 'object') {
        const valueObject = rawValue as Record<string, unknown>
        return {
            adult: Math.max(0, toNumber(valueObject.adult)),
            child: Math.max(0, toNumber(valueObject.child)),
            infant: Math.max(0, toNumber(valueObject.infant)),
        }
    }

    if (typeof rawValue === 'string') {
        const trimmedValue = rawValue.trim()
        if (!trimmedValue) {
            return null
        }

        try {
            const parsedValue = JSON.parse(trimmedValue)
            if (parsedValue && typeof parsedValue === 'object') {
                const valueObject = parsedValue as Record<string, unknown>
                return {
                    adult: Math.max(0, toNumber(valueObject.adult)),
                    child: Math.max(0, toNumber(valueObject.child)),
                    infant: Math.max(0, toNumber(valueObject.infant)),
                }
            }
        } catch {
            return null
        }
    }

    return null
}

const getTotalAttendees = (attendees: AttendeeCounts) =>
    attendees.adult + attendees.child + attendees.infant

export const createUnitPeopleField: FormComponentConstructor<any> = ({
    field,
    fieldConfig,
}) => {
    return ({ name, label, misc }: FormFieldProps) => {
        const { value, setValue, errors } = useField(field)
        const form = useForm()
        const { value: selectedUnitFieldValue } = useField(
            form.fields.unit_id as any
        )
        const selectedUnitId = toNumber(selectedUnitFieldValue ?? 0)

        const units = useSelect(
            // @ts-ignore
            (select) => select(store_name).getItems('units'),
            []
        ) as Record<string, unknown>[]

        const selectedUnit = useMemo(
            () =>
                Array.isArray(units)
                    ? units.find((unit) => toNumber(unit.id) === selectedUnitId)
                    : null,
            [units, selectedUnitId]
        )

        const unitCapacity = Math.max(
            1,
            toNumber(selectedUnit?.capacity ?? selectedUnit?.unit_capacity ?? 1, 1)
        )

        const attendeeTypeEnabled = {
            adult:
                (selectedUnit?.attendee_type_adult ??
                    selectedUnit?.unit_attendee_type_adult) === 'yes',
            child:
                (selectedUnit?.attendee_type_child ??
                    selectedUnit?.unit_attendee_type_child) === 'yes',
            infant:
                (selectedUnit?.attendee_type_infant ??
                    selectedUnit?.unit_attendee_type_infant) === 'yes',
        }

        const hasAttendeeBreakdown =
            attendeeTypeEnabled.adult ||
            attendeeTypeEnabled.child ||
            attendeeTypeEnabled.infant

        const parsedCounts = parseAttendeeValue(value)
        const attendeeCounts: AttendeeCounts = {
            adult: attendeeTypeEnabled.adult ? parsedCounts?.adult ?? 1 : 0,
            child: attendeeTypeEnabled.child ? parsedCounts?.child ?? 0 : 0,
            infant: attendeeTypeEnabled.infant ? parsedCounts?.infant ?? 0 : 0,
        }

        const currentQuantity = clamp(toNumber(value, 1), 1, unitCapacity)

        const updateFieldValue = (nextValue: string) => {
            setValue(nextValue)

            const modelName = String(fieldConfig?.modelName || '')
            if (!modelName || !isConnectedField(modelName, name)) {
                return
            }

            const currentValues = getFormState(form).values as Record<string, string>
            fetchConnectedOptions(modelName, name, {
                ...currentValues,
                [name]: nextValue,
                id: form.defaultValue?.id,
            })
        }

        useEffect(() => {
            if (selectedUnitId <= 0) {
                return
            }

            if (hasAttendeeBreakdown) {
                if (parseAttendeeValue(value)) {
                    return
                }

                const defaultCounts: AttendeeCounts = {
                    adult: attendeeTypeEnabled.adult ? 1 : 0,
                    child: 0,
                    infant: 0,
                }

                if (getTotalAttendees(defaultCounts) === 0) {
                    if (attendeeTypeEnabled.child) {
                        defaultCounts.child = 1
                    } else if (attendeeTypeEnabled.infant) {
                        defaultCounts.infant = 1
                    }
                }

                updateFieldValue(JSON.stringify(defaultCounts))
                return
            }

            if (!value || Number(value) <= 0) {
                updateFieldValue('1')
            }
        }, [
            selectedUnitId,
            hasAttendeeBreakdown,
            attendeeTypeEnabled.adult,
            attendeeTypeEnabled.child,
            attendeeTypeEnabled.infant,
            value,
            updateFieldValue,
        ])

        const setAttendeeCount = (attendeeType: keyof AttendeeCounts, delta: number) => {
            const updatedCounts = {
                ...attendeeCounts,
                [attendeeType]: Math.max(0, attendeeCounts[attendeeType] + delta),
            }

            if (getTotalAttendees(updatedCounts) > unitCapacity) {
                return
            }

            updateFieldValue(JSON.stringify(updatedCounts))
        }

        const setQuantity = (delta: number) => {
            const updatedQuantity = clamp(currentQuantity + delta, 1, unitCapacity)
            updateFieldValue(String(updatedQuantity))
        }

        const displayedCount = hasAttendeeBreakdown
            ? getTotalAttendees(attendeeCounts)
            : currentQuantity

        return (
            <div className="wbk_unitPeopleField">
                <Label title={label} id={name} tooltip={misc?.tooltip} />

                {!hasAttendeeBreakdown && (
                    <div className="wbk_unitPeopleField__row">
                        <span className="wbk_unitPeopleField__label">
                            {__('Quantity', 'webba-booking-lite')}
                        </span>
                        <div className="wbk_unitPeopleField__counter">
                            <button
                                type="button"
                                className="wbk_unitPeopleField__button"
                                onClick={() => setQuantity(-1)}
                            >
                                -
                            </button>
                            <input
                                className="wbk_unitPeopleField__value"
                                value={currentQuantity}
                                readOnly
                            />
                            <button
                                type="button"
                                className="wbk_unitPeopleField__button"
                                onClick={() => setQuantity(1)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}

                {hasAttendeeBreakdown && attendeeTypeEnabled.adult && (
                    <div className="wbk_unitPeopleField__row">
                        <span className="wbk_unitPeopleField__label">
                            {__('Adult', 'webba-booking-lite')}
                        </span>
                        <div className="wbk_unitPeopleField__counter">
                            <button
                                type="button"
                                className="wbk_unitPeopleField__button"
                                onClick={() => setAttendeeCount('adult', -1)}
                            >
                                -
                            </button>
                            <input
                                className="wbk_unitPeopleField__value"
                                value={attendeeCounts.adult}
                                readOnly
                            />
                            <button
                                type="button"
                                className="wbk_unitPeopleField__button"
                                onClick={() => setAttendeeCount('adult', 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}

                {hasAttendeeBreakdown && attendeeTypeEnabled.child && (
                    <div className="wbk_unitPeopleField__row">
                        <span className="wbk_unitPeopleField__label">
                            {__('Child', 'webba-booking-lite')}
                        </span>
                        <div className="wbk_unitPeopleField__counter">
                            <button
                                type="button"
                                className="wbk_unitPeopleField__button"
                                onClick={() => setAttendeeCount('child', -1)}
                            >
                                -
                            </button>
                            <input
                                className="wbk_unitPeopleField__value"
                                value={attendeeCounts.child}
                                readOnly
                            />
                            <button
                                type="button"
                                className="wbk_unitPeopleField__button"
                                onClick={() => setAttendeeCount('child', 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}

                {hasAttendeeBreakdown && attendeeTypeEnabled.infant && (
                    <div className="wbk_unitPeopleField__row">
                        <span className="wbk_unitPeopleField__label">
                            {__('Infant', 'webba-booking-lite')}
                        </span>
                        <div className="wbk_unitPeopleField__counter">
                            <button
                                type="button"
                                className="wbk_unitPeopleField__button"
                                onClick={() => setAttendeeCount('infant', -1)}
                            >
                                -
                            </button>
                            <input
                                className="wbk_unitPeopleField__value"
                                value={attendeeCounts.infant}
                                readOnly
                            />
                            <button
                                type="button"
                                className="wbk_unitPeopleField__button"
                                onClick={() => setAttendeeCount('infant', 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}

                <div className="wbk_unitPeopleField__capacity">
                    {__('Max attendees', 'webba-booking-lite')}: {unitCapacity} ({displayedCount})
                </div>

                {errors && errors.length > 0 && (
                    <div className="wbk_unitPeopleField__error">{errors[0]}</div>
                )}
            </div>
        )
    }
}
