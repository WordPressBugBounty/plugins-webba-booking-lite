import { IStatProps } from '../../../types'
import { __ } from '@wordpress/i18n'
import './Stat.scss'

export const Stat = ({ icon, title, value }: IStatProps) => {
    return (
        <div className="wbk_stat__wrapper">
            <div className="wbk_stat__topContents">
                <h3 className="wbk_stat__title">{title}</h3>
                {icon && (
                    <div className="wbk_stat__iconWrapper">
                        <img
                            src={icon}
                            alt={__('Icon', 'webba-booking-lite')}
                        />
                    </div>
                )}
            </div>
            <div className="wbk_stat__bottomContents">{value}</div>
        </div>
    )
}
