(function () {
    const BOOKING_FORM_HASH = '#webba-booking-form'
    const FILTER_ATTRIBUTE_KEYS = [
        'service',
        'category',
        'location',
        'staff',
        'units',
    ]

    const getPayload = (label, container) => {
        const item = {
            'menu-item-type': 'custom',
            'menu-item-url': BOOKING_FORM_HASH,
            'menu-item-title': label,
            'menu-item-wbk-popup': '1',
        }

        FILTER_ATTRIBUTE_KEYS.forEach(function (key) {
            const value = container.getAttribute('data-' + key)
            if (value) {
                item['menu-item-wbk-' + key] = value
            }
        })

        return { '-1': item }
    }

    const addBookingLinkToMenu = (button) => {
        if (!window.wpNavMenu || button.disabled) {
            return
        }

        const container = button.closest('#wbk_nav_menu_booking')
        if (!container) {
            return
        }

        const labelInput = container.querySelector(
            '#wbk-nav-menu-booking-label'
        )
        const navigationLabel = (labelInput?.value || '').trim()
        if (!navigationLabel) {
            return
        }

        const spinner = container.querySelector('.spinner')
        button.disabled = true
        spinner?.classList.add('is-active')

        window.wpNavMenu.addItemToMenu(
            getPayload(navigationLabel, container),
            window.wpNavMenu.addMenuItemToBottom.bind(window.wpNavMenu),
            function () {
                button.disabled = false
                spinner?.classList.remove('is-active')
            }
        )
    }

    document.addEventListener('click', function (event) {
        const button = event.target.closest('#wbk-nav-menu-booking-add')
        if (!button) {
            return
        }

        event.preventDefault()
        addBookingLinkToMenu(button)
    })

    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter') {
            return
        }

        const labelInput = event.target.closest('#wbk-nav-menu-booking-label')
        if (!labelInput) {
            return
        }

        event.preventDefault()
        const container = labelInput.closest('#wbk_nav_menu_booking')
        const button = container?.querySelector('#wbk-nav-menu-booking-add')
        if (button) {
            addBookingLinkToMenu(button)
        }
    })
})()
