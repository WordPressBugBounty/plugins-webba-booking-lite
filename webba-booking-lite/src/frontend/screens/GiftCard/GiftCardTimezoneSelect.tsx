import Select from 'react-select'
import { useSelect } from '@wordpress/data'
import { __ } from '@wordpress/i18n'
import { store_name } from '../../../store/frontend'
import { GiftCardTimezoneSelectProps } from './types'
import '../BookingForm/steps/Steps.scss'

export const GiftCardTimezoneSelect = ({
    value,
    onChange,
}: GiftCardTimezoneSelectProps) => {
    const timezoneData = useSelect(
        (select: any) => select(store_name).getTimezoneData(),
        []
    )
    const options = (timezoneData?.timezones || []).map((zone: string) => ({
        label: zone,
        value: zone,
    }))
    const selected =
        options.find((option: { value: string }) => option.value === value) ||
        (value ? { label: value, value } : null)

    return (
        <div className="wbk_gift_card__schedule-field wbk_gift_card__schedule-timezone">
            <label className="wbk_input__label" htmlFor="wbk_gift_card_timezone">
                {__('Time zone', 'webba-booking-lite')}
            </label>
            <Select
                inputId="wbk_gift_card_timezone"
                options={options}
                value={selected}
                onChange={(option: { value: string } | null) => {
                    if (option?.value) {
                        onChange(option.value)
                    }
                }}
                className="wbk_timezone_selector"
                classNamePrefix="wbk_timezone_selector"
                placeholder={__('Select a time zone', 'webba-booking-lite')}
                isClearable={false}
                unstyled
            />
        </div>
    )
}
