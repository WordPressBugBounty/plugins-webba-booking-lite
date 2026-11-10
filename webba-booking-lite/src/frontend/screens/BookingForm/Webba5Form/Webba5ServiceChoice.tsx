import { __ } from '@wordpress/i18n'
import { useWording } from '../../../hooks/useWording'
import { IUnitAttendees } from '../../../components/Services/types'
import { Webba5ServiceCard } from './Webba5ServiceCard'
import { Webba5Counter } from './Webba5Counter'
import { IWebba5ServiceChoiceProps } from './types'

const getTotalAttendees = (attendees: IUnitAttendees) =>
    attendees.adult + attendees.child + attendees.infant

export const Webba5ServiceChoice = ({
    item,
    bookingMode,
    priceLabel,
    durationLabel,
    onSelect,
}: IWebba5ServiceChoiceProps) => {
    const wording = useWording()
    const minQuantity = Math.max(1, Number(item.min_quantity) || 1)
    const maxQuantity = Math.max(minQuantity, Number(item.max_quantity) || 1)
    const quantity = Math.min(
        maxQuantity,
        Math.max(minQuantity, Number(item.quantity) || minQuantity)
    )
    const capacity = Math.max(1, Number(item.capacity) || 1)
    const unitQuantity = Math.min(
        capacity,
        Math.max(1, Number(item.quantity) || 1)
    )
    const attendeeRows = {
        adult: item.attendee_type_adult === 'yes',
        child: item.attendee_type_child === 'yes',
        infant: item.attendee_type_infant === 'yes',
    }
    const showAttendees =
        bookingMode === 'units' &&
        (attendeeRows.adult || attendeeRows.child || attendeeRows.infant)
    const attendees = item.attendees || {
        adult: attendeeRows.adult ? 1 : 0,
        child: 0,
        infant: 0,
    }

    const updateQuantity = (nextQuantity: number) => {
        const limit = bookingMode === 'units' ? capacity : maxQuantity
        const minimum = bookingMode === 'units' ? 1 : minQuantity
        item.onUpdate({
            quantity: Math.min(limit, Math.max(minimum, nextQuantity)),
        })
    }

    const updateAttendees = (
        fieldName: keyof IUnitAttendees,
        delta: number
    ) => {
        const nextAttendees = {
            ...attendees,
            [fieldName]: Math.max(0, (attendees[fieldName] || 0) + delta),
        }
        if (getTotalAttendees(nextAttendees) > capacity) {
            return
        }
        item.onUpdate({ attendees: nextAttendees })
    }

    return (
        <Webba5ServiceCard
            label={item.label}
            meta={bookingMode === 'services' ? durationLabel : ''}
            priceLabel={priceLabel}
            description={item.description}
            selected={!!item.selected}
            onSelect={onSelect}
        >
            {bookingMode === 'services' && maxQuantity > minQuantity && (
                <label className="wbk_webba5_form__quantity">
                    <span>{__('Quantity', 'webba-booking-lite')}</span>
                    <select
                        value={quantity}
                        onChange={(event) =>
                            updateQuantity(Number(event.target.value))
                        }
                    >
                        {Array.from(
                            { length: maxQuantity - minQuantity + 1 },
                            (_, index) => minQuantity + index
                        ).map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </label>
            )}
            {bookingMode === 'units' && !showAttendees && capacity > 1 && (
                <Webba5Counter
                    label={__('Quantity', 'webba-booking-lite')}
                    value={unitQuantity}
                    onDecrease={() => updateQuantity(unitQuantity - 1)}
                    onIncrease={() => updateQuantity(unitQuantity + 1)}
                />
            )}
            {showAttendees && attendeeRows.adult && (
                <Webba5Counter
                    label={
                        wording.unit_adult || __('Adult', 'webba-booking-lite')
                    }
                    value={attendees.adult}
                    onDecrease={() => updateAttendees('adult', -1)}
                    onIncrease={() => updateAttendees('adult', 1)}
                />
            )}
            {showAttendees && attendeeRows.child && (
                <Webba5Counter
                    label={
                        wording.unit_child || __('Child', 'webba-booking-lite')
                    }
                    value={attendees.child}
                    onDecrease={() => updateAttendees('child', -1)}
                    onIncrease={() => updateAttendees('child', 1)}
                />
            )}
            {showAttendees && attendeeRows.infant && (
                <Webba5Counter
                    label={
                        wording.unit_infant ||
                        __('Infant', 'webba-booking-lite')
                    }
                    value={attendees.infant}
                    onDecrease={() => updateAttendees('infant', -1)}
                    onIncrease={() => updateAttendees('infant', 1)}
                />
            )}
            {showAttendees && capacity > 1 && (
                <p className="wbk_webba5_form__capacity">
                    {wording.unit_max_attendees ||
                        __('Max attendees', 'webba-booking-lite')}
                    : {capacity} ({getTotalAttendees(attendees)})
                </p>
            )}
        </Webba5ServiceCard>
    )
}
