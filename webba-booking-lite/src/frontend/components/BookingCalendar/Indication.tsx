import { IIndicationProps } from './types'
import classNames from 'classnames'

export const Indication = ({
    label,
    color,
    borderColor,
    className,
}: IIndicationProps) => {
    return (
        <div
            className={classNames(
                'wbk_booking_calendar__indication',
                className
            )}
        >
            <div
                className={'wbk_booking_calendar__indication-dot'}
                style={{
                    backgroundColor: color,
                    borderColor: borderColor || color,
                }}
            ></div>
            <span>{label}</span>
        </div>
    )
}
