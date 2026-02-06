class WBK_Wizard_Form {
    constructor(container) {
        const get_this = () => {
            return this
        }
        this.container = container
        this.form = container.find('form.setup-area-wb')

        // Initialize button text
        const nextButton = container.find('.button-next-wbk')
        nextButton.append('<span class="btn-ring-wbk"></span>')

        // Initialize handlers
        container.find('.wbk-input').on('input', function () {
            get_this().validate_form()
        })

        // Initialize date pickers for closed dates
        this.initDateRangePickers()

        // Add date range handler
        container.on('click', '.add-date-range-wb', function () {
            // Create a new row directly instead of cloning
            const newRow = jQuery(`
                <div class="date-range-row-wb">
                    <div class="date-inputs-wb">
                        <input type="text" class="wbk-input date-start" placeholder="Start date">
                        <span class="date-separator">-</span>
                        <input type="text" class="wbk-input date-end" placeholder="End date">
                    </div>
                    <button type="button" class="remove-date-range-wb" title="Remove">×</button>
                </div>
            `)

            // Add to container
            container.find('.date-range-repeater-wb').append(newRow)

            // Initialize datepickers for new row
            get_this().initDatePickerForRow(newRow)
        })

        // Remove date range handler
        container.on('click', '.remove-date-range-wb', function () {
            if (container.find('.date-range-row-wb').length > 1) {
                jQuery(this).closest('.date-range-row-wb').remove()
            }
        })

        // Price field validation (allow only numbers and one decimal point)
        container.find('#service-price-wb').on('input', function () {
            let value = this.value

            // Remove any non-numeric characters except decimal point
            value = value.replace(/[^\d.]/g, '')

            // Ensure only one decimal point
            const decimalPoints = value.match(/\./g)
            if (decimalPoints && decimalPoints.length > 1) {
                value = value.replace(/\.(?=.*\.)/g, '')
            }

            // Ensure no more than 2 decimal places
            if (value.includes('.')) {
                const parts = value.split('.')
                if (parts[1].length > 2) {
                    parts[1] = parts[1].substring(0, 2)
                    value = parts.join('.')
                }
            }

            this.value = value
        })

        function syncDurationHmsToHidden(wrapper) {
            const targetId = wrapper.find('.duration-hms-value-wb').first().data('target')
            if (!targetId) return
            const hoursInput = wrapper.find('.duration-hms-value-wb[data-part="hours"]')
            const minsInput = wrapper.find('.duration-hms-value-wb[data-part="mins"]')
            let hours = parseInt(hoursInput.val(), 10) || 0
            let mins = parseInt(minsInput.val(), 10) || 0
            mins = Math.max(0, Math.min(59, mins))
            minsInput.val(mins)
            const total = hours * 60 + mins
            container.find('#' + targetId).val(total)
            get_this().validate_form()
        }

        container.on('input change', '.duration-hms-value-wb', function () {
            const wrapper = jQuery(this).closest('.duration-hms-wrapper-wb')
            syncDurationHmsToHidden(wrapper)
        })

        get_this().toggle_navigation()

        container.find('.button-next-wbk').click(function () {
            get_this().next_step()
            return false
        })
        container.find('.button-prev-wbk').click(function () {
            get_this().prev_step()
            return false
        })
        jQuery(document).on(
            'wbk_after_screen_rendered',
            function (event, response) {
                get_this().after_screen_rendered(response)
            }
        )

        // Currency symbol update handler
        jQuery('#currency-wb').on('change', function () {
            const currency = jQuery(this).val()
            const symbols = {
                USD: '$',
                EUR: '€',
                GBP: '£',
                AED: 'د.إ',
                AUD: 'A$',
                BGN: 'лв',
                BRL: 'R$',
                CAD: 'C$',
                CHF: 'Fr',
                CNY: '¥',
                CZK: 'Kč',
                DKK: 'kr',
                HKD: 'HK$',
                HRK: 'kn',
                HUF: 'Ft',
                IDR: 'Rp',
                ILS: '₪',
                INR: '₹',
                ISK: 'kr',
                JPY: '¥',
                KRW: '₩',
                MXN: '$',
                MYR: 'RM',
                NOK: 'kr',
                NZD: 'NZ$',
                PHP: '₱',
                PLN: 'zł',
                RON: 'lei',
                RUB: '₽',
                SEK: 'kr',
                SGD: 'S$',
                THB: '฿',
                TRY: '₺',
                ZAR: 'R',
            }
            const symbol = symbols[currency] || currency
            jQuery('.currency-symbol').text(symbol)
        })

        // Initialize state
        this.container.attr('data-step', '1')
        this.validate_prev_next_buttons()
        if (container.find('#wizard-business-hours-wb').length) {
            wb_wizard_init_business_hours()
        }
        this.validate_form()
        this.update_steps()

        // Initialize currency symbol
        jQuery('#currency-wb').trigger('change')

        jQuery('#more_services').change(function () {
            jQuery('.more_services_message_wb').toggle()
        })


        // auto detect user timezone and set it as the selected value
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        container.find(`[name="timezone"]`).val(userTimezone);
    }

    after_screen_rendered(response) {
        const get_this = () => {
            return this
        }
    }

    remove_step_subtitle(slug) {
        this.container
            .find(".appointment-status-list-w li[data-slug='" + slug + "']")
            .find('.subtitle-list-w')
            .remove()
    }

    is_ios() {
        return (
            [
                'iPad Simulator',
                'iPhone Simulator',
                'iPod Simulator',
                'iPad',
                'iPhone',
                'iPod',
            ].includes(navigator.platform) ||
            (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
        )
    }

    change_button_status(elem, status) {
        if (status == 'loading') {
            elem.addClass('loading-btn-wb')
            elem.find('.btn-ring-wbk').css('opacity', '1')
            elem.attr('disabled', true)
        }
        if (status == 'regular') {
            elem.removeClass('loading-btn-wb')
            elem.find('.btn-ring-wbk').css('opacity', '0')
            elem.attr('disabled', false)
        }
    }

    init_nice_select() {
        // jQuery('.wbk-select').niceSelect();
    }

    get_next_screen() {
        return this.container
            .find('.wizard-tab-active-wb')
            .next('.wizard-tab-wb')
    }

    get_prev_screen() {
        return this.container
            .find('.wizard-tab-active-wb')
            .prev('.wizard-tab-wb')
    }

    validate_form() {
        const get_this = () => {
            return this
        }
        let passed = false
        let all_passed = true

        // Always enable next button on welcome screen
        if (
            this.container.find('.wizard-tab-active-wb .setup-welcome-wb')
                .length > 0
        ) {
            get_this()
                .container.find('.button-next-wbk')
                .attr('disabled', false)
            return true
        }

        // Get current step
        const currentStep = parseInt(this.container.attr('data-step'))

        // Only validate inputs in the current active tab
        this.container
            .find('.wizard-tab-active-wb')
            .find('.wbk-input')
            .not('.nice-select')
            .each(function () {
                const elem = jQuery(this)
                const value = jQuery(this).val()
                const field_name = jQuery(this).attr('data-validationmsg')

                // Skip validation for optional fields
                if (elem.attr('data-validation') === undefined) {
                    passed = true
                    return
                }

                switch (jQuery(this).attr('data-validation')) {
                    case 'positive':
                        if (value.trim() == '') {
                            passed = false
                        } else {
                            passed = wbk_check_integer_min_max(
                                value,
                                1,
                                99999999
                            )
                        }
                        break
                    case 'not_empty':
                        passed = wbk_check_string(value, 1, 16384)
                        break
                    case 'must_have_items':
                        passed = false
                        elem.find('option').each(function () {
                            if (jQuery(this).prop('selected')) {
                                passed = true
                            }
                        })
                        break
                    case 'email':
                        passed = wbk_check_email(value)
                        break
                    default:
                        passed = true
                }
                if (!passed) {
                    all_passed = false
                }
            })

        // Special validation for step 3
        if (currentStep === 3) {
            // Only require service name, price and duration
            const serviceName = this.container.find('#service-name-wb').val()
            const servicePrice = this.container.find('#service-price-wb').val()
            const serviceDuration = this.container
                .find('#service-duration-wb')
                .val()

            all_passed = serviceName && servicePrice && serviceDuration
        }

        if (!all_passed) {
            get_this().container.find('.button-next-wbk').attr('disabled', true)
        } else {
            get_this()
                .container.find('.button-next-wbk')
                .attr('disabled', false)
        }

        return all_passed
    }

    clear_fields(element) {
        element.find('.dynamic-content-w').remove()
        element.find('.wbk-input').val('')
        element.find('select.wbk-input').val(0)
        // element.find('.wbk-input').niceSelect('update');
        element.find('.wbk_times > option').remove()
        element.attr('style', '')
    }

    validate_prev_next_buttons() {
        const get_this = () => {
            return this
        }
        var step = parseInt(get_this().container.attr('data-step'))
        const nextButton = get_this().container.find('.button-next-wbk')
        const launchText = nextButton.data('launch-text') || 'Launch wizard'
        const nextText = nextButton.data('next-text') || 'Next'

        // Handle previous button visibility
        if (step == 1) {
            get_this().container.find('.button-prev-wbk').addClass('wbk_hidden')
            get_this()
                .container.find('.wbk_wizard_youtube_link')
                .removeClass('wbk_hidden')
        } else {
            get_this()
                .container.find('.button-prev-wbk')
                .removeClass('wbk_hidden')
            get_this()
                .container.find('.wbk_wizard_youtube_link')
                .addClass('wbk_hidden')
        }
    }

    prev_step() {
        const get_this = () => {
            return this
        }
        var prev_screen = get_this().get_prev_screen()
        var step = parseInt(get_this().container.attr('data-step'))

        step--
        get_this().container.attr('data-step', step)

        get_this().change_button_status(
            get_this().container.find('.button-next-wbk'),
            'regular'
        )
        get_this()
            .container.find('.wizard-tab-active-wb')
            .fadeOut('fast', function () {
                jQuery(this).removeClass('wizard-tab-active-wb')
                prev_screen.addClass('wizard-tab-active-wb')
                prev_screen.fadeIn('fast')
                get_this().validate_prev_next_buttons()
                get_this().update_steps()
                get_this().validate_form()
                get_this().toggle_navigation()
            })
    }

    async next_step() {
        const get_this = () => {
            return this
        }
        var next_screen = get_this().get_next_screen()
        if (next_screen.length == 0) {
            return
        }
        var step = parseInt(get_this().container.attr('data-step'))
        step++
        get_this().container.attr('data-step', step)

        if (typeof next_screen.attr('data-request') !== 'undefined') {
            get_this().change_button_status(
                get_this().container.find('.button-next-wbk'),
                'loading'
            )
            var response = await this.do_request(
                next_screen.attr('data-request')
            )
            response = jQuery.parseJSON(response)
            if (response != false) {
                this.show_next_screen(next_screen, response)
                return
            }
        }
        this.show_next_screen(next_screen)
    }

    toggle_navigation() {
        const get_this = () => {
            return this
        }
        const step = parseInt(get_this().container.attr('data-step'))
        const stepsCount = get_this().container.find('.wizard-tab-wb').length
        const title = get_this()
            .container.find('.wizard-tab-active-wb')
            .attr('data-title')

        if (step === 1 || step === stepsCount) {
            get_this().container.find('.navigation-wrapper').hide()
        } else {
            get_this().container.find('.navigation-wrapper').show()
        }

        get_this()
            .container.parents('.main-block-wb')
            .find('.page-title-current')
            .text(title)
    }

    do_request(action) {
        return new Promise((resolve) => {
            const symbols = {
                USD: '$',
                EUR: '€',
                GBP: '£',
                AED: 'د.إ',
                AUD: 'A$',
                BGN: 'лв',
                BRL: 'R$',
                CAD: 'C$',
                CHF: 'Fr',
                CNY: '¥',
                CZK: 'Kč',
                DKK: 'kr',
                HKD: 'HK$',
                HRK: 'kn',
                HUF: 'Ft',
                IDR: 'Rp',
                ILS: '₪',
                INR: '₹',
                ISK: 'kr',
                JPY: '¥',
                KRW: '₩',
                MXN: '$',
                MYR: 'RM',
                NOK: 'kr',
                NZD: 'NZ$',
                PHP: '₱',
                PLN: 'zł',
                RON: 'lei',
                RUB: '₽',
                SEK: 'kr',
                SGD: 'S$',
                THB: '฿',
                TRY: '₺',
                ZAR: 'R',
            }

            // Use the form element directly
            var form_data = new FormData(this.form[0])

            // Add currency symbol if currency field exists
            const currencyField = form_data.get('currency')
            if (currencyField) {
                form_data.append(
                    'currency_symbol',
                    symbols[currencyField] || currencyField
                )
            }

            // Collect date ranges
            const dateRanges = []
            this.container.find('.date-range-row-wb').each(function () {
                const startDate = jQuery(this).find('.date-start').val()
                const endDate = jQuery(this).find('.date-end').val()
                if (startDate && endDate) {
                    dateRanges.push({
                        start: startDate,
                        end: endDate,
                    })
                }
            })

            // Add date ranges to form data
            if (dateRanges.length > 0) {
                form_data.append('closed_dates', JSON.stringify(dateRanges))
            }

            form_data.append('action', action)
            form_data.append('nonce', wbk_wizardl10n.nonce)

            const result = jQuery.ajax({
                url: wbk_wizardl10n.ajaxurl,
                type: 'POST',
                data: form_data,
                cache: false,
                processData: false,
                contentType: false,
                success: function (response) {
                    resolve(response)
                },
                error: function () {
                    resolve(false)
                },
                complete: function () { },
            })
        })
    }

    show_next_screen(next_screen, response) {
        const get_this = () => {
            return this
        }
        const nextButton = get_this().container.find('.button-next-wbk')
        const step = parseInt(get_this().container.attr('data-step'))

        this.container
            .find('.wizard-tab-active-wb')
            .fadeOut('fast', function () {
                get_this().change_button_status(nextButton, 'regular')
                get_this()
                    .container.find('.wizard-tab-active-wb')
                    .removeClass('wizard-tab-active-wb')
                next_screen.addClass('wizard-tab-active-wb')
                next_screen.find('.wbk-input').addClass('linear-animation-w')
                get_this().toggle_navigation()

                nextButton.append('<span class="btn-ring-wbk"></span>')

                get_this().validate_prev_next_buttons()
                get_this().update_steps()
                get_this().validate_form()

                // Update currency symbol when moving to next screen
                if (next_screen.find('.currency-symbol').length) {
                    jQuery('#currency-wb').trigger('change')
                }

                if (next_screen.find('#wizard-business-hours-wb').length) {
                    wb_wizard_init_business_hours()
                }

                var next_screen_check = get_this().get_next_screen()
                if (next_screen_check.length == 0) {
                    // Hide next button on last step
                    nextButton.hide()

                    // Set shortcode value if available in response
                    if (response && response.shortcode) {
                        jQuery('.wbk-input[value="[webba_booking]"]').val(
                            response.shortcode
                        )
                    }

                    jQuery('.buttons-block-wb').css(
                        'flex-direction',
                        'row-reverse'
                    )
                    jQuery('.buttons-block-wb').html(
                        '<button type="button" data-action="finalize" class="button-wbkb wizard-final-wb">' +
                        'Close Setup Wizard' +
                        '<span class="btn-ring-wbk"></span>' +
                        '</button>' +
                        '<input type="hidden" class="final_action" name="final_action">'
                    )
                    jQuery('.skip-link-wrapper-wb').remove()

                    jQuery('.wizard-final-wb').click(async function (event) {
                        get_this().change_button_status(jQuery(this), 'loading')
                        get_this()
                            .container.find('.final_action')
                            .val(jQuery(this).attr('data-action'))

                        var response = await get_this().do_request(
                            'wbk_wizard_final_setup'
                        )
                        response = jQuery.parseJSON(response)
                        if (response.status == 'fail') {
                            window.location = wbk_wizardl10n.admin_url
                        } else {
                            window.location = response.url
                            return
                        }
                        event.preventDefault()
                    })
                    return
                }
                next_screen.fadeIn('fast')
            })
    }

    update_steps() {
        jQuery('.setup-steps-block-wb > li').removeClass('active')
        jQuery('.setup-steps-block-wb > li').removeClass('done')

        var step = this.container.attr('data-step')
        jQuery('.setup-steps-block-wb > li:nth-child(' + step + ')').addClass(
            'active'
        )
        for (var i = 1; i < step; i++) {
            jQuery('.setup-steps-block-wb > li:nth-child(' + i + ')').addClass(
                'done'
            )
        }
    }

    initDateRangePickers() {
        const get_this = () => {
            return this
        }
        // Initialize datepickers for initial row
        this.initDatePickerForRow(
            this.container.find('.date-range-row-wb').first()
        )
    }

    initDatePickerForRow(row) {
        const startInput = row.find('.date-start')
        const endInput = row.find('.date-end')

        // Destroy existing datepickers if they exist
        if (startInput.hasClass('hasDatepicker')) {
            startInput.datepicker('destroy')
        }
        if (endInput.hasClass('hasDatepicker')) {
            endInput.datepicker('destroy')
        }

        // Initialize start date picker
        startInput
            .datepicker({
                dateFormat: 'mm/dd/yy',
                minDate: 0,
                onSelect: function (selectedDate) {
                    endInput.datepicker('option', 'minDate', selectedDate)
                },
            })
            .on('change', function () {
                const selectedDate = jQuery(this).val()
                if (selectedDate) {
                    endInput.datepicker('option', 'minDate', selectedDate)
                }
            })

        // Initialize end date picker
        endInput
            .datepicker({
                dateFormat: 'mm/dd/yy',
                minDate: 0,
                onSelect: function (selectedDate) {
                    startInput.datepicker('option', 'maxDate', selectedDate)
                },
            })
            .on('change', function () {
                const selectedDate = jQuery(this).val()
                if (selectedDate) {
                    startInput.datepicker('option', 'maxDate', selectedDate)
                }
            })
    }
}

jQuery(function ($) {
    jQuery('.content-main-wb').each(function () {
        var form = new WBK_Wizard_Form(jQuery(this))
    })
})

var WBK_WIZARD_DAY_NAMES = { '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'Thu', '5': 'Fri', '6': 'Sat', '7': 'Sun' }

function wb_wizard_seconds_to_label(seconds) {
    var h = Math.floor(seconds / 3600)
    var m = Math.floor((seconds % 3600) / 60)
    var period = 'AM'
    if (h >= 12) { period = 'PM'; if (h > 12) h -= 12 }
    if (h === 0) h = 12
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ' ' + period
}

function wb_wizard_business_hours_time_options() {
    var opts = []
    for (var s = 0; s <= 86400; s += 900) {
        var label = s === 86400 ? '12:00 AM (midnight)' : wb_wizard_seconds_to_label(s)
        opts.push({ value: s, label: label })
    }
    return opts
}

function wb_wizard_parse_business_hours(jsonStr) {
    if (!jsonStr || !jsonStr.trim()) return []
    try {
        var arr = JSON.parse(jsonStr)
        return Array.isArray(arr) ? arr : []
    } catch (e) {
        return []
    }
}

function wb_wizard_default_business_hours() {
    var slots = []
    for (var d = 1; d <= 5; d++) {
        slots.push({ start: 32400, end: 46800, day_of_week: String(d), status: 'active' })
        slots.push({ start: 50400, end: 64800, day_of_week: String(d), status: 'active' })
    }
    return slots
}

function wb_wizard_sync_business_hours_to_hidden() {
    var container = jQuery('#wizard-business-hours-wb')
    if (!container.length) return
    var slots = []
    container.find('.wizard-slot-row-wb').each(function () {
        var row = jQuery(this)
        var day = row.data('day')
        var start = parseInt(row.find('.wizard-slot-start-wb').val(), 10)
        var end = parseInt(row.find('.wizard-slot-end-wb').val(), 10)
        if (!isNaN(start) && !isNaN(end) && day) {
            slots.push({ start: start, end: end, day_of_week: String(day), status: 'active' })
        }
    })
    jQuery('#wbk-global-working-hours-wb').val(JSON.stringify(slots))
}

function wb_wizard_render_business_hours(slots) {
    var daysWrapper = jQuery('#wizard-business-hours-wb .wizard-business-hours-days-wb')
    if (!daysWrapper.length) return
    var timeOpts = wb_wizard_business_hours_time_options()
    var timeOptionsHtml = timeOpts.map(function (o) {
        return '<option value="' + o.value + '">' + o.label + '</option>'
    }).join('')
    var html = ''
    for (var day = 1; day <= 7; day++) {
        var daySlots = slots.filter(function (s) { return String(s.day_of_week) === String(day) })
        var dayName = WBK_WIZARD_DAY_NAMES[String(day)] || ('Day ' + day)
        html += '<div class="wizard-day-row-wb" data-day="' + day + '">'
        html += '<div class="wizard-day-header-wb">'
        html += '<span class="wizard-day-name-wb">' + dayName + '</span>'
        html += '<div class="wizard-day-actions-wb">'
        html += '<a href="#" class="wizard-add-slot-wb">+ Add time slot</a>'
        if (daySlots.length > 0) {
            html += '<a href="#" class="wizard-apply-all-wb">Apply to all days</a>'
        }
        html += '</div></div>'
        html += '<div class="wizard-day-slots-wb">'
        if (daySlots.length === 0) {
            html += '<div class="wizard-no-slots-wb">No time slots set</div>'
        } else {
            daySlots.forEach(function (slot) {
                var startVal = slot.start || 32400
                var endVal = slot.end || 46800
                var startOpts = timeOpts.map(function (o) {
                    return '<option value="' + o.value + '"' + (o.value === startVal ? ' selected' : '') + '>' + o.label + '</option>'
                }).join('')
                var endOpts = timeOpts.map(function (o) {
                    return '<option value="' + o.value + '"' + (o.value === endVal ? ' selected' : '') + '>' + o.label + '</option>'
                }).join('')
                html += '<div class="wizard-slot-row-wb" data-day="' + day + '">'
                html += '<select class="wbk-input wizard-slot-start-wb">' + startOpts + '</select>'
                html += '<span class="wizard-slot-sep-wb">–</span>'
                html += '<select class="wbk-input wizard-slot-end-wb">' + endOpts + '</select>'
                html += '<button type="button" class="wizard-slot-remove-wb" title="Remove">×</button>'
                html += '</div>'
            })
        }
        html += '</div></div>'
    }
    daysWrapper.html(html)
    daysWrapper.find('.wizard-slot-start-wb, .wizard-slot-end-wb').on('change', wb_wizard_sync_business_hours_to_hidden)
    daysWrapper.find('.wizard-slot-remove-wb').on('click', function (e) {
        e.preventDefault()
        jQuery(this).closest('.wizard-slot-row-wb').remove()
        var dayRow = jQuery(this).closest('.wizard-day-row-wb')
        if (dayRow.find('.wizard-slot-row-wb').length === 0) {
            dayRow.find('.wizard-day-slots-wb').html('<div class="wizard-no-slots-wb">No time slots set</div>')
            dayRow.find('.wizard-apply-all-wb').remove()
        }
        wb_wizard_sync_business_hours_to_hidden()
    })
    daysWrapper.find('.wizard-add-slot-wb').on('click', function (e) {
        e.preventDefault()
        var dayRow = jQuery(this).closest('.wizard-day-row-wb')
        var day = dayRow.data('day')
        var slotsContainer = dayRow.find('.wizard-day-slots-wb')
        dayRow.find('.wizard-no-slots-wb').remove()
        var lastEnd = 43200
        slotsContainer.find('.wizard-slot-end-wb').each(function () {
            var v = parseInt(jQuery(this).val(), 10)
            if (v > lastEnd) lastEnd = v
        })
        var newStart = lastEnd
        var newEnd = Math.min(86400, lastEnd + 10800)
        var timeOpts = wb_wizard_business_hours_time_options()
        var timeOptionsHtml = timeOpts.map(function (o) {
            return '<option value="' + o.value + '"' + (o.value === newStart ? ' selected' : '') + '>' + o.label + '</option>'
        }).join('')
        var endOptionsHtml = timeOpts.map(function (o) {
            return '<option value="' + o.value + '"' + (o.value === newEnd ? ' selected' : '') + '>' + o.label + '</option>'
        }).join('')
        var rowHtml = '<div class="wizard-slot-row-wb" data-day="' + day + '">'
        rowHtml += '<select class="wbk-input wizard-slot-start-wb">' + timeOptionsHtml + '</select>'
        rowHtml += '<span class="wizard-slot-sep-wb">–</span>'
        rowHtml += '<select class="wbk-input wizard-slot-end-wb">' + endOptionsHtml + '</select>'
        rowHtml += '<button type="button" class="wizard-slot-remove-wb" title="Remove">×</button></div>'
        slotsContainer.append(rowHtml)
        if (dayRow.find('.wizard-apply-all-wb').length === 0) {
            dayRow.find('.wizard-day-actions-wb').append('<a href="#" class="wizard-apply-all-wb">Apply to all days</a>')
        }
        slotsContainer.find('.wizard-slot-row-wb:last-child .wizard-slot-start-wb, .wizard-slot-row-wb:last-child .wizard-slot-end-wb').on('change', wb_wizard_sync_business_hours_to_hidden)
        slotsContainer.find('.wizard-slot-row-wb:last-child .wizard-slot-remove-wb').on('click', function (ev) {
            ev.preventDefault()
            jQuery(this).closest('.wizard-slot-row-wb').remove()
            if (dayRow.find('.wizard-slot-row-wb').length === 0) {
                dayRow.find('.wizard-day-slots-wb').html('<div class="wizard-no-slots-wb">No time slots set</div>')
                dayRow.find('.wizard-apply-all-wb').remove()
            }
            wb_wizard_sync_business_hours_to_hidden()
        })
        wb_wizard_sync_business_hours_to_hidden()
    })
    daysWrapper.find('.wizard-apply-all-wb').on('click', function (e) {
        e.preventDefault()
        var sourceDayRow = jQuery(this).closest('.wizard-day-row-wb')
        var sourceDay = sourceDayRow.data('day')
        var sourceSlots = []
        sourceDayRow.find('.wizard-slot-row-wb').each(function () {
            var row = jQuery(this)
            sourceSlots.push({
                start: parseInt(row.find('.wizard-slot-start-wb').val(), 10),
                end: parseInt(row.find('.wizard-slot-end-wb').val(), 10)
            })
        })
        if (sourceSlots.length === 0) return
        var allSlots = []
        for (var d = 1; d <= 7; d++) {
            sourceSlots.forEach(function (slot) {
                allSlots.push({ start: slot.start, end: slot.end, day_of_week: String(d), status: 'active' })
            })
        }
        wb_wizard_render_business_hours(allSlots)
        jQuery('#wbk-global-working-hours-wb').val(JSON.stringify(allSlots))
    })
    wb_wizard_sync_business_hours_to_hidden()
}

function wb_wizard_init_business_hours() {
    var container = jQuery('#wizard-business-hours-wb')
    if (!container.length) return
    var initial = container.attr('data-initial') || ''
    var slots = wb_wizard_parse_business_hours(initial)
    if (slots.length === 0) slots = wb_wizard_default_business_hours()
    wb_wizard_render_business_hours(slots)
    var hidden = jQuery('#wbk-global-working-hours-wb')
    if (!hidden.val()) hidden.val(JSON.stringify(slots))
}

function wbk_copy_shortcode() {
    var copyText = document.getElementById('shortcode-booking-form-wb')
    copyText.select()
    copyText.setSelectionRange(0, 99999)
    navigator.clipboard.writeText(copyText.value)
    jQuery('.inner_copy_wb').html('Copied ')
    return false
}
