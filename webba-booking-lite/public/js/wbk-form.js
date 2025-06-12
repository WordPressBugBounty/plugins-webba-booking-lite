WBK_jQuery_ = jQuery
class WBK_Form {
    constructor(container) {
        const get_this = () => {
            return this
        }
        this.container = container
    }
    get_form_values() {
        // // TODO: add container content. replace id with name
        const get_this = () => {
            return this
        }
        var form_data = new FormData()
        var name = jQuery.trim(jQuery('[name="wbk-name"]').val())
        form_data.append('name', name)
        var email = jQuery.trim(jQuery('[name="wbk-email"]').val())
        form_data.append('email', email)
        if (jQuery('[name="wbk-phone-cf7it-national"]').length > 0) {
            var phone_code = jQuery.trim(
                jQuery('[name="wbk-phone-cf7it-national"]')
                    .parent()
                    .find('.selected-flag')
                    .attr('title')
            )
            phone_code = phone_code.match(/\d+/)[0]
            var phone =
                '+' +
                phone_code +
                ' ' +
                jQuery.trim(jQuery('[name="wbk-phone-cf7it-national"]').val())
        } else {
            var phone = jQuery.trim(jQuery('[name="wbk-phone"]').val())
        }
        form_data.append('phone', phone)
        var desc = jQuery.trim(jQuery('#wbk-comment').val())
        form_data.append('desc', desc)
        var current_category = jQuery('#wbk-category-id').val()
        if (!wbk_check_integer_min_max(current_category, 1, 1000000)) {
            current_category = 0
        }
        form_data.append('current_category', current_category)
        var extra_data = []
        // custom fields values (text)
        jQuery('.wbk-text, .wbk-email-custom')
            .not('#wbk-name,#wbk-email,#wbk-phone')
            .each(function () {
                if (jQuery(this).closest('.wpcf7cf-hidden').length == 0) {
                    var extra_item = []
                    extra_item.push(jQuery(this).attr('id'))
                    extra_item.push(
                        jQuery(
                            'label[for="' + jQuery(this).attr('id') + '"]'
                        ).html()
                    )
                    extra_item.push(jQuery(this).val())
                    extra_data.push(extra_item)
                }
            })
        // custom fields values (checkbox)
        jQuery('.wbk-checkbox-custom.wpcf7-checkbox').each(function () {
            if (jQuery(this).closest('.wpcf7cf-hidden').length == 0) {
                var extra_item = []
                extra_item.push(jQuery(this).attr('id'))
                extra_item.push(
                    jQuery(
                        'label[for="' + jQuery(this).attr('id') + '"]'
                    ).html()
                )
                var current_checkbox_value = ''
                jQuery(this)
                    .children('span')
                    .each(function () {
                        jQuery(this)
                            .children('input:checked')
                            .each(function () {
                                current_checkbox_value +=
                                    jQuery(this).val() + ' '
                            })
                    })
                current_checkbox_value = jQuery.trim(current_checkbox_value)
                extra_item.push(current_checkbox_value)
                extra_data.push(extra_item)
            }
        })
        jQuery('.wbk-select')
            .not('#wbk-book-quantity, #wbk-service-id')
            .each(function () {
                if (jQuery(this).closest('.wpcf7cf-hidden').length == 0) {
                    var extra_item = []
                    extra_item.push(jQuery(this).attr('id'))
                    extra_item.push(
                        jQuery(
                            'label[for="' + jQuery(this).attr('id') + '"]'
                        ).html()
                    )
                    extra_item.push(jQuery(this).val())
                    extra_data.push(extra_item)
                }
            })
        // custom fields text areas
        jQuery('.wbk-textarea')
            .not('#wbk-comment,#wbk-customer_desc')
            .each(function () {
                if (jQuery(this).closest('.wpcf7cf-hidden').length == 0) {
                    var extra_item = []
                    extra_item.push(jQuery(this).attr('id'))
                    extra_item.push(
                        jQuery(
                            'label[for="' + jQuery(this).attr('id') + '"]'
                        ).html()
                    )
                    extra_item.push(jQuery(this).val())
                    extra_data.push(extra_item)
                }
            })
        extra_data = JSON.stringify(extra_data)
        form_data.append('extra_data', extra_data)
        // secondary names, emails
        var secondary_data = []
        jQuery('[id^="wbk-secondary-name"]').each(function () {
            var name_p = jQuery(this).val()
            var name_id = jQuery(this).attr('id')
            if (wbk_check_string(name_p, 1, 128)) {
                var arr = name_id.split('_')
                var id2 = 'wbk-secondary-email_' + arr[1]
                email_p = jQuery('#' + id2).val()
                var person = new Object()
                person.name = name_p
                person.email = email_p
                secondary_data.push(person)
            }
        })
        var times = []
        var services = []
        var quantities = []
        jQuery('.wbk-slot-active-button')
            .not('#wbk-to-checkout')
            .each(function () {
                var btn_id = jQuery(this).attr('id')
                var time = btn_id.substring(17, btn_id.length)
                var service = jQuery(this).attr('data-service')
                times.push(time)
                services.push(service)
                if (
                    jQuery(".wbk-book-quantity[data-service='" + service + "']")
                        .length > 0
                ) {
                    quantities.push(
                        jQuery(
                            ".wbk-book-quantity[data-service='" + service + "']"
                        ).val()
                    )
                } else {
                    quantities.push(1)
                }
            })
        if (times.length == 0) {
            var times = []
            var services = []
            var quantities = []
            times.push(jQuery('#wbk-book_appointment').attr('data-time'))
            services.push(jQuery('#wbk-service-id').val())
            if (jQuery('.wbk-book-quantity').length > 0) {
                quantities.push(jQuery('.wbk-book-quantity').val())
            } else {
                quantities.push(1)
            }
        }
        form_data.append('times', times)
        form_data.append('services', services)

        form_data.append('quantities', quantities)

        return form_data
    }
    update_amounts() {
        const get_this = () => {
            return this
        }
        var form_data = get_this().get_form_values()
        form_data.append('action', 'wbk_calculate_amounts')
        form_data.append('nonce', wbkl10n.wbkf_nonce)

        jQuery('.wbk_form_label_total').html(
            '<span class="wbk-loading_small"></span>'
        )
        jQuery.ajax({
            url: wbkl10n.ajaxurl,
            type: 'POST',
            data: form_data,
            cache: false,
            processData: false,
            contentType: false,
            success: function (response) {
                response_obj = jQuery.parseJSON(response)
                jQuery('.wbk_form_label_total').html(
                    response_obj.total_formated
                )
            },
        })
    }
    clear_date_container() {
        const get_this = () => {
            return this
        }
        get_this().container.find('.wbk_date_container').html('')
    }
    clear_time_container() {
        const get_this = () => {
            return this
        }
        get_this().container.find('.wbk_date_container').html('')
        WBK_jQuery_('#wbk-to-checkout').fadeOut(function () {
            WBK_jQuery_('#wbk-to-checkout').remove()
        })
    }
    clear_form() {
        const get_this = () => {
            return this
        }
        get_this().container.find('.wbk_booking_form_container').html('')
    }
    clear_done() {
        const get_this = () => {
            return this
        }
        get_this().container.find('.wbk_booking_done').html('')
        get_this().container.find('.wbk_payment').html('')
    }
    clear_timeslots() {
        const get_this = () => {
            return this
        }
        get_this().container.find('.wbk_slots_container').html('')
    }
    initialize() {
        const get_this = () => {
            return this
        }
        get_this()
            .container.find('.wbk_services')
            .change(function () {
                get_this().clear_date_container()
                get_this().clear_time_container()
                get_this().clear_form()
                get_this().clear_done()
                get_this().clear_timeslots()
                var service_id = WBK_jQuery_(this).val()
                if (service_id != 0) {
                    wbk_renderSetDate(true)
                    var service_desc = WBK_jQuery_(this)
                        .find('[value="' + service_id + '"]')
                        .attr('data-desc')
                    if (wbkl10n.show_desc == 'enabled') {
                        get_this()
                            .container.find('.wbk_description_holder')
                            .html(
                                '<label class="input-label-wbk">' +
                                    service_desc +
                                    '</label>'
                            )
                    }
                    var multi_limit = WBK_jQuery_(this)
                        .find(':selected')
                        .attr('data-multi-limit')
                    if (multi_limit == '') {
                        wbkl10n.multi_limit = wbkl10n.multi_limit_default
                    } else {
                        wbkl10n.multi_limit = multi_limit
                    }
                    wbkl10n.multi_low_limit = WBK_jQuery_(this)
                        .find(':selected')
                        .attr('data-multi-low-limit')
                } else {
                    get_this().clear_date_container()
                }

                get_this().clear_time_container()
                get_this().clear_form()
                get_this().clear_done()
                get_this().clear_timeslots()

                var service_id = WBK_jQuery_(this).val()
                if (service_id != 0) {
                    wbk_renderSetDate(true)
                    var service_desc = WBK_jQuery_(this)
                        .find('[value="' + service_id + '"]')
                        .attr('data-desc')
                    if (wbkl10n.show_desc == 'enabled') {
                        get_this()
                            .container.find('.wbk_description_holder')
                            .html(
                                '<label class="input-label-wbk">' +
                                    service_desc +
                                    '</label>'
                            )
                    }
                    var multi_limit = WBK_jQuery_(this)
                        .find(':selected')
                        .attr('data-multi-limit')
                    if (multi_limit == '') {
                        wbkl10n.multi_limit = wbkl10n.multi_limit_default
                    } else {
                        wbkl10n.multi_limit = multi_limit
                    }
                    wbkl10n.multi_low_limit = WBK_jQuery_(this)
                        .find(':selected')
                        .attr('data-multi-low-limit')
                } else {
                    get_this().clear_date_container()
                    get_this().clear_time_container()
                }
            })
    }
}

jQuery(document).on('wbk_on_form_rendered', function (event, container) {
    wbk_form = new WBK_Form(container)
    wbk_form.update_amounts()
    container
        .find('input, select')
        .not('#wbk-name, #wbk-email, #wbk-phone')
        .change(function () {
            wbk_form = new WBK_Form(container)
            wbk_form.update_amounts()
        })
})
