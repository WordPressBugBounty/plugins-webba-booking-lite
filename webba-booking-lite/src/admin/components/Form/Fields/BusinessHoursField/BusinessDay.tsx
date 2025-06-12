import { useSelect } from '@wordpress/data'
import { useCallback, useMemo } from '@wordpress/element'
import ReactSlider from 'react-slider'
import { store_name } from '../../../../../store'
import { UnwrappedField } from '../../lib/types'
import { daysOfWeek, getReadableTime } from '../../utils/dateTime'
import { Toggle } from '../Toggle/Toggle'
import styles from './BusinessHours.module.scss'
import { BusinessDay as BusinessDayType } from './types'
import closeIcon2 from '../../../../../../public/images/close-icon2.png'

interface BusinessDayProps {
    index: number
    field: UnwrappedField<BusinessDayType[] | string>
}

export const BusinessDay = ({
    index,
    field: { value, setValue },
}: BusinessDayProps) => {
    const valueObj: BusinessDayType[] = useMemo(() => {
        try{
            return JSON.parse(value as string)
        }catch(e){
            return value
        }
    }, [value])

    const { start, end, day_of_week, status } = valueObj[index]

    const setRange = useCallback(([start, end]: [number, number]) => {
        let oldVal = [...valueObj]

        oldVal[index] = {
            ...oldVal[index],
            start,
            end,
        }

        setValue(oldVal)
    }, [valueObj])

    const setDay = useCallback((day: string) => {
        let oldVal = [...valueObj]

        oldVal[index] = {
            ...oldVal[index],
            day_of_week: day,
        }

        setValue(oldVal)
    }, [valueObj])

    const setStatus = useCallback((status: string) => {
        let oldVal = [...valueObj]

        oldVal[index] = {
            ...oldVal[index],
            status,
        }

        setValue(oldVal)
    }, [valueObj])

    const removeDay = useCallback(() => {
        let oldVal = [...valueObj]

        oldVal.splice(index, 1)

        setValue(oldVal)
    }, [valueObj])

    const { time_format } = useSelect((select) => {
        // @ts-ignore
        const { settings } = select(store_name).getPreset()

        if (!settings?.time_format) {
            return {
                time_format: 'g:i a',
            }
        }

        return settings
    }, [])

    const readableTime = useMemo(
        () => ({
            start: getReadableTime(start as number, time_format),
            end: getReadableTime(end as number, time_format),
        }),
        [start, end, time_format]
    )

    return (
        <div className={styles.businessDay}>
            <select
                value={day_of_week}
                onChange={(e: any) => setDay(e.target.value)}
                disabled={status === 'inactive'}
                className={styles.select}
            >
                {Object.keys(daysOfWeek).map((key) => (
                    <option value={key}>{daysOfWeek[key]}</option>
                ))}
            </select>
            <div className={styles.sliderWrapper}>
                <p className={styles.readableTime}>
                    {readableTime.start} -{readableTime.end}
                </p>
                <ReactSlider
                    className={styles.slider}
                    thumbClassName={styles.thumb}
                    trackClassName={styles.track}
                    min={0}
                    max={86400}
                    step={300}
                    defaultValue={[Number(start), Number(end)]}
                    onChange={setRange}
                    disabled={status === 'inactive'}
                />
            </div>
            <Toggle
                initialValue={status || 'inactive'}
                valueOn="active"
                valueOff="inactive"
                onChange={setStatus}
            />
            <div className={styles.buttonClose} onClick={removeDay}>
                <img src={closeIcon2} />
            </div>
        </div>
    )
}
