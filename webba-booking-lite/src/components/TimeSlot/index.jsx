import { select } from '@wordpress/data'
import { store_name } from '../../store/frontend'
import styles from './Timeslot.module.scss'
import className from 'classnames'

const TimeSlot = ({ data, onChange, selected }) => {
    const { appearance } = select(store_name).getPreset()

    return (
        <li>
            <label>
                <input
                    className="timeslot_radio-w"
                    type="radio"
                    name={'time'}
                    value={data.start}
                    onChange={onChange}
                    checked={selected == data.start}
                />
                <span
                    className="radio-time-block-wbk timeslot-animation-wbk"
                    style={{
                        backgroundColor:
                            data.start == selected && appearance[1],
                        borderColor:
                            data.start == selected
                                ? appearance[1]
                                : appearance[0],
                    }}
                >
                    <span
                        className="radio-checkmark"
                        style={
                            data.start == selected
                                ? { borderColor: `#ffffff` }
                                : {}
                        }
                    ></span>
                    <span
                        className={className('time-w', styles.timeText)}
                        data-server-date={data.formated_time}
                        data-local-date={data.formated_date_local}
                        data-server-time={data.formated_time}
                        data-local-time={data.formated_time_local}
                        data-start={data.start}
                        data-end={data.end}
                        data-service={null}
                    >
                        {data.formated_time}
                    </span>
                </span>
            </label>
        </li>
    )
}
export default TimeSlot
