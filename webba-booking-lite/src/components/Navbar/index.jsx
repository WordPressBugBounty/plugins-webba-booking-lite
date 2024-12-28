import React, { useState } from 'react'
import { select } from '@wordpress/data'
import { store_name } from '../../store/frontend'

const Navbar = ({ setTab }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [currentTab, setCurrentTab] = useState('future_bookings')
    const { wording } = select(store_name).getPreset()

    const handleLinkClick = (event, name) => {
        event.preventDefault()
        setTab({ name: name })
        setCurrentTab(name)
    }

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    return (
        <nav className="navbar-wbk">
            <button className="menu-toggle-wbk" onClick={toggleMenu}>
                &#9776;
            </button>
            <ul className={`navbar-links-wbk ${isOpen ? 'open-wbk' : ''}`}>
                <li>
                    <a
                        href="#bookings"
                        onClick={(event) =>
                            handleLinkClick(event, 'future_bookings')
                        }
                        className={`${
                            currentTab === 'future_bookings' ? 'active-wbk' : ''
                        }`}
                    >
                        {wording.bookings}
                    </a>
                </li>
                <li>
                    <a
                        href="#booking-history"
                        onClick={(event) =>
                            handleLinkClick(event, 'booking_history')
                        }
                        className={`${
                            currentTab === 'booking_history' ? 'active-wbk' : ''
                        }`}
                    >
                        {wording.booking_history}
                    </a>
                </li>
            </ul>
        </nav>
    )
}

export default Navbar
