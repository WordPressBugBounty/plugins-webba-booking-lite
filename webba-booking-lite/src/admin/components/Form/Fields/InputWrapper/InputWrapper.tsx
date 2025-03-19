import { PropsWithChildren } from 'react'
import { __, sprintf } from '@wordpress/i18n'
import { useSelect } from '@wordpress/data'
import { store_name } from '../../../../../store/backend'
import styles from './InputWrapper.module.scss'
import lockedIcon from '../../../../../../public/images/icon-lock.png'
import unlockIcon from '../../../../../../public/images/icon-lock-open.png'
import classNames from 'classnames'

export const InputWrapper = ({
    field,
    fieldConfig,
    children,
}: PropsWithChildren<any>) => {
    const { is_pro, admin_url } = useSelect(
        // @ts-ignore
        (select) => select(store_name).getPreset(),
        []
    )

    const proLabelApplicable =
        fieldConfig?.misc?.pro_version && !is_pro

    if (proLabelApplicable) {
        field.resetValidators()
    }

    return (
        <div
            className={classNames(styles.wrapper, {
                [styles.noLabel]: !proLabelApplicable,
            })}
        >
            {proLabelApplicable && (
                <div className={styles.proLabel}>
                    <a
                        className={styles.upgradeLink}
                        href={sprintf(
                            '%sadmin.php?page=wbk-main-pricing',
                            admin_url
                        )}
                    >
                        {__('Upgrade', 'webba-booking-lite')}
                        <img
                            className={styles.locked}
                            src={lockedIcon}
                            alt={__('Locked Icon', 'webba-booking-lite')}
                        />
                        <img
                            className={styles.unlock}
                            src={unlockIcon}
                            alt={__('Unlock Icon', 'webba-booking-lite')}
                        />
                    </a>
                </div>
            )}
            {children}
        </div>
    )
}
