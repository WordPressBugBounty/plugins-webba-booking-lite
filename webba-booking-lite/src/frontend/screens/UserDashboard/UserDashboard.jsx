import { useCallback, useMemo, useState } from 'react'
import '../../assets/frontend.scss'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import Navbar from '../../../components/Navbar/Navbar'
import LoginForm from '../../../components/LoginForm/LoginForm'
import { store_name } from '../../../store/frontend'
import { useSelect, dispatch } from '@wordpress/data'
import styles from './UserDashboard.module.scss'
import classNames from 'classnames'
import { __ } from '@wordpress/i18n'
import iconBookings from '../../../../public/images/icon-calendar.svg'
import { Bookings } from './pages/Bookings/Bookings'
import { Button } from '../../components/Button/Button'
import { BookingFormProvider } from '../../providers/BookingFormProvider/BookingFormProvider'
import { BookingForm } from '../BookingForm/BookingForm'
const { render } = wp.element

export const UserDashboard = () => {
    const [menu, setMenu] = useState('my-bookings')
    const [menuExpanded, setMenuExpanded] = useState(window.innerWidth > 768)

    const preset = useSelect(
        (select) => select(store_name).getPreset(),
        [store_name]
    )

    const { setUserName } = dispatch(store_name)

    const handleSuccessLogin = (response) => {
        // to do: replace with real booking name
        setUserName('abcd')
    }

    const renderBookingForm = useCallback(() => {
        render(
            <BookingFormProvider attrService={'0'} attrCategory={'0'}>
                <BookingForm />
            </BookingFormProvider>,
            document.getElementById('wbk_user_dashboard')
        )
    }, [render])

    const menuItems = useMemo(
        () => [
            {
                slug: 'my-bookings',
                label: __('My Bookings', 'webba-booking-lite'),
                icon: iconBookings,
                onClick: () => {},
            },
        ],
        []
    )

    return (
        <div
            className={classNames(styles.wrapper, {
                [styles.loginWrapper]:
                    !preset.user && Object.keys(preset).length > 0,
            })}
        >
            <div
                className={classNames(styles.innerWrapper, {
                    [styles.narrowForm]: preset?.settings?.narrow_form,
                })}
            >
                {Object.keys(preset).length === 0 && <Skeleton />}
                {!preset.user && Object.keys(preset).length > 0 && (
                    <LoginForm onSuccess={handleSuccessLogin} />
                )}
                {preset.user && Object.keys(preset).length > 0 && (
                    <>
                        <div className={styles.mobileHeader}>
                            <h2>{menuItems.find(({ slug }) => menu).label}</h2>
                            <div className={styles.rightPanel}>
                                <Button onClick={renderBookingForm}>
                                    {__('+ New Booking', 'webba-booking-lite')}
                                </Button>
                                <div
                                    className={classNames(styles.menuToggle, {
                                        [styles.expanded]: menuExpanded,
                                    })}
                                    onClick={() =>
                                        setMenuExpanded(!menuExpanded)
                                    }
                                >
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                            </div>
                        </div>
                        {!preset?.settings?.narrow_form && menuExpanded && (
                            <Navbar
                                setMenu={setMenu}
                                currentMenu={menu}
                                menuItems={menuItems}
                            />
                        )}
                        <div className={styles.content}>
                            {menu === 'my-bookings' && <Bookings />}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
