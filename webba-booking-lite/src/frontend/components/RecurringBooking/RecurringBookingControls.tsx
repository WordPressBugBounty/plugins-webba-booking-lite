import { __ } from '@wordpress/i18n'
import { CounterInput } from './CounterInput'
import { IRecurringBookingControlsProps, RecurringRepeatInterval } from './types'
import './RecurringBookingControls.scss'

const INTERVAL_OPTIONS: Record<
    RecurringRepeatInterval,
    string
> = {
    day: 'Days',
    week: 'Weeks',
    month: 'Months',
}

export const RecurringBookingControls = ({
    intervalStep,
    repeatInterval,
    count,
    allowedIntervals,
    minCount,
    maxCount,
    disabled = false,
    onIntervalStepChange,
    onRepeatIntervalChange,
    onCountChange,
}: IRecurringBookingControlsProps) => {
    return (
        <div className="wbk_recurring_controls">
            <div className="wbk_recurring_controls__row">
                <CounterInput
                    label={__('Repeat every', 'webba-booking-lite')}
                    value={intervalStep}
                    min={1}
                    disabled={disabled}
                    onChange={onIntervalStepChange}
                />
                <div className="wbk_recurring_controls__interval">
                    <label
                        className="wbk_recurring_controls__interval-label"
                        htmlFor="wbk_recurring_interval_select"
                    >
                        {__('Interval', 'webba-booking-lite')}
                    </label>
                    <select
                        id="wbk_recurring_interval_select"
                        className="wbk_recurring_controls__interval-select"
                        value={repeatInterval}
                        disabled={disabled}
                        onChange={(e) =>
                            onRepeatIntervalChange(
                                e.target.value as RecurringRepeatInterval
                            )
                        }
                    >
                        {allowedIntervals.map((interval) => (
                            <option key={interval} value={interval}>
                                {__(
                                    INTERVAL_OPTIONS[interval],
                                    'webba-booking-lite'
                                )}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <CounterInput
                label={__(
                    'Number of time slots',
                    'webba-booking-lite'
                )}
                value={count}
                min={minCount}
                max={maxCount}
                layout="inline"
                disabled={disabled}
                onChange={onCountChange}
            />
        </div>
    )
}
