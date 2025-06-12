import { IStatProps } from '../../../types'
import { __ } from '@wordpress/i18n'
import styles from './Stat.module.scss'

export const Stat = ({ icon, title, value }: IStatProps) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.topContents}>
                <h3 className={styles.title}>{title}</h3>
                {icon && (
                    <div className={styles.iconWrapper}>
                        <img
                            src={icon}
                            alt={__('Icon', 'webba-booking-lite')}
                        />
                    </div>
                )}
            </div>
            <div className={styles.bottomContents}>{value}</div>
        </div>
    )
}
