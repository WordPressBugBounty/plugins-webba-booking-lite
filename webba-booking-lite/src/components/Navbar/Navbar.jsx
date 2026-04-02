import styles from './Navbar.module.scss'
import classNames from 'classnames'
import { __ } from '@wordpress/i18n'
import logoutIcon from '../../../public/images/icon-logout.svg'
import { dispatch, useSelect } from '@wordpress/data'
import { store_name } from '../../store/frontend'
import { useCallback, useMemo, useState } from 'react'
import iconPhone from '../../../public/images/icon-phone.svg'
import iconEmail from '../../../public/images/icon-email.svg'

const Navbar = ({ setMenu, currentMenu, menuItems }) => {
    const {
        wording: { help_title, help_phone, help_email },
    } = useSelect((select) => select(store_name).getPreset())

    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
    const { setUserName } = dispatch(store_name)
    const logout = useCallback(() => {
        setUserName(null)
    }, [setUserName])

    const logoutConfirmation = useMemo(
        () => (
            <div className={styles.logoutConfirmation}>
                <div className={styles.logoutInnerWrapper}>
                    <p>
                        {__(
                            'Are you sure you want to logout?',
                            'webba-booking-lite'
                        )}
                    </p>
                    <div className={styles.logoutConfirmationButtons}>
                        <button onClick={logout}>
                            {__('Yes', 'webba-booking-lite')}
                        </button>
                        <button
                            onClick={() => setShowLogoutConfirmation(false)}
                        >
                            {__('No', 'webba-booking-lite')}
                        </button>
                    </div>
                </div>
            </div>
        ),
        [logout, setShowLogoutConfirmation]
    )

    return (
        <nav className={styles.wrapper}>
            <div className={styles.menuWrapper}>
                {menuItems.map(({ icon, slug, label }) => (
                    <div
                        key={slug}
                        onClick={() => setMenu(slug)}
                        className={classNames(styles.menuItem, {
                            [styles.active]: currentMenu === slug,
                        })}
                    >
                        <img src={icon} />
                        <span>{label}</span>
                    </div>
                ))}
                <div className={styles.logoutButtonWrapper}>
                    <div
                        className={classNames(
                            styles.menuItem,
                            styles.logoutButton
                        )}
                        onClick={() => setShowLogoutConfirmation(true)}
                    >
                        <img src={logoutIcon} />
                        <span>{__('Logout', 'webba-booking-lite')}</span>
                    </div>
                </div>
            </div>
            {(!!help_phone || !!help_email) && help_title && (
                <div className={styles.help}>
                    {!!help_title && (!!help_phone || !!help_email) && (
                        <h4 className={styles.helpTitle}>{help_title}</h4>
                    )}
                    {(!!help_phone || !!help_email) && (
                        <div className={styles.helpText}>
                            {!!help_phone && (
                                <a href={`tel:${help_phone}`} target="_blank">
                                    <img
                                        src={iconPhone}
                                        alt={__('Phone', 'webba-booking-lite')}
                                    />
                                    {help_phone}
                                </a>
                            )}
                            {!!help_email && (
                                <a
                                    href={`mailto:${help_email}`}
                                    target="_blank"
                                >
                                    <img
                                        src={iconEmail}
                                        alt={__('Email', 'webba-booking-lite')}
                                    />
                                    {help_email}
                                </a>
                            )}
                        </div>
                    )}
                </div>
            )}
            {showLogoutConfirmation && logoutConfirmation}
        </nav>
    )
}

export default Navbar
