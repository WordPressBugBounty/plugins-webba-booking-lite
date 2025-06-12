class WEBBA5_Form {
    constructor(container) {
        const get_this = () => {
            return this
        }
        this.container = container
        get_this().init_nice_select()

        var screen_count = container.find(
            '.appointment-content-screen-w'
        ).length

        // wbk_hidden wbk_service_checkbox_holder
        if (this.container.find('[data-slug="link_payment"]').length > 0) {
            get_this().initiaize_payments()
        }
        jQuery('.wbk_read_more').click(function (e) {
            get_this().track_event('service_description_toggled',{})
            e.preventDefault()
            jQuery(this)
                .siblings('.wbk_service_description_switcher')
                .trigger('click')
        })
        jQuery('.wbk_service_description_switcher').click(function (e) {
            e.preventDefault()
            jQuery(this).siblings('.wbk_read_more').toggle()
            jQuery(this).toggleClass('wbk_rotate_90')
            jQuery(this)
                .closest('li')
                .find('.wbk_service_description_holder')
                .toggleClass('wbk_hidden')
        })
        var i = 1

        if (container.find('.wbk_service_categories').length == 0) {
            get_this()
                .container.find('.service-label-wbk')
                .removeClass('wbk_hidden')

            get_this()
                .container.find('.wbk_service_item')
                .removeClass('wbk_hidden')
        }

        container.find('.wbk_service_categories').change(function () {
            container.find('.wbk_services').prop('checked', false)

            container.find('.wbk_services').trigger('change')
            if (jQuery(this).val() == 0) {
                get_this()
                    .container.find('.service-label-wbk')
                    .addClass('wbk_hidden')

                get_this()
                    .container.find('.wbk_service_item')
                    .addClass('wbk_hidden')

                return
            }
            var services_opt = jQuery(this)
                .find('option:selected')
                .attr('data-services')
                .split('-')

            get_this()
                .container.find('.wbk_service_item')
                .addClass('wbk_hidden')

            jQuery.each(services_opt, function (index, value) {
                container
                    .find('.wbk_service_item[data-servicei_id="' + value + '"]')
                    .removeClass('wbk_hidden')
            })
        })

        container.find('.appointment-content-screen-w').each(function () {
            if (i == screen_count) {
                return
            }

            if (jQuery(this).attr('data-slug') == 'payment_optional') {
                i++
                return
            }
            get_this().add_status_bar_item(
                i,
                jQuery(this).attr('data-title'),
                jQuery(this).attr('data-slug')
            )
            i++
        })

        container
            .find('.appointment-content-screen-active-w')
            .find('.wbk-input')
            .addClass('linear-animation-w')
        container
            .find('.appointment-status-list-w > li')
            .first()
            .addClass('active-w')

        container.find('.button-next-wbk').click(function () {
            if (
                jQuery('.appointment-content-screen-active-w').attr(
                    'data-slug'
                ) == 'form'
            ) {
                get_this().set_agrigated_custom_field()
            }
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
        this.container.attr('data-step', '1')
        this.validate_prev_next_buttons()
        this.validate_form()
        this.set_input_events()

        if (jQuery('.appointment-content-payment-optional').length > 0) {
            container.find('.wbk_services').change(function () {
                get_this().track_event('service_selected',{})
                var payable = false

                if (!get_this().is_multi_service()) {
                    if (
                        container
                            .find('.wbk_services:checked')
                            .attr('data-payable') == 'true'
                    ) {
                        payable = true
                    }
                } else {
                    get_this()
                        .container.find('.wbk_service_checkbox:checked')
                        .each(function () {
                            if (jQuery(this).attr('data-payable') == 'true') {
                                payable = true
                            }
                        })
                }
                if (payable) {
                    container
                        .find('[data-slug="payment_optional"]')
                        .not('li')
                        .addClass('appointment-content-screen-w')
                    container
                        .find('[data-slug="payment_optional"]')
                        .not('li')
                        .removeClass(' appointment-content-payment-optional')
                    container
                        .find('[data-slug="final_screen"]')
                        .attr('data-request', 'wbk_approve_payment')

                    if (
                        get_this().container.find(
                            '.appointment-status-list-w > li[data-slug="payment_optional"]'
                        ).length == 0
                    ) {
                        get_this().add_status_bar_item(
                            i,
                            container
                                .find('[data-slug="payment_optional"]')
                                .attr('data-title'),
                            container
                                .find('[data-slug="payment_optional"]')
                                .attr('data-slug')
                        )
                    }
                } else {
                    container
                        .find('[data-slug="payment_optional"]')
                        .not('li')
                        .removeClass('appointment-content-screen-w')
                    container
                        .find('[data-slug="payment_optional"]')
                        .not('li')
                        .addClass(' appointment-content-payment-optional')
                    container
                        .find('[data-slug="final_screen"]')
                        .attr('data-request', 'wbk_book')

                    container
                        .find('li.appointment-content-payment-optional')
                        .remove()
                    get_this().remove_status_bar_item('payment_optional')
                }
                get_this().update_mobile_step()
            })
        }

        this.circle_chart()

        this.update_mobile_step()
        get_this().init_scroll_bars()
        if (this.container.find('.wbk_services_hidden').length > 0) {
            this.get_service_data()
        }

        jQuery('.wbk-addgg-link').click(function () {
            window.location.href = jQuery(this).attr('data-link')
        })

        this.container.find('form').on('submit', function (e) {
            e.preventDefault()
        })
    }
    async get_service_data() {
        this.container
            .find('.appointment-content-scroll-wbk')
            .append('<div class="wbk-loading"></div>')
        var response = await this.do_request('wbk_prepare_service_data')
        response = jQuery.parseJSON(response)
        this.prepare_service_data_init(response)
        this.container.find('.wbk-loading').remove()
        this.container.find('.wbk_date_picked_row').removeClass('wbk_hidden')
    }
    track_event(event, param = {}){
        if (typeof gtag === 'function' && wbkl10n.is_pro == 'true') {
            gtag('event', 'webba_' + event, param);
        }
    }
    is_multi_service() {
        return this.container.find('.wbk_service_checkbox').length > 0
    }
    circle_chart() {
        var color = this.container
            .find('.circle-chart-wbk')
            .attr('data-circle-color')
        this.container.find('.circle-chart-wbk').easyPieChart({
            animate: false,
            barColor: '#ffffff',
            trackColor: color,
            scaleColor: false,
            lineWidth: 6,
        })
    }

    validate_stripe_input(card_maintained) {
        const get_this = () => {
            return this
        }
        if (!card_maintained) {
            this.container
                .find('.button-approve-stripe-payment')
                .prop('disabled', true)
            return false
        } else {
            this.container
                .find('.button-approve-stripe-payment')
                .prop('disabled', false)
            return true
        }
    }

    process_conditional(elem) {
        const get_this = () => {
            return this
        }
        if (this.container.find('[name="_wpcf7cf_options"]').length == 0) {
            return
        }
        var condition = jQuery.parseJSON(
            this.container.find('[name="_wpcf7cf_options"]').val()
        )
        jQuery.each(condition.conditions, function (i, data) {
            var and_rules = data.and_rules
            var then_field = data.then_field
            jQuery.each(and_rules, function (k, rule) {
                if (
                    rule.if_field == elem.attr('name') &&
                    rule.operator == 'equals'
                ) {
                    if (rule.if_value == elem.val()) {
                        jQuery('[data-id="' + then_field + '"]').css(
                            'display',
                            'block'
                        )
                    } else {
                        jQuery('[data-id="' + then_field + '"]').css(
                            'display',
                            'none'
                        )
                    }
                }
                if (
                    rule.if_field == elem.attr('name') &&
                    rule.operator == 'not equals'
                ) {
                    if (rule.if_value != elem.val()) {
                        jQuery('[data-id="' + then_field + '"]').css(
                            'display',
                            'block'
                        )
                    } else {
                        jQuery('[data-id="' + then_field + '"]').css(
                            'display',
                            'none'
                        )
                    }
                }
            })
        })
    }

    set_input_events() {
        const get_this = () => {
            return this
        }
        this.container.find('.wbk-input').on('input', function () {
            get_this().process_conditional(jQuery(this))
            get_this().validate_form()
        })
        this.container.find('.wbk-file').on('input', function () {
            get_this().validate_form()
        })
        this.container.find('.wbk-book-quantity').change(function () {
            get_this().set_multiple_data()
        })

        this.container.find('[name="quantity"]').trigger('change')
        this.container.find('.wbk-input').change(function () {
            get_this().process_conditional(jQuery(this))
            get_this().validate_form()
        })
    }

    get_multi_service_name_by_id(service_id) {
        return this.container
            .find('.wbk_service_checkbox[value="' + service_id + '"]')
            .closest('.wbk_service_item')
            .find('.wbk_single_service_title')
            .html()
    }
    get_service_name_by_id(service_id) {
        return this.container
            .find('.wbk_services[value="' + service_id + '"]')
            .closest('.wbk_service_item')
            .find('.wbk_single_service_title')
            .html()
    }

    set_agrigated_custom_field() {
        const get_this = () => {
            return this
        }
        var custom_data = []
        get_this()
            .container.find('.wbk-custom-field')
            .each(function () {
                if (
                    jQuery(this).closest('[data-class="wpcf7cf_group"]')
                        .length > 0
                ) {
                    if (
                        jQuery(this)
                            .closest('[data-class="wpcf7cf_group"]')
                            .attr('style') == 'display: none;'
                    ) {
                        return
                    }
                }
                var id = wbk_strip_html(jQuery(this).attr('name'))
                var val = ''
                var title = ''

                var val = wbk_strip_html(jQuery(this).val())

                title = wbk_strip_html(
                    get_this()
                        .container.find('label[for="' + id + '"]')
                        .html()
                )
                custom_data.push([id, title, val])
            })
        custom_data = JSON.stringify(custom_data)
        get_this().container.find('.wbk-extra').html(custom_data)
    }

    after_screen_rendered(response) {
        const get_this = () => {
            return this
        }
        var request
        setTimeout(() => {
            request = this.container
                .find('.appointment-content-screen-active-w')
                .attr('data-request')
            switch (request) {
                case 'wbk_prepare_service_data':
                    get_this().prepare_service_data_init(response)
                    var value = ''
                    if (get_this().is_multi_service()) {
                        value = []
                        get_this()
                            .container.find('.wbk_service_checkbox:checked')
                            .each(function () {
                                value.push(
                                    jQuery(this)
                                        .closest('.wbk_service_checkbox_holder')
                                        .find('.wbk_single_service_title')
                                        .html()
                                )
                            })
                    } else {
                        value = get_this()
                            .container.find('.wbk_services:checked')
                            .closest('.custom-radiobutton-wbk')
                            .find('.wbk_single_service_title')
                            .text()
                        value = [value]
                    }

                    get_this().set_step_subtitle('services', value)

                    break
                case 'wbk_render_booking_form':
                    var value = []
                    const checked = get_this()
                        .container.find('.wbk_local_time_checkbox')
                        .is(':checked')
                    get_this()
                        .container.find('.wbk_times > option:selected')
                        .each(function () {
                            var date_time_string = ''
                            if (checked) {
                                date_time_string = jQuery(this).attr(
                                    'data-time_string_local'
                                )
                            } else {
                                date_time_string =
                                    jQuery(this).attr('data-time_string')
                            }
                            value.push(date_time_string)
                        })
                    get_this().set_step_subtitle('date_time', value)
                    this.container
                        .find('.appointment-content-screen-active-w')
                        .html(
                            '<style="display:none" class="hider-w">' +
                                response +
                                '<input type="hidden" class="wbk_amount_update_token" name="amount_update_token" value=""/>' +
                                '</div>'
                        )

                    this.init_nice_select()
                    get_this().init_scroll_bars()
                    this.container
                        .find('.appointment-content-screen-active-w')
                        .find('.hider-w')
                        .fadeIn('slow', function () {})

                    this.container
                        .find('.wbk-checkbox-custom')
                        .each(function () {
                            var exculsive = jQuery(this).hasClass(
                                'wpcf7-exclusive-checkbox'
                            )
                            var chk_id = jQuery(this).attr('id')
                            var chk_label = jQuery(
                                "label[for='" + chk_id + "']"
                            ).html()
                            var new_checkbox_html =
                                '<div class="wbk_checkbox_container"><label class="input-label-wbk" for="' +
                                chk_id +
                                '" >' +
                                chk_label +
                                '</label>'
                            var checkbox_data_validation = ''
                            if (
                                jQuery(this).hasClass(
                                    'wpcf7-validates-as-required'
                                )
                            ) {
                                checkbox_data_validation =
                                    ' data-validation="not_empty" '
                            }
                            new_checkbox_html +=
                                '<input type="text" ' +
                                checkbox_data_validation +
                                '  class="wbk-input wbk_chk_proxy wbk-custom-field wbk_hidden" name="' +
                                chk_id +
                                '">'

                            var i = 0
                            jQuery(this)
                                .find('input[type="checkbox"]')
                                .each(function () {
                                    i++
                                    var chk_val = jQuery(this).attr('value')

                                    new_checkbox_html +=
                                        '<label for="' +
                                        chk_id +
                                        '_' +
                                        i +
                                        '" class="checkbox-row-w one-row-w">'
                                    new_checkbox_html +=
                                        '<span class="checkbox-custom-w">' +
                                        '<input type="checkbox" ' +
                                        checkbox_data_validation +
                                        ' data-exclusive="' +
                                        exculsive +
                                        '" data-id="' +
                                        chk_id +
                                        '" class="wbk_input_checkbox_option"' +
                                        'name="' +
                                        chk_id +
                                        '" id="' +
                                        chk_id +
                                        '_' +
                                        i +
                                        '" value="' +
                                        chk_val +
                                        '">' +
                                        '<span class="checkmark-w"></span>' +
                                        '</span>' +
                                        '<span class="checkbox-text-w">' +
                                        '<span class="checkbox-title-w">' +
                                        chk_val +
                                        '</span>' +
                                        '</span>' +
                                        '</label>'
                                })
                            new_checkbox_html +=
                                '</div><div style="display:block;width:100%;height:50px"></div>'
                            get_this()
                                .container.find("label[for='" + chk_id + "']")
                                .replaceWith(new_checkbox_html)
                            jQuery(this).remove()
                        })
                    get_this()
                        .container.find('.appointment-content-screen-active-w')
                        .find('[name="wbk-name"]')
                        .attr('name', 'custname')
                    get_this()
                        .container.find('.appointment-content-screen-active-w')
                        .find('[name="wbk-email"]')
                        .attr('name', 'email')
                    get_this()
                        .container.find('.appointment-content-screen-active-w')
                        .find('[name="wbk-phone"]')
                        .attr('name', 'phone')

                    get_this()
                        .container.find('.appointment-content-screen-active-w')
                        .find(
                            '.wbk-text:not([name="custname"]):not([name="email"]):not([name="phone"]), .wbk-textarea:not([name="wbk-comment"]), .wbk-select:not(.nice-select):not(.wbk-book-quantity)'
                        )
                        .addClass('wbk-custom-field')
                        .removeAttr('id')

                    get_this()
                        .container.find('.appointment-content-screen-active-w')
                        .find('.wbk-text , .wbk-textarea, .wbk-select')
                        .addClass('wbk-input')

                    get_this()
                        .container.find('.appointment-content-screen-active-w')
                        .find('.wbk-file')
                        .each(function () {
                            if (jQuery(this).attr('aria-required') == 'true') {
                                jQuery(this).attr(
                                    'data-validation',
                                    'file_required'
                                )
                            }
                        })

                    get_this()
                        .container.find('.appointment-content-screen-active-w')
                        .find('.wbk-input')
                        .each(function () {
                            if (jQuery(this).attr('aria-required') == 'true') {
                                jQuery(this).attr(
                                    'data-validation',
                                    'not_empty'
                                )
                            }
                        })
                    get_this()
                        .container.find('[name="email"]')
                        .attr('data-validation', 'email')
                    get_this()
                        .container.find('[name="phone"]')
                        .attr('data-validation', 'phone')

                    // custom checkbox processing
                    jQuery('.wbk_input_checkbox_option').change(function () {
                        var check_id = jQuery(this).attr('data-id')
                        if (jQuery(this).attr('data-exclusive') == 'true') {
                            jQuery('input[data-id="' + check_id + '"]')
                                .not(this)
                                .prop('checked', false)
                        }
                        var values = []
                        jQuery('input[data-id="' + check_id + '"]').each(
                            function () {
                                if (jQuery(this).is(':checked')) {
                                    values.push(jQuery(this).attr('value'))
                                }
                            }
                        )
                        values = values.join()
                        jQuery(this)
                            .closest('.wbk_checkbox_container')
                            .find('.wbk_chk_proxy')
                            .val(values)
                        jQuery(this)
                            .closest('.wbk_checkbox_container')
                            .find('.wbk_chk_proxy')
                            .trigger('change')
                    })
                    get_this().track_event('form_rendered',{})
                    jQuery(document).trigger('wbk_form_rendered')

                    this.set_input_events()

                    // custom data processing
                    get_this()
                        .container.find('[name="wbk-comment"]')
                        .attr('name', 'comment')

                    get_this()
                        .container.find('.wbk-custom-field')
                        .on('change', function () {
                            get_this().set_agrigated_custom_field()
                        })

                    this.container
                        .find('.wbk-input')
                        .not('[name="custname"]')
                        .not('[name="email"]')
                        .not('[name="phone"]')
                        .not('.wbk_not_change_amount')
                        .change(function () {
                            get_this().update_amount()
                        })

                    get_this()
                        .container.find('.wbk-custom-field')
                        .trigger('change')

                    get_this().set_multiple_data()

                    if (wbkl10n.phoneformat.trim() != '') {
                        get_this()
                            .container.find('[name="phone"]')
                            .mask(wbkl10n.phoneformat, {
                                clearIfNotMatch: true,
                            })
                    }
                    get_this().update_amount()
                    get_this().validate_form()
                    return
                    break
                case 'wbk_book':
                    if (
                        this.container
                            .find('.appointment-content-screen-active-w')
                            .attr('data-slug') == 'payment_optional' ||
                        this.container
                            .find('.appointment-content-screen-active-w')
                            .attr('data-slug') == 'payment'
                    ) {
                        if (response.redirect) {
                            window.location.href = response.redirect
                            return
                        }
                        this.container
                            .find('.appointment-content-screen-active-w')
                            .append(response.thanks_message)
                        get_this().initiaize_payments()
                    }
                    break
            }

            this.validate_form()
        }, '100')
    }

    initiaize_payments() {
        const get_this = () => {
            return this
        }

        this.container.find('.button-prev-wbk').remove()
        this.container
            .find('.button-next-wbk')
            .html(
                wbkl10n.continue +
                    '<span class="btn-ring-wbk" style="opacity: 0;"></span>'
            )
        this.container
            .find('.button-next-wbk')
            .after(
                '<button type="button" style="display:none" class="button-wbk button-approve-stripe-payment" disabled>' +
                    wbkl10n.approve_payment_text +
                    '<span class="btn-ring-wbk" style="opacity: 0;"></span></button>'
            )
        this.container.find('.button-next-wbk').prop('disabled', true)
        get_this().init_scroll_bars()
        this.init_nice_select()

        get_this()
            .container.find('.wbk_coupon_input')
            .on('input', function () {
                if (jQuery(this).val().trim() == '') {
                    get_this()
                        .container.find('.wbk_apply_coupon')
                        .attr('disabled', true)
                } else {
                    get_this()
                        .container.find('.wbk_apply_coupon')
                        .attr('disabled', false)
                }
            })
        get_this()
            .container.find('.wbk_apply_coupon')
            .click(function () {
                get_this().apply_coupon()
            })

        get_this()
            .container.find('[name="payment-method"')
            .change(function () {
                var method = jQuery(this).val()
                get_this()
                    .container.find('.wbk_payment_method_desc')
                    .toggle(false)

                get_this()
                    .container.find('[value="' + method + '"]')
                    .parent()
                    .siblings('.wbk_payment_method_desc')
                    .slideToggle()

                if (method == 'stripe') {
                    get_this().container.find('.button-next-wbk').toggle(false)
                    get_this()
                        .container.find('.button-approve-stripe-payment')
                        .toggle(true)

                    if (
                        get_this().container.find('.StripeElement').length == 0
                    ) {
                        var style = {
                            base: {
                                lineHeight: '50px',
                                color: '#000',
                                fontSize: '16px',
                            },
                        }
                        var locale = jQuery('html').attr('lang')
                        if (typeof locale == 'undefined') {
                            locale = 'en'
                        }
                        if (locale.length > 2) {
                            locale = locale.slice(0, 2)
                        }
                        get_this().stripe = Stripe(wbkl10n.stripe_public_key)
                        var elements = get_this().stripe.elements()
                        var stripe_hide_postal =
                            wbkl10n.stripe_hide_postal == 'true'
                        get_this().card = elements.create('card', {
                            style: style,
                            hidePostalCode: stripe_hide_postal,
                        })
                        get_this().card.mount('#card-element')
                        get_this().card.addEventListener(
                            'change',
                            function (event) {
                                if (event.error) {
                                    get_this()
                                        .container.find('#card-errors')
                                        .html(event.error.message)
                                } else {
                                    get_this()
                                        .container.find('#card-errors')
                                        .html('')
                                }
                                if (event.complete) {
                                    get_this().validate_stripe_input(true)
                                } else {
                                    get_this().validate_stripe_input(false)
                                }
                            }
                        )
                        get_this().container.find('')
                    }
                } else {
                    get_this().container.find('.button-next-wbk').toggle(true)
                    get_this()
                        .container.find('.button-approve-stripe-payment')
                        .toggle(false)
                }
            })

        get_this()
            .container.find('.button-approve-stripe-payment')
            .click(function () {
                var valid = true
                var wbk_stripe_fields = {}
                var wbk_stripe_address = {}
                var details_provided = false
                jQuery('.wbk-stripe-additional-field')
                    .not('.nice-select')
                    .each(function () {
                        if (jQuery(this).val().trim() == '') {
                            jQuery(this).prev('label').addClass('input-error-w')

                            valid = false
                        }
                        var current_field = jQuery(this).attr('data-field')
                        if (current_field == 'name') {
                            wbk_stripe_fields[current_field] =
                                jQuery(this).val()
                        } else {
                            details_provided = true
                            wbk_stripe_address[current_field] =
                                jQuery(this).val()
                        }
                    })
                if (!valid) {
                    return false
                }
                if (details_provided) {
                    wbk_stripe_fields['address'] = wbk_stripe_address
                }
                jQuery(this).replaceWith('<div class="wbk_loader_old"></div>')

                get_this()
                    .stripe.createPaymentMethod('card', get_this().card, {
                        billing_details: wbk_stripe_fields,
                    })
                    .then(function (result) {
                        if (result.error) {
                            get_this().change_button_status(
                                get_this().container.find(
                                    '.button-approve-stripe-payment'
                                ),
                                'regular'
                            )
                            get_this().show_error(result.error.message)
                        } else {
                            get_this()
                                .container.find('.wbk_stripe_payment_method_id')
                                .val(result.paymentMethod.id)

                            get_this().stripe_process_payment()
                        }
                    })

                return false
            })

        if (get_this().container.find('[name="payment-method"').length == 1) {
            get_this().container.find('[name="payment-method"').trigger('click')
        }

        if (get_this().container.find('[name="payment-method"').length == 0) {
            jQuery('.button-next-wbk').remove()
            return
        }

        this.set_input_events()
        get_this().track_event('payment_methods_shown',{})
        jQuery(document).trigger('wbk_payment_initialized')
        get_this().validate_form()
    }

    async apply_coupon() {
        var btn = this.container.find('.wbk_apply_coupon')
        this.change_button_status(btn, 'loading')

        var response = await this.do_request('wbk_apply_coupon')
        if (response == false) {
            this.show_error('An unexpected error occoured.')
            return
        }
        response = jQuery.parseJSON(response)
        if (response.status == 'fail') {
            this.show_error(response.description)
            return
        }
        if (response.status == 'payment_complete') {
            this.finalize(response)
        }
        this.change_button_status(btn, 'regular')
        if (response.status == 'applied') {
            this.container
                .find('.payment-details-wrapper-w')
                .replaceWith(response.payment_card)
        }
    }

    async update_amount() {
        if (this.container.find('.wbk_quantities option').length == 0) {
            return
        }
        var valid = true
        this.container.find('.wbk_quantities option').each(function () {
            if (jQuery(this).val() == 0) {
                valid = false
            }
        })
        if (!valid) {
            return
        }
        if (this.container.find('.payment-details-wrapper-w').length == 0) {
            if (this.container.find('.wbk_dynamic_total').length == 0) {
                this.set_step_subtitle('payment_optional', [
                    '<span class="wbk_loader_s"></span>',
                ])
                this.set_step_subtitle('payment', [
                    '<span class="wbk_loader_s"></span>',
                ])
            } else {
                this.container
                    .find('.wbk_dynamic_total')
                    .replaceWith('<span class="wbk_loader_s"></span>')
            }
            var amount_token = Math.random().toString(36).substr(2)
            jQuery('.wbk_amount_update_token').val(amount_token)
            jQuery('.appointment-content-wbk').attr(
                'data-amount-token',
                amount_token
            )
            var response = await this.do_request('wbk_calculate_amounts')
            if (response == false) {
                this.show_error('An unexpected error occoured.')
                return
            }
            response = jQuery.parseJSON(response)
            if (response.status == 'fail') {
                this.show_error(response.description)
                return
            }
            if (
                response.amount_token ==
                jQuery('.appointment-content-wbk').attr('data-amount-token')
            ) {
                this.container
                    .find('.wbk_loader_s')
                    .replaceWith(
                        '<span class="wbk_dynamic_total">' +
                            response.total_formated +
                            '</span>'
                    )
            }
            this.container
                .find('.wbk_form_label_total')
                .html(response.total_formated)
        } else {
            this.remove_step_subtitle('payment_optional')
            this.remove_step_subtitle('payment')
        }
    }

    async stripe_process_payment() {
        const get_this = () => {
            return this
        }
        var response = await this.do_request('wbk_approve_payment')
        if (response == false) {
            get_this().change_button_status(
                get_this().container.find('.button-approve-stripe-payment'),
                'regular'
            )
            this.show_error('An unexpected error occoured.')
            return
        }
        response = jQuery.parseJSON(response)
        if (response.status == 'fail') {
            get_this().change_button_status(
                get_this().container.find('.button-approve-stripe-payment'),
                'regular'
            )
            this.show_error(response.description)
            return
        }
        if (response.status == 'success') {
            if (parseInt(response.result[0]) == 1) {
                if (response.result.thanks_message != '') {
                    this.finalize(response.result)
                }
                if (response.result.url != '') {
                    window.location.href = response.result.url
                }
            } else {
                this.stripe
                    .handleCardAction(response.result[1])
                    .then((result) => {
                        if (result.error) {
                            this.show_error(result.error)
                            get_this().change_button_status(
                                get_this().container.find(
                                    '.button-approve-stripe-payment'
                                ),
                                'regular'
                            )
                        } else {
                            get_this()
                                .container.find('.wbk_stripe_payment_intent_id')
                                .val(result.paymentIntent.id)

                            get_this()
                                .container.find('.wbk_stripe_payment_method_id')
                                .val('')
                            this.stripe_process_payment()
                        }
                    })
            }
        }
        if (response.status == 'fail') {
            get_this().change_button_status(
                get_this().container.find('.button-approve-stripe-payment'),
                'regular'
            )
            this.show_error(response.result[1])
        }
    }

    remove_step_subtitle(slug) {
        this.container
            .find(".appointment-status-list-w li[data-slug='" + slug + "']")
            .find('.subtitle-list-w')
            .remove()
    }

    set_step_subtitle(slug, list) {
        this.remove_step_subtitle(slug)
        var html = '<ul class="subtitle-list-w" style="display:none;">'
        jQuery.each(list, function (index, value) {
            html += '<li>' + value + '</li>'
        })
        html += '</ul>'
        this.container
            .find(".appointment-status-list-w li[data-slug='" + slug + "']")
            .find('.text-w')
            .append(html)
        this.container
            .find(".appointment-status-list-w li[data-slug='" + slug + "']")
            .find('.text-w')
            .find('ul')
            .slideToggle()
    }

    init_scroll_bars() {
        if (
            this.container
                .find('.appointment-content-screen-active-w')
                .attr('data-request') == 'wbk_render_booking_form'
        ) {
            if (
                this.container
                    .find('.appointment-content-screen-active-w')
                    .find('.nice-select').length > 0 &&
                wbkl10n.disable_details_scroll == 'true' &&
                this.container
                    .find('.appointment-content-screen-active-w')
                    .find('.nice-select')
                    .attr('data-slug') == 'form'
            ) {
                jQuery('.appointment-content-scroll-wbk').css('height', 'auto')
                if (jQuery('.wbk_custom_form_spacer').length == 0) {
                    jQuery('.appointment-content-scroll-wbk').append(
                        '<div class="wbk_custom_form_spacer"></div>'
                    )
                }
                return
            }
        }
        if (!this.check_mobile()) {
            jQuery('.appointment-content-scroll-wbk').css('height', '555px')
        }
        Scrollbar.initAll({ alwaysShowTracks: true, damping: 0.5 })
    }

    async search_time_slots() {      
        const get_this = () => {
            return this
        }
        get_this().track_event('search_time_slots',{})
        if (wbkl10n.multi_booking != 'enabled') {
            this.deselect_all_slots()
        }
        this.container.find('.dynamic-slots-w').remove()
        this.container
            .find('.appointment-content-scroll-wbk')
            .append('<div class="wbk-loading"></div>')
        var response = await this.do_request('wbk_search_time')
        if (response == false) {
            this.show_error('An unexpected error occoured.')
            return
        }
        if (response.status == 'fail') {
            this.show_error(response.description)
            return
        }
        response = jQuery.parseJSON(response)
        this.container.find('.wbk-loading').remove()
        Scrollbar.destroyAll()
        this.container
            .find('.appointment-content-screen-active-w')
            .append(
                '<div class="dynamic-slots-w dynamic-content-w">' +
                    response.data +
                    '</div>'
            )
        get_this().select_time_slots_by_list()
        get_this().init_scroll_bars()

        this.container.find('.timeslot_radio-w').click(function () {
            var time = jQuery(this)
                .closest('label')
                .find('.time-w')
                .attr('data-start')
            var service_id = jQuery(this)
                .closest('label')
                .find('.time-w')
                .attr('data-service')
            var time_string =
                jQuery(this)
                    .closest('label')
                    .find('.time-w')
                    .attr('data-server-date') +
                ' ' +
                jQuery(this)
                    .closest('label')
                    .find('.time-w')
                    .attr('data-server-time')
            var time_string_local =
                jQuery(this)
                    .closest('label')
                    .find('.time-w')
                    .attr('data-local-date') +
                ' ' +
                jQuery(this)
                    .closest('label')
                    .find('.time-w')
                    .attr('data-local-time')
            get_this().select_time_slot(
                time,
                time_string,
                time_string_local,
                service_id
            )
        })
        jQuery(document).trigger('wbk_after_time_slots_search', [response])
        this.container.find('.appointment-content-screen-active-w')
        if (this.container.find('.time-w').length > 0) {
            if (
                this.container
                    .find('.time-w')
                    .first()
                    .attr('data-server-time') !=
                this.container.find('.time-w').first().attr('data-local-time')
            ) {
                this.container
                    .find('.wbl_local_time_switcher')
                    .removeClass('wbk_hidden')
            }
            this.container.find('.wbk_local_time_checkbox').change(function () {
                const checked = jQuery(this).is(':checked')
                get_this().switch_local_time(checked)
                get_this().render_selected_time_slots_list()
            })
            var checked = get_this()
                .container.find('.wbk_local_time_checkbox')
                .is(':checked')

            if (!checked && wbkl10n.local_time_by_default == 'true') {
                this.container.find('.wbk_local_time_checkbox').trigger('click')
                checked = true
            }

            get_this().switch_local_time(checked)
            get_this().render_selected_time_slots_list()
        }
    }
    switch_local_time(state) {
        if (state) {
            this.container.find('.time-w').each(function () {
                jQuery(this)
                    .find('.wbk_time_slot_time_string')
                    .html(jQuery(this).attr('data-local-time'))
            })
        } else {
            this.container.find('.time-w').each(function () {
                jQuery(this)
                    .find('.wbk_time_slot_time_string')
                    .html(jQuery(this).attr('data-server-time'))
            })
        }
    }

    deselect_all_slots() {
        this.container.find('.wbk_times > option').remove()
        this.container.find('.wbk_services_final > option').remove()
        this.render_selected_time_slots_list()
    }

    deselect_time_slot(timestamp, service_id, check_consecutive = true) {
        const get_this = () => {
            return this
        }
        this.container.find('.wbk_times > option').each(function () {
            if (
                jQuery(this).attr('value') == timestamp &&
                jQuery(this).attr('data-service') == service_id
            ) {
                jQuery(this).remove()
            }
        })
        this.container.find('.wbk_services_final > option').each(function () {
            if (
                jQuery(this).attr('value') == service_id &&
                jQuery(this).attr('data-time') == timestamp
            ) {
                jQuery(this).remove()
            }
        })
        this.container.find('.time-w').each(function () {
            if (
                jQuery(this).attr('data-start') == timestamp &&
                jQuery(this).attr('data-service') == service_id
            ) {
                jQuery(this)
                    .closest('label')
                    .find('.timeslot_radio-w')
                    .prop('checked', false)
            }
        })

        this.render_selected_time_slots_list()

        if (check_consecutive) {
            var consecutive_services = get_this().get_consecutive_services()
            if (consecutive_services.includes(service_id)) {
                this.container.find('.wbk_times > option').each(function () {
                    if (
                        jQuery(this).attr('value') > timestamp &&
                        jQuery(this).attr('data-service') == service_id
                    ) {
                        get_this().deselect_time_slot(
                            jQuery(this).attr('value'),
                            service_id,
                            false
                        )
                    }
                })
            }
        }
    }

    select_time_slot(timestamp, time_string, time_string_local, service_id) {
        const get_this = () => {
            return this
        }
        get_this().track_event('time_slot_selected',{})
        var exit = false
        this.container.find('.wbk_times option').each(function () {
            if (
                parseInt(jQuery(this).attr('value')) == parseInt(timestamp) &&
                parseInt(jQuery(this).attr('data-service')) ==
                    parseInt(service_id)
            ) {
                exit = true
                return
            }
        })
        if (exit) {
            return
        }

        if (wbkl10n.multi_booking != 'enabled') {
            this.deselect_all_slots()
        }
        this.container
            .find('.wbk_times')
            .append(
                '<option  data-time_string_local="' +
                    time_string_local +
                    '" data-time_string="' +
                    time_string +
                    '" data-service="' +
                    service_id +
                    '" value="' +
                    timestamp +
                    '" >' +
                    time_string +
                    '</option>'
            )
        this.container
            .find('.wbk_services_final')
            .append(
                '<option data-time="' +
                    timestamp +
                    '" value="' +
                    service_id +
                    '" >' +
                    service_id +
                    '</option>'
            )
        this.container.find('.wbk_times option').prop('selected', true)
        this.container.find('.wbk_times').trigger('change')

        this.container.find('.wbk_services_final option').prop('selected', true)
        this.container.find('.wbk_services_final').trigger('change')

        this.render_selected_time_slots_list()
        if (wbkl10n.auto_next == 'enabled') {
            this.container.find('.button-next-wbk').trigger('click')
        }
    }
    select_time_slots_by_list() {
        const get_this = () => {
            return this
        }
        this.container
            .find('.wbk_times > option')
            .not('.nice-select > option')
            .each(function () {
                var service_id = jQuery(this).attr('data-service')
                var time = jQuery(this).attr('value')
                jQuery(
                    '.time-w[data-service="' +
                        service_id +
                        '"][data-start="' +
                        time +
                        '"]'
                )
                    .closest('label')
                    .find('.timeslot_radio-w')
                    .prop('checked', true)
            })

        get_this().add_class_for_seleced_slots()
        get_this().render_selected_time_slots_list()
    }

    add_class_for_seleced_slots() {
        this.container.find('.timeslot_radio-w').each(function () {
            if (jQuery(this).is(':checked')) {
                jQuery(this)
                    .siblings('.radio-time-block-w')
                    .addClass('wb_slot_checked')
            } else {
                jQuery(this)
                    .siblings('.radio-time-block-w')
                    .removeClass('wb_slot_checked')
            }
        })
    }
    get_consecutive_services() {
        const get_this = () => {
            return this
        }
        var services = []
        if (get_this().is_multi_service()) {
            get_this()
                .container.find('.wbk_services')
                .each(function () {
                    if (jQuery(this).is(':checked')) {
                        var attr = jQuery(this).attr('data-consecutive')
                        if (
                            typeof attr !== typeof undefined &&
                            attr !== false
                        ) {
                            if (attr == 'yes') {
                                services.push(jQuery(this).val())
                            }
                        }
                    }
                })
        } else {
            var attr = get_this()
                .container.find('.wbk_services[type="radio"]:checked')
                .attr('data-consecutive')
            if (typeof attr !== typeof undefined && attr !== false) {
                if (attr == 'yes') {
                    services.push(
                        get_this()
                            .container.find(
                                '.wbk_services[type="radio"]:checked'
                            )
                            .val()
                    )
                }
            }
        }
        if (jQuery('.wbk_services_hidden').length > 0) {
            jQuery('.wbk_services_hidden option').each(function () {
                if (jQuery(this).attr('data-consecutive') == 'yes') {
                    services.push(jQuery(this).attr('value'))
                }
            })
        }
        return services
    }
    get_limited_services() {
        const get_this = () => {
            return this
        }
        var services = []
        if (get_this().is_multi_service()) {
            get_this()
                .container.find('.wbk_services')
                .each(function () {
                    if (jQuery(this).is(':checked')) {
                        if (
                            jQuery(this).attr('data-min') != '' ||
                            jQuery(this).attr('data-max') != ''
                        ) {
                            if (
                                jQuery(this).attr('data-min') == '0' &&
                                jQuery(this).attr('data-max') == '0'
                            ) {
                            } else {
                                services.push(jQuery(this).val())
                            }
                        }
                    }
                })
        } else {
            if (
                get_this()
                    .container.find('.wbk_services[type="radio"]:checked')
                    .attr('data-min') != '' ||
                get_this()
                    .container.find('.wbk_services[type="radio"]:checked')
                    .attr('data-max') != ''
            ) {
                if (
                    get_this()
                        .container.find('.wbk_services[type="radio"]:checked')
                        .attr('data-min') == '0' &&
                    get_this()
                        .container.find('.wbk_services[type="radio"]:checked')
                        .attr('data-max') == '0'
                ) {
                } else {
                    services.push(
                        get_this()
                            .container.find(
                                '.wbk_services[type="radio"]:checked'
                            )
                            .val()
                    )
                }
            }
        }
        return services
    }
    get_service_min_limit(service_id) {
        return this.container
            .find('.wbk_services[value="' + service_id + '"]')
            .attr('data-min')
    }
    get_service_max_limit(service_id) {
        return this.container
            .find('.wbk_services[value="' + service_id + '"]')
            .attr('data-max')
    }

    get_selected_slots_count(service_id) {
        const get_this = () => {
            return this
        }
        var count = 0
        this.container
            .find('.wbk_times > option')
            .not('.nice-select > option')
            .each(function () {
                if (jQuery(this).attr('data-service') == service_id) {
                    count++
                }
            })
        return count
    }

    disable_time_slots_by_service(service_id) {
        this.container
            .find('.time-w[data-service=' + service_id + ']')
            .closest('label')
            .find('.timeslot_radio-w')
            .prop('disabled', true)
        this.container
            .find('.time-w[data-service=' + service_id + ']')
            .addClass('wbk_slot_locked_by_limit')
    }
    enable_time_slots_by_service(service_id) {
        this.container
            .find('.wbk_slot_locked_by_limit[data-service=' + service_id + ']')
            .not('.wbk_disabled_by_consecutive_rule')
            .closest('label')
            .find('.timeslot_radio-w')
            .prop('disabled', false)
    }

    apply_consecutive_time_slots(service_id) {
        var min_slot = 999999
        var max_slot = -1

        this.container
            .find('.time-w[data-service=' + service_id + ']')
            .each(function () {
                if (
                    jQuery(this)
                        .closest('label')
                        .find('.timeslot_radio-w')
                        .is(':checked')
                ) {
                    var current_index = parseInt(
                        jQuery(this).attr('data-index')
                    )
                    if (current_index < min_slot) {
                        min_slot = current_index
                    }
                    if (current_index > max_slot) {
                        max_slot = current_index
                    }
                }
            })

        if (max_slot != -1) {
            this.container
                .find('.time-w[data-service=' + service_id + ']')
                .each(function () {
                    var current_index = parseInt(
                        jQuery(this).attr('data-index')
                    )
                    if (
                        min_slot - current_index == 1 ||
                        current_index - max_slot == 1
                    ) {
                        jQuery(this)
                            .closest('label')
                            .find('.timeslot_radio-w')
                            .prop('disabled', false)
                    } else {
                        jQuery(this)
                            .closest('label')
                            .find('.timeslot_radio-w')
                            .prop('disabled', true)
                        jQuery(this).addClass(
                            'wbk_disabled_by_consecutive_rule'
                        )
                    }
                })
        } else {
            this.container
                .find('.time-w[data-service=' + service_id + ']')
                .each(function () {
                    if (
                        jQuery(this).hasClass(
                            'wbk_disabled_by_consecutive_rule'
                        )
                    ) {
                        jQuery(this)
                            .closest('label')
                            .find('.timeslot_radio-w')
                            .prop('disabled', false)
                        jQuery(this).removeClass(
                            'wbk_disabled_by_consecutive_rule'
                        )
                    }
                })
        }
    }

    render_selected_time_slots_list() {
        const get_this = () => {
            return this
        }

        var consecutive_services = get_this().get_consecutive_services()
        consecutive_services.forEach((service_id) => {
            get_this().apply_consecutive_time_slots(service_id)
        })

        var limit_info = '<ul class="wbk_service_limit_label">'
        var services = get_this().get_limited_services()
        services.forEach((service_id) => {
            var min = get_this().get_service_min_limit(service_id)
            var max = get_this().get_service_max_limit(service_id)
            if (min == '') {
                if (get_this().is_multi_service()) {
                    min = '0'
                } else {
                    min = '1'
                }
            }
            if (max == '') {
                max = '∞'
            }
            var service_label = wbkl10n.multi_limit_service_label
            if (service_label === undefined) {
                service_label = ''
            }
            var service_name = ''
            if (!get_this().is_multi_service()) {
                service_name = get_this().get_service_name_by_id(service_id)
            } else {
                service_name =
                    get_this().get_multi_service_name_by_id(service_id)
            }
            if (service_name !== undefined) {
                var count = get_this().get_selected_slots_count(service_id)
                service_label = service_label.replace(
                    '#service_name',
                    '<strong>' + service_name.trim() + '</strong>'
                )
                service_label = service_label.replace('#min', min)
                service_label = service_label.replace('#max', max)
                service_label = service_label.replace('#selected_count', count)

                limit_info += '<li>' + service_label + '</li>'
                if (count >= max) {
                    get_this().disable_time_slots_by_service(service_id)
                } else {
                    get_this().enable_time_slots_by_service(service_id)
                }
            }
        })
        limit_info += '</ul>'
        jQuery('.wbk_limit_info').html(limit_info)

        this.container.find('.details-list-w > li').remove()
        this.container
            .find('.wbk_times > option')
            .not('.nice-select > option')
            .each(function () {
                var service_id = jQuery(this).attr('data-service')
                var time = jQuery(this).attr('value')

                const checked = get_this()
                    .container.find('.wbk_local_time_checkbox')
                    .is(':checked')

                var date_time_string = ''
                if (checked) {
                    date_time_string = jQuery(this).attr(
                        'data-time_string_local'
                    )
                } else {
                    date_time_string = jQuery(this).attr('data-time_string')
                }
                var service_name = ''
                if (get_this().is_multi_service()) {
                    service_name =
                        get_this().get_multi_service_name_by_id(service_id) +
                        ' '
                }

                get_this()
                    .container.find('.details-list-w')
                    .append(
                        '<li><span class="details-item-text-w">' +
                            service_name +
                            date_time_string +
                            '</span><span data-service="' +
                            service_id +
                            '" data-time="' +
                            time +
                            '" class="block-close-wb"></span></li>'
                    )
                get_this()
                    .container.find('.block-close-wb')
                    .last()
                    .unbind('click')
                get_this()
                    .container.find('.block-close-wb')
                    .last()
                    .click(function () {
                        get_this().deselect_time_slot(time, service_id)
                    })
            })
        this.add_class_for_seleced_slots()
        this.validate_form()
    }
    set_multiple_data() {
        const get_this = () => {
            return this
        }
        this.container.find('.wbk_quantities option').remove()
        this.container.find('.wbk_services_per_slot option').remove()

        var qty_html = ''
        var services_html = ''
        this.container.find('.wbk_times option').each(function () {
            var service_id = jQuery(this).attr('data-service')
            var timestamp = jQuery(this).attr('value')
            var quantity_for_service = get_this()
                .container.find(
                    '.wbk-book-quantity[data-service=' + service_id + ']'
                )
                .val()

            qty_html +=
                '<option value="' +
                quantity_for_service +
                '">' +
                quantity_for_service +
                '</option>'
            services_html +=
                '<option value="' + service_id + '">' + service_id + '</option>'
        })

        this.container.find('.wbk_quantities').html(qty_html)
        this.container.find('.wbk_services_per_slot').html(services_html)
        this.container.find('.wbk_quantities option').prop('selected', true)
        this.container
            .find('.wbk_services_per_slot option')
            .prop('selected', true)
    }
    prepare_service_data_init(response) {
        const get_this = () => {
            return this
        }

        var disability_result = []
        disability_result.push(true)
        var range_min = undefined
        var range_max = undefined
        var initial_date = undefined
        var allowed_timestamps = []

        this.disabled_dates = response.disabilities.split(';')
        this.disabled_days_of_week = response.week_disabilities

        this.disabled_dates_horizontal = []
        var last_date = new Date()
        last_date.setDate(last_date.getDate() + 360)

        for (var d = new Date(); d <= last_date; d.setDate(d.getDate() + 1)) {
            var date_string =
                d.getFullYear() + ',' + d.getMonth() + ',' + d.getDate()
            if (!this.disabled_dates.includes(date_string)) {
                this.disabled_dates_horizontal.push(
                    d.getFullYear() +
                        '/' +
                        ('0' + (d.getMonth() + 1)).slice(-2) +
                        '/' +
                        ('0' + d.getDate()).slice(-2)
                )
            }
        }

        if (response.disabilities != '') {
            var day_disabilities_all = response.disabilities.split(';')
            var index
            for (index = 0; index < day_disabilities_all.length; index++) {
                var disablity_current_day =
                    day_disabilities_all[index].split(',')
                disability_result.push(disablity_current_day)
                var converte_date = new Date(
                    disablity_current_day[0],
                    disablity_current_day[1],
                    disablity_current_day[2],
                    0,
                    0,
                    0
                )
                allowed_timestamps.push(converte_date.getTime())
            }
            if (disability_result.length > 1) {
                initial_date = disability_result[1]
            }
        }

        if (response.limits != '') {
            var date_range = response.limits.split('-')

            range_min = date_range[0].split(',')
            range_min[0] = parseInt(range_min[0])
            range_min[1] = parseInt(range_min[1]) - 1
            range_min[2] = parseInt(range_min[2])

            range_max = date_range[1].split(',')
            range_max[0] = parseInt(range_max[0])
            range_max[1] = parseInt(range_max[1]) - 1
            range_max[2] = parseInt(range_max[2])

            var range_start = new Date(range_min[0], range_min[1], range_min[2])
            var range_end = new Date(range_max[0], range_max[1], range_max[2])
            var now = new Date()

            if (range_start < now) {
                range_min[0] = now.getFullYear()
                range_min[1] = now.getMonth()
                range_min[2] = now.getDate()
            }
        }
        if (this.is_ios()) {
            disability_result = response.week_disabilities
        }

        var date_html = this.container.find('.wbk_date').prop('outerHTML')

        this.container.find('.wbk_date').replaceWith(date_html)
        this.container.find('[name="date"]').remove()
        var fixed_startofweek = 0
        if (!this.is_ios()) {
            fixed_startofweek = wbkl10n.startofweek
        }

        this.date_input = this.container.find('.wbk_date').pickadate({
            min: true,
            monthsFull: [
                wbkl10n.january,
                wbkl10n.february,
                wbkl10n.march,
                wbkl10n.april,
                wbkl10n.may,
                wbkl10n.june,
                wbkl10n.july,
                wbkl10n.august,
                wbkl10n.september,
                wbkl10n.october,
                wbkl10n.november,
                wbkl10n.december,
            ],
            monthsShort: [
                wbkl10n.jan,
                wbkl10n.feb,
                wbkl10n.mar,
                wbkl10n.apr,
                wbkl10n.mays,
                wbkl10n.jun,
                wbkl10n.jul,
                wbkl10n.aug,
                wbkl10n.sep,
                wbkl10n.oct,
                wbkl10n.nov,
                wbkl10n.dec,
            ],
            weekdaysFull: [
                wbkl10n.sunday,
                wbkl10n.monday,
                wbkl10n.tuesday,
                wbkl10n.wednesday,
                wbkl10n.thursday,
                wbkl10n.friday,
                wbkl10n.saturday,
            ],
            weekdaysShort: [
                wbkl10n.sun,
                wbkl10n.mon,
                wbkl10n.tue,
                wbkl10n.wed,
                wbkl10n.thu,
                wbkl10n.fri,
                wbkl10n.sat,
            ],
            today: wbkl10n.today,
            clear: wbkl10n.clear,
            close: wbkl10n.close,
            firstDay: parseInt(fixed_startofweek),
            format: wbkl10n.picker_format,
            disable: disability_result,
            labelMonthNext: wbkl10n.nextmonth,
            labelMonthPrev: wbkl10n.prevmonth,
            formatSubmit: 'yyyy/mm/dd',
            hiddenPrefix: 'wbk-date',
            onOpen: function () {
                jQuery('.wbk_date').removeClass('linear-animation-w')
                if (range_min != undefined) {
                    this.set('highlight', range_min)
                } else {
                    if (initial_date != undefined) {
                        this.set('highlight', initial_date)
                    }
                }
            },
            onRender: function () {
                jQuery('.picker__day').addClass('picker__day--disabled')
                jQuery('.picker__day').each(function () {
                    var current_pick = jQuery(this).attr('data-pick')
                    var elem = jQuery(this)
                    jQuery.each(allowed_timestamps, function (key, value) {
                        if (value == current_pick) {
                            elem.removeClass('picker__day--disabled')
                        }
                    })
                })
                jQuery(document).trigger('wbk_picker_on_render', [response])
            },
            onClose: function () {
                jQuery(document.activeElement).blur()
            },
            onSet: function (thingSet) {
                if (typeof thingSet.select != 'undefined') {
                    get_this().add_horizontal_calendar()
                    get_this().search_time_slots()
                } else {
                    if (
                        get_this()
                            .container.find('[name="date_formated"]')   
                            .val() == ''
                    ) {
                        get_this().hide_horizontal_calendar()
                    }
                }
            },
        })

        jQuery('input[name="wbk-datedate_formated_submit"]').addClass(
            'wbk-input'
        )
        jQuery('input[name="wbk-datedate_formated_submit"]').attr(
            'name',
            'date'
        )
        jQuery('input[name="date"]').attr('data-validation', 'not_empty')

        var open_calendar = true
        if (range_min != undefined) {
            var picker = this.date_input.pickadate('picker')
            picker.set('min', range_min)
            picker.set('max', range_max)

            if (
                range_min[0] == range_max[0] &&
                range_min[1] == range_max[1] &&
                range_min[2] == range_max[2]
            ) {
                picker.set('select', range_min)
                open_calendar = false
            }
        }
        if (open_calendar) {
            this.container.find('.wbk_date').trigger('click')
        }
        if (wbkl10n.wbk_automatically_select_today == 'true') {
            var picker = get_this().date_input.pickadate('picker')
            picker.set('select', new Date())
            picker.close(true)
        }

        jQuery('#calendar-horizontal-w button').click(function (e) {
            e.preventDefault()
        })
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

    remove_status_bar_item(slug) {
        this.container
            .find('.appointment-status-list-w')
            .find('[data-slug="' + slug + '"]')
            .remove()
    }

    add_horizontal_calendar() {
        const get_this = () => {
            return this
        }
        this.container.find('.wbk_horizontal_calendar_container').html('')
        var id =
            'horizontal_calendar_' +
            (Math.random() + 1).toString(36).substring(7)
        this.container
            .find('.wbk_horizontal_calendar_container')
            .append('<div class="calendar-horizontal-w" id="' + id + '"></div>')

        var locale = jQuery('html').attr('lang')
        if (typeof locale == 'undefined') {
            locale = 'en'
        }
        if (locale == '') {
            locale = 'en'
        }

        if (locale.length > 2) {
            locale = locale.slice(0, 2)
        }
        this.container.find('#' + id).rescalendar({
            id: id,
            format: 'YYYY/MM/DD',
            refDate: get_this().container.find('[name="date"]').val(),
            calSize: 5,
            jumpSize: 0,
            disabledDays: this.disabled_dates_horizontal,
            dataKeyField: 'name',
            dataKeyValues: ['item1'],
            locale: locale,
        })
        this.container
            .find('.wbk_horizontal_calendar_container')
            .removeClass('wbk_fade_out')
        this.container
            .find('.wbk_horizontal_calendar_container')
            .addClass('wbk_fade_in')
        this.container.find('.move_to_yesterday').attr('type', 'button')
        this.container.find('.move_to_tomorrow').attr('type', 'button')
        this.container.find('.move_to_tomorrow').click(function () {
            get_this().set_horizontal_calendar_event()
            get_this()
                .container.find('.rescalendar_day_cells')
                .find('.day_cell')
                .first()
                .trigger('click')
        })

        this.container.find('.move_to_yesterday').click(function () {
            get_this().set_horizontal_calendar_event()
            get_this()
                .container.find('.rescalendar_day_cells')
                .find('.day_cell')
                .first()
                .trigger('click')
        })
        this.set_horizontal_calendar_event()
    }
    set_horizontal_calendar_event() {
        const get_this = () => {
            return this
        }
        
        this.container.find('.day_cell').click(function (e) {
            if (jQuery(this).hasClass('disabledDay')) {
                e.preventDefault()
                return
            }
            if(jQuery('.wbk-loading').length > 0){
                e.preventDefault() 
                return
            }
            get_this().set_horizontal_calendar_event()
            var horizontal_value = jQuery(this)
                .closest('.day_cell')
                .attr('data-celldate')
            horizontal_value = horizontal_value.split('/')
            var new_date = new Date(
                horizontal_value[0],
                horizontal_value[1] - 1,
                horizontal_value[2]
            )

            var picker = get_this().date_input.pickadate('picker')
            picker.set('select', new_date)
        })
    }

    hide_horizontal_calendar() {
        this.container
            .find('.wbk_horizontal_calendar_container')
            .addClass('wbk_fade_out')
        this.container
            .find('.wbk_horizontal_calendar_container')
            .removeClass('wbk_fade_in')
    }

    add_status_bar_item(num, title, slug) {
        var html = '<li data-slug=' + slug + '>'
        html += '<div class="circle__box-w">'
        html += ' <div class="circle__wrapper-w circle__wrapper--right-w">'
        html += '<div class="circle__whole-w circle__right-w"></div>'
        html += '</div><div class="circle__wrapper-w circle__wrapper--left-w">'
        html += '<div class="circle__whole-w circle__left-w"></div>'
        html += '</div><div class="circle-digit-w">'
        html += num
        html += '</div>'
        html += '</div>'
        html +=
            '<div class="text-w"><div class="text-title-w">' +
            title +
            '</div></div></li>'
        this.container.find('.appointment-status-list-w').append(html)
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
        jQuery('.wbk-select').niceSelect('destroy')
        jQuery('.wbk-select').niceSelect()
    }

    get_next_screen() {
        return this.container
            .find('.appointment-content-screen-active-w')
            .nextAll('.appointment-content-screen-w')
            .first()
    }
    get_prev_screen() {
        return this.container
            .find('.appointment-content-screen-active-w')
            .prevAll('.appointment-content-screen-w')
            .first()
    }

    do_request(action) {
        return new Promise((resolve) => {
            var form_data = new FormData(this.container.find('form')[0])
            var offset = new Date().getTimezoneOffset()
            var time_zone_client =
                Intl.DateTimeFormat().resolvedOptions().timeZone
            if (typeof time_zone_client == 'undefined') {
                time_zone_client = ''
            }
            form_data.append('nonce', wbkl10n.wbkf_nonce)
            form_data.append('offset', offset)
            form_data.append('time_zone_client', time_zone_client)
            form_data.append('action', action)
            var locale = jQuery('html').attr('lang')
            if (typeof locale == 'undefined') {
                locale = 'en-US'
            }
            if (locale == '') {
                locale = 'en-US'
            }
           
            form_data.append('locale', locale)
            var lang = locale
            if (lang.length > 2) {
                lang = lang.slice(0, 2)
            }
            form_data.append('lang', lang)
        
            const result = jQuery.ajax({
                url: wbkl10n.ajaxurl,
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
                complete: function () {},
            })
        })
    }

    mark_checked_services() {
        this.container
            .find('.wbk_service_item')
            .removeClass('wbk_service_item_active')

        this.container.find('.wbk_services').each(function () {
            if (jQuery(this).is(':checked')) {
                jQuery(this)
                    .closest('.wbk_service_item')
                    .addClass('wbk_service_item_active')
            }
        })
    }

    validate_form() {
        const get_this = () => {
            return this
        }
        this.mark_checked_services()
        let passed = false

        this.container
            .find('.appointment-content-screen-active-w')
            .find('.wbk-input, .wbk-file')
            .not('.nice-select')
            .not('[type="radio"]')
            .each(function () {
                if (
                    jQuery(this).closest('[data-class="wpcf7cf_group"]')
                        .length > 0
                ) {
                    if (
                        jQuery(this)
                            .closest('[data-class="wpcf7cf_group"]')
                            .attr('style') == 'display: none;'
                    ) {
                        return
                    }
                }
                const elem = jQuery(this)
                const value = jQuery(this).val()
                const field_name = jQuery(this).attr('data-validationmsg')
                switch (jQuery(this).attr('data-validation')) {
                    case 'file_required':
                        if (jQuery(this).get(0).files.length == 0) {
                            passed = false
                        } else {
                            passed = true
                        }
                        break
                    case 'positive':
                        passed = wbk_check_integer_min_max(value, 1, 99999999)
                        break
                    case 'not_empty':
                        if (jQuery(this).is('select')) {
                            if (
                                jQuery(this)
                                    .find('option:selected')
                                    .is(':first-child')
                            ) {
                                passed = false
                            } else {
                                passed = true
                            }
                        } else {
                            var min = 1
                            var max = 16384
                            var attr = jQuery(this).attr('minlength')
                            if (typeof attr !== 'undefined' && attr !== false) {
                                min = attr
                            }
                            attr = jQuery(this).attr('maxnlength')
                            if (typeof attr !== 'undefined' && attr !== false) {
                                max = attr
                            }
                            passed = wbk_check_string(value, min, max)
                        }
                        break
                    case 'must_have_items':
                        passed = false
                        if (jQuery(this).is('select')) {
                            elem.find('option').each(function () {
                                if (jQuery(this).prop('selected')) {
                                    passed = true
                                }
                            })
                        }
                        if (jQuery(this).is(':checkbox')) {
                            var checkbox_name = jQuery(this).attr('name')
                            var val = jQuery(
                                '[name="' + checkbox_name + '"]'
                            ).each(function () {
                                if (jQuery(this).is(':checked')) {
                                    passed = true
                                }
                            })
                        }
                        break
                    case 'email':
                        passed = wbk_check_email(value)
                        break
                    case 'phone':
                        passed = wbk_check_string(
                            value,
                            wbkl10n.phone_required,
                            30
                        )
                        break
                    default:
                        passed = true
                }

                if (
                    jQuery(this).val() != '' &&
                    passed == false &&
                    !jQuery(this).is(':focus')
                ) {
                    jQuery(this).addClass('input-error-w')
                }
                if (jQuery(this).val() != '' && passed == true) {
                    jQuery(this).removeClass('input-error-w')
                }

                if (!passed) {
                    get_this()
                        .container.find('.button-next-wbk')
                        .prop('disabled', true)
                    if (typeof wbk_external_validation === 'function') {
                        wbk_external_validation(passed)
                    }
                    return passed
                }
            })

        // check if service radio button is present and checked
        if (
            this.container
                .find('.appointment-content-screen-active-w')
                .find('.wbk_services[type="radio"]').length > 0
        ) {
            var radio_val = this.container
                .find('.appointment-content-screen-active-w')
                .find('.wbk_services[type="radio"]:checked')
                .val()

            if (radio_val == undefined) {
                passed = false
            } else {
                passed = true
            }
        }

        // check if payment method radio button is present and checked
        if (
            this.container
                .find('.appointment-content-screen-active-w')
                .find('.payment-method-list-w').length > 0
        ) {
            var radio_val = this.container
                .find('.appointment-content-screen-active-w')
                .find('input[type="radio"]:checked')
                .val()

            if (radio_val == undefined) {
                passed = false
            } else {
                passed = true
            }
        }
        if (typeof wbk_external_validation === 'function') {
            passed = wbk_external_validation(passed)
        }
        // check multi service limits
        if (
            jQuery('.appointment-content-screen-active-w').attr('data-slug') ==
            'date_time'
        ) {
            var services = get_this().get_limited_services()
            services.forEach((service_id) => {
                var min = get_this().get_service_min_limit(service_id)
                var max = get_this().get_service_max_limit(service_id)
                if (min == '') {
                    if (get_this().is_multi_service()) {
                        min = 0
                    } else {
                        min = 1
                    }
                }
                var count = get_this().get_selected_slots_count(service_id)
                if (count < min) {
                    passed = false
                }
            })
        }
        if (!passed) {
            get_this().container.find('.button-next-wbk').prop('disabled', true)
        } else {
            get_this().container.find('.button-next-wbk').prop('disabled', false)
        }

        return passed
    }

    clear_fields(element, clear_slots = true) {
        if (clear_slots) {
            element.find('.dynamic-content-w').remove()

            element.find('.wbk_times > option').remove()
            element.find('.wbk_services_final > option').remove()
            this.render_selected_time_slots_list()
            element
                .find('.wbk-input')
                .not('.wbk_service_checkbox')
                .not('.wbk_service_radio')
                .val('')
        }
        element.find('select.wbk-input').not('.wbk_services_hidden').val(0)
        element.find('select.wbk-input').trigger('change')
        element.find('.wbk-input').niceSelect('update')
        element.attr('style', '')
        element.find('.wbk_quantities > option').remove()
        element.find('.wbk-book-quantity').remove()
    }

    validate_prev_next_buttons() {
        const get_this = () => {
            return this
        }
        var step = parseInt(get_this().container.attr('data-step'))
        if (step == 1) {
            get_this()
                .container.find('.button-prev-wbk')
                .addClass('wbk_invisible')
        } else {
            get_this()
                .container.find('.button-prev-wbk')
                .removeClass('wbk_invisible')
        }
    }

    finalize(response) {
        const get_this = () => {
            return this
        }
        get_this().track_event('booking_completed',{})
        this.container.find('.appointment-status-wrapper-w').fadeOut('fast')
        this.container
            .find('.appointment-content-wbk')
            .fadeOut('fast', function () {
                if (typeof response !== 'object') {
                    response = jQuery.parseJSON(response)
                }
                get_this().container.append(response.thanks_message)
            })

        jQuery(document).trigger('webba_booking_finalize', [response, this])

    }

    prev_step() {
        const get_this = () => {
            return this
        }
        this.container.find('.wbk_quantities option').remove()
        var prev_screen = get_this().get_prev_screen()
        var step = parseInt(get_this().container.attr('data-step'))
        get_this()
            .container.find(
                '.appointment-status-list-w li:nth-child(' + step + ')'
            )
            .removeClass('active-w')
        step--
        get_this().container.attr('data-step', step)
        get_this()
            .container.find(
                '.appointment-status-list-w li:nth-child(' + step + ')'
            )
            .addClass('active-w')
        get_this()
            .container.find(
                '.appointment-status-list-w li:nth-child(' + step + ')'
            )
            .removeClass('completed-w')

        Scrollbar.destroyAll()
        get_this().change_button_status(
            get_this().container.find('.button-next-wbk'),
            'regular'
        )

        this.clear_fields(
            get_this().container.find('.appointment-content-screen-active-w')
        )

        get_this()
            .container.find('.appointment-content-screen-active-w')
            .removeClass('appointment-content-screen-active-w')
        prev_screen.addClass('appointment-content-screen-active-w')
        var slug = prev_screen.attr('data-slug')
        this.remove_step_subtitle(slug)
        this.remove_step_subtitle('payment_optional')
        this.clear_fields(prev_screen, false)
        this.init_scroll_bars()
        this.validate_prev_next_buttons()
        this.container.find('.wbk_times option').prop('selected', true)
        this.container.find('.wbk_services_final option').prop('selected', true)
        this.validate_form()
        get_this().update_mobile_step()
        jQuery(document).trigger('wbk_after_prev', [this])
    }
    check_mobile() {
        let check = false
        // prettier-ignore
        ;(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check
    }
    is_last_step() {
        var elements = this.container
            .find('.appointment-content-screen-active-w')
            .nextAll('.appointment-content-screen-w')
        if (elements.length == 1) {
            return true
        }
        return false
    }
    update_mobile_step() {
        var total_steps = parseInt(
            this.container.find('.appointment-status-list-w > li').length
        )
        if (total_steps == 0) {
            return
        }
        var step = parseInt(this.container.attr('data-step'))
        this.container
            .find('.circle-chart-text-wbk')
            .html(step + ' ' + wbkl10n.of + ' ' + total_steps)

        var acive_step_title = this.container
            .find('.appointment-status-list-w > li.active-w')
            .find('.text-title-w')
            .html()

        this.container.find('.current-step-wbk').html(acive_step_title)
        var next_li = this.container
            .find('.appointment-status-list-w > li.active-w')
            .nextAll('li')

        if (next_li.length > 0) {
            var next_text = this.container.find('.button-next-wbk').html()
            this.container
                .find('.next-step-wbk')
                .html(next_text + ': ' + next_li.find('.text-title-w').html())
        } else {
            this.container.find('.next-step-wbk').html('')
        }
        var progress = parseInt((100 * step) / total_steps)
        this.container
            .find('.circle-chart-wbk')
            .data('easyPieChart')
            .update(progress)
    }
    async next_step() {
        const get_this = () => {
            return this
        }
        this.container
            .find('.wbk_service_item')
            .removeClass('timeslot-animation-w')

        // validation
        if (!this.validate_form()) {
            return
        }
        var next_screen = get_this().get_next_screen()
        if (next_screen.length == 0) {
            get_this().change_button_status(
                get_this().container.find('.button-next-wbk'),
                'loading'
            )

            return
        }
        this.clear_fields(next_screen)
        var can_proceed = false
        var response = null
        if (next_screen.attr('data-request') != '') {
            get_this().change_button_status(
                get_this().container.find('.button-next-wbk'),
                'loading'
            )
            response = await this.do_request(next_screen.attr('data-request'))
            if (response == false) {
                get_this().show_error('An unexpected error occoured.')
                return
            }

            try {
                response = jQuery.parseJSON(response)
                if (response.status == 'fail') {
                    get_this().change_button_status(
                        get_this().container.find('.button-next-wbk'),
                        'regular'
                    )
                    this.show_error(response.description)
                    return
                }
                if ((response.url != undefined && response.url) != '') {
                    window.location.href = response.url
                    return
                }
            } catch (e) {}
            if (get_this().is_last_step()) {
                get_this().finalize(response)
                return
            }
            if (response != false) {
                if (typeof response.webba5_html !== 'undefined') {
                    this.container.find('.appointment-content-screen-active-w')
                        .response.webba5_html
                }
            }
            if (response != false) {
                can_proceed = true
            }
        } else {
            can_proceed = true
        }
        if (can_proceed) {
            var step = parseInt(get_this().container.attr('data-step'))
            get_this()
                .container.find('.input-error-w')
                .removeClass('input-error-w')
            get_this().container.find('.form-error-w').toggle(false)
            get_this()
                .container.find(
                    '.appointment-status-list-w li:nth-child(' + step + ')'
                )
                .removeClass('active-w')
            get_this()
                .container.find(
                    '.appointment-status-list-w li:nth-child(' + step + ')'
                )
                .addClass('completed-w')

            step++
            get_this().container.attr('data-step', step)
            get_this()
                .container.find(
                    '.appointment-status-list-w li:nth-child(' + step + ')'
                )
                .addClass('active-w')
            Scrollbar.destroyAll()
            get_this()
                .container.find('.appointment-content-screen-active-w')
                .fadeOut('fast', function () {
                    get_this().change_button_status(
                        get_this().container.find('.button-next-wbk'),
                        'regular'
                    )
                    get_this()
                        .container.find('.appointment-content-screen-active-w')
                        .removeClass('appointment-content-screen-active-w')
                    next_screen.addClass('appointment-content-screen-active-w')

                    next_screen
                        .find('.wbk-input')
                        .addClass('linear-animation-w')

                    jQuery(document).trigger('wbk_after_screen_rendered', [
                        response,
                    ])
                    jQuery(document).trigger('wbk_after_next', [this, response])
                })
            get_this().validate_prev_next_buttons()
            get_this().update_mobile_step()
        }
    }
    show_error(message) {
        this.container.find('.form-error-message-w').html(message)
        this.container.find('.form-error-w').toggle(true)
    }
}

let webba_forms = []
jQuery(function ($) {
    jQuery('.appointment-box-wbk').each(function () {
        var form = new WEBBA5_Form(jQuery(this))
        webba_forms.push(form)
    })
    if (jQuery('#grve-safebutton-area').length > 0) {
        jQuery('#grve-safebutton-area').find('.main-block-w').remove()
    } else {
        if (jQuery('.main-block-w').length > 1) {
            if (jQuery('.wbk_compatibility').length > 0) {
                jQuery('.main-block-w').not(':first').remove()
            } else {
                jQuery('.main-block-w').not(':last').remove()
            }
        }
    }
})

function wbk_strip_html(html) {
    let tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
}
