jQuery(function ($) {
    wbk_init_backend_tab_menu()

    if (jQuery('.schedule_tools_date_range').length > 0) {
        jQuery('.schedule_tools_date_range').datepick({
            rangeSelect: true,
            monthsToShow: 3,
        })
        jQuery('.schedule_tools_date_range_exclude').datepick({
            multiSelect: 999,
            monthsToShow: 3,
        })
        jQuery('.schedule_tools_single_date').datepick({
            monthsToShow: 3,
            onSelect: function (date) {
                var date_obj = new Date(date)
                var service_id = jQuery(
                    '#schedule_tools_mass_add_service_id'
                ).val()
                if (service_id == 0) {
                    jQuery('.schedule_tools_mass_add_service_id')
                        .closest('.field-block-wb')
                        .find('.label-wb')

                        .addClass('input-error-wb')
                    jQuery('.schedule_tools_single_date ').val('')
                    return
                }
                var forated_date =
                    date_obj.getFullYear() +
                    '-' +
                    parseInt(date_obj.getMonth() + 1) +
                    '-' +
                    date_obj.getDate()

                var nonce = jQuery('.schedule_tools_start_btn').attr(
                    'data-nonce'
                )
                var url = jQuery('.schedule_tools_start_btn').attr('data-url')
                var data = {
                    date: forated_date,
                    service_id: service_id,
                }

                jQuery('.schedule_tools_single_date').after(
                    '<p class="loading"></p>'
                )

                jQuery.ajax(url + 'wbk/v1/get-available-time-slots-day/', {
                    method: 'POST',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('X-WP-Nonce', nonce)
                    },
                    data: data,
                    statusCode: {
                        200: function (response) {
                            jQuery('.loading').remove()
                            var times_htmls =
                                '<div class="field-block-wb"><label class="label-wb"><b>Select time</b></label><div class="custom-multiple-select-wb-holder"><div class="custom-multiple-select-wb"><select class="schedule_tools_times_mass_add" multiple="">'

                            // response = JSON.parse(response)
                            response.time_slots
                            jQuery.each(
                                response.time_slots,
                                function (index, value) {
                                    times_htmls +=
                                        '<option data-places="' +
                                        value.free_places +
                                        '" data-min_quantity="' +
                                        value.min_quantity +
                                        '"  value="' +
                                        value.start +
                                        '">' +
                                        value.formated_time_backend +
                                        '</option>'
                                }
                            )

                            times_htmls += '</select></div></div></div>'

                            // qty
                            times_htmls +=
                                '<div class="field-block-wb"><label class="label-wb"><b>Booking items count</b></label><div class="custom-select-wb-holder"><div class="custom-select-wb"><select class="schedule_tools_quantity_mass_add" >'
                            times_htmls += '</select></div></div></div>'
                            times_htmls +=
                                '<div class="field-block-wb"><label class="label-wb"><b>Booking status</b></label><div class="custom-select-wb-holder"><div class="custom-select-wb"><select class="schedule_tools_status_mass_add" >'
                            times_htmls +=
                                '<option value="pending">Awaiting approval</option>'
                            times_htmls +=
                                '<option value="approved">Approved</option>'
                            times_htmls +=
                                '<option value="paid">Paid (awaiting approval)</option>'
                            times_htmls +=
                                '<option value="paid_approved">Paid (approved)</option>'
                            times_htmls +=
                                '<option value="arrived">Arrived</option>'
                            times_htmls +=
                                '<option value="woocommerce">Managed by WooCommerce</option>'
                            times_htmls +=
                                '<option value="added_by_admin_not_paid">Added by the administrator (not paid)</option>'
                            times_htmls +=
                                '<option value="added_by_admin_paid">Added by the administrator (paid)</option>'
                            times_htmls += '</select></div></div></div>'

                            times_htmls +=
                                '<div class="field-block-wb"><label class="label-wb"><b>Customer name</b></label><div class="field-wrapper-wb"><input type="text" value="" class="schedule_tools_customer_name" name="schedule_tools_customer_name"></div></div>'

                            times_htmls +=
                                '<div class="field-block-wb"><label class="label-wb"><b>Customer email</b></label><div class="field-wrapper-wb"><input type="text" value="" class="schedule_tools_customer_email" name="schedule_tools_customer_email"></div></div>'

                            times_htmls +=
                                '<div class="field-block-wb"><label class="label-wb"><b>Customer phone</b></label><div class="field-wrapper-wb"><input type="text" value="" class="schedule_tools_customer_phone" name="schedule_tools_customer_phone"></div></div>'

                            times_htmls +=
                                '<div class="field-block-wb"><label class="label-wb"><b>Comment</b></label><div class="field-wrapper-wb"><textarea value="" class="schedule_tools_customer_comment" name="schedule_tools_customer_comment"></textarea></div></div>'

                            jQuery('#multiple_booking_form_container').html(
                                times_htmls
                            )

                            jQuery('.schedule_tools_times_mass_add').chosen()
                            jQuery(
                                '.schedule_tools_quantity_mass_add'
                            ).niceSelect()
                            jQuery(
                                '.schedule_tools_status_mass_add'
                            ).niceSelect()
                            jQuery('.schedule_tools_times_mass_add').change(
                                function () {
                                    var free_places = 1000000
                                    var cur_values = jQuery(
                                        '.schedule_tools_times_mass_add'
                                    ).val()
                                    var min_quantity = 0
                                    jQuery.each(
                                        cur_values,
                                        function (index, value) {
                                            var places = parseInt(
                                                jQuery(
                                                    '.schedule_tools_times_mass_add option[value="' +
                                                        value +
                                                        '"]'
                                                ).attr('data-places')
                                            )
                                            if (places < free_places) {
                                                free_places = places
                                            }
                                            min_quantity = jQuery(
                                                '.schedule_tools_times_mass_add option[value="' +
                                                    value +
                                                    '"]'
                                            ).attr('data-min_quantity')
                                        }
                                    )
                                    jQuery(
                                        '.schedule_tools_quantity_mass_add option'
                                    ).remove()
                                    var options_html = ''

                                    if (free_places < 1000000) {
                                        for (
                                            i = min_quantity;
                                            i <= free_places;
                                            i++
                                        ) {
                                            options_html +=
                                                '<option value="' +
                                                i +
                                                '">' +
                                                i +
                                                '</option>'
                                        }
                                    } else {
                                    }

                                    jQuery(
                                        '.schedule_tools_quantity_mass_add'
                                    ).html(options_html)

                                    jQuery(
                                        '.schedule_tools_quantity_mass_add'
                                    ).niceSelect('update')
                                }
                            )
                        },
                        400: function (response) {},
                        403: function (response) {},
                    },
                })
            },
        })

        jQuery('.schedule_tools_days_of_week').chosen()
    }

    jQuery('.custom-select-wb > select').niceSelect()

    jQuery('.color-picker-wb').on('input', function () {
        jQuery(this)
            .parent()
            .find('.input-text-color-wb')
            .val(jQuery(this).val())
    })
    jQuery('.input-text-color-wb').on('input', function () {
        jQuery(this).parent().find('.color-picker-wb').val(jQuery(this).val())
    })
    jQuery('.input-wb').on('input', function () {
        wbk_update_appearance_preview(jQuery(this))
    })

    jQuery('.input-wb').each(function () {
        wbk_update_appearance_preview(jQuery(this))
    })

    jQuery(
        '.wbk_schedule_tools_category_id, .wbk_schedule_tools_service_id'
    ).change(function () {
        jQuery(
            '.wbk_schedule_tools_category_id, .wbk_schedule_tools_service_id'
        )
            .not(this)
            .val(0)
        jQuery(
            '.wbk_schedule_tools_category_id, .wbk_schedule_tools_service_id'
        ).niceSelect('update')
    })

    jQuery('#schedule_tools_mass_add_service_id').change(function () {
        jQuery('.schedule_tools_single_date').val('')
        jQuery('#multiple_booking_form_container').html('')
    })

    jQuery('.schedule_tools_start_btn').click(function () {
        jQuery('.wbk-error-label').removeClass('wbk-error-label')
        var appearance_data = []
        var btn = jQuery(this)
        var form_data = new FormData()
        const tab = jQuery('.appearance-tabs-wb').find('.active-wb')
        jQuery('.wbk_load_service_id').val(0)
        jQuery('.wbk_load_service_id').trigger('change')

        if (tab.attr('data-name') == 'mass_add_bookings') {
            var error_status = true
            var service_id = jQuery('.schedule_tools_mass_add_service_id').val()
            if (service_id == 0) {
                jQuery('.schedule_tools_mass_add_service_id')
                    .closest('.field-block-wb')
                    .find('.label-wb')
                    .addClass('input-error-wb')
                var error_status = false
            }

            var date = jQuery('.schedule_tools_single_date').val()
            if (date == '') {
                jQuery('.schedule_tools_single_date')
                    .closest('.field-block-wb')
                    .find('.label-wb')
                    .addClass('input-error-wb')
                var error_status = false
            }

            var times = jQuery('.schedule_tools_times_mass_add').val()
            if (times.length == 0) {
                jQuery('.schedule_tools_times_mass_add')
                    .closest('.field-block-wb')
                    .find('.label-wb')
                    .addClass('input-error-wb')
                var error_status = false
            }

            var name = jQuery('.schedule_tools_customer_name').val()
            if (name == '') {
                jQuery('.schedule_tools_customer_name')
                    .closest('.field-block-wb')
                    .find('.label-wb')
                    .addClass('input-error-wb')
                var error_status = false
            }

            var email = jQuery('.schedule_tools_customer_email').val()
            if (!wbk_check_email(email)) {
                jQuery('.schedule_tools_customer_email')
                    .closest('.field-block-wb')
                    .find('.label-wb')
                    .addClass('input-error-wb')
                var error_status = false
            }

            var qty = jQuery('.schedule_tools_quantity_mass_add').val()
            if (qty == '') {
                jQuery('.schedule_tools_quantity_mass_add')
                    .closest('.field-block-wb')
                    .find('.label-wb')
                    .addClass('input-error-wb')
                var error_status = false
            }

            var phone = jQuery('.schedule_tools_customer_phone').val()
            var comment = jQuery('.schedule_tools_customer_comment').val()

            if (error_status == false) {
                return
            }

            form_data.append('action', 'wbk_create_multiple_bookings')
            form_data.append('nonce', wbk_dashboardl10n_old.wbkb_nonce)
            form_data.append('service_id', service_id)
            form_data.append('date', date)
            form_data.append('name', name)
            form_data.append('email', email)
            form_data.append('phone', phone)
            form_data.append('desc', comment)
            form_data.append('times', times)
            form_data.append('quantity', qty)
            form_data.append(
                'status',
                tab.find('.schedule_tools_status_mass_add').val()
            )

            if (!error_status) {
                return
            }

            wbk_change_button_status(btn, 'loading')
            jQuery.ajax({
                url: wbk_dashboardl10n_old.ajaxurl,
                type: 'POST',
                data: form_data,
                cache: false,
                processData: false,
                contentType: false,
                success: function (response) {
                    jQuery('#multiple_booking_form_container').html('')
                    jQuery('.schedule_tools_mass_add_service_id').val(0)
                    jQuery('.schedule_tools_single_date').val('')
                    wbk_change_button_status(btn, 'regular')
                    wbk_show_backend_notification(
                        response,
                        jQuery('.left-part-wb')
                    )
                },
            })
            return
        }

        form_data.append('action', 'wbk_schedule_tools_action')
        form_data.append('nonce', wbk_dashboardl10n_old.wbkb_nonce)

        var error_status = 0

        var action
        if (tab.find('.schedule-tools-action-lock').is(':checked')) {
            action = 'lock'
        } else {
            action = 'unlock'
        }

        var service_id = tab.find('.wbk_schedule_tools_service_id').val()
        var category_id = tab.find('.wbk_schedule_tools_category_id').val()
        if (service_id == 0 && category_id == 0) {
            tab.find(
                '.wbk_schedule_tools_service_id, .wbk_schedule_tools_category_id'
            )
                .closest('.field-block-wb')
                .find('.label-wb')
                .addClass('wbk-error-label')
            error_status = 1
        }

        var date_range = tab.find('.schedule_tools_date_range').val().trim()
        if (date_range == '') {
            tab.find('.schedule_tools_date_range')
                .closest('.field-block-wb')
                .find('.label-wb')
                .addClass('wbk-error-label')
            error_status = 1
        }
        var days_of_week = tab.find('.schedule_tools_days_of_week').val()
        if (days_of_week.length == 0) {
            tab.find('.schedule_tools_days_of_week')
                .closest('.field-block-wb')
                .find('.label-wb')
                .addClass('wbk-error-label')
            error_status = 1
        }
        for (var i = 0; i < days_of_week.length; i++) {
            if (!wbk_check_integer_min_max(days_of_week[0], 1, 7)) {
                tab.find('.schedule_tools_days_of_week')
                    .closest('.field-block-wb')
                    .find('.label-wb')
                    .addClass('wbk-error-label')
                error_status = 1
            }
        }

        var exclude_range
        var from
        var to
        if (tab.attr('data-name') == 'date_auto_lock') {
            var excluded_dates = tab
                .find('.schedule_tools_date_range_exclude')
                .val()
                .trim()
        } else {
            from = parseInt(tab.find('.schedule_tools_time_from').val())
            to = parseInt(tab.find('.schedule_tools_time_to').val())
            if (from >= to) {
                tab.find('.schedule_tools_time_from')
                    .closest('.field-block-wb')
                    .find('.label-wb')
                    .addClass('wbk-error-label')
                tab.find('.schedule_tools_time_to')
                    .closest('.field-block-wb')
                    .find('.label-wb')
                    .addClass('wbk-error-label')
                error_status = 1
            }
        }

        if (error_status == 1) {
            return
        }

        form_data.append('lock_action', action)
        form_data.append('category', category_id)
        form_data.append('service', service_id)
        form_data.append('date_range', date_range)
        form_data.append('days_of_week', days_of_week)

        if (tab.attr('data-name') == 'date_auto_lock') {
            form_data.append('exclude_dates', excluded_dates)
            form_data.append('lock_target', 'dates')
        } else {
            form_data.append('from', from)
            form_data.append('to', to)
            form_data.append('lock_target', 'timeslots')
        }
        wbk_change_button_status(btn, 'loading')
        jQuery.ajax({
            url: wbk_dashboardl10n_old.ajaxurl,
            type: 'POST',
            data: form_data,
            cache: false,
            processData: false,
            contentType: false,
            success: function (response) {
                wbk_change_button_status(btn, 'regular')
                const result = JSON.parse(response)
                wbk_show_backend_notification(
                    result.message,
                    jQuery('.left-part-wb')
                )
            },
        })
    })

    jQuery('.color-picker-wb').trigger('change')
    jQuery('#wbk_appearance_field_4').trigger('change')

    jQuery('.color-picker-wb').each(function () {
        wbk_update_appearance_preview(jQuery(this))
    })
    wbk_update_appearance_preview(jQuery('#wbk_appearance_field_4'))
})

function wbk_update_appearance_preview(elem) {
    if ('undefined' === typeof elem.attr('data-class')) {
        return
    }
    var target_classes = elem.attr('data-class').split(',')
    for (i = 0; i < target_classes.length; i++) {
        var target_property = elem.attr('data-property').split(',')

        var target_value = elem.val()

        for (k = 0; k < target_property.length; k++) {
            if (target_property[k] == 'border-radius') {
                target_value = target_value + 'px'
            }
            jQuery('.' + target_classes[i]).css(
                target_property[k],
                target_value
            )
        }
    }
}

function wbk_change_button_status(elem, status) {
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

function wbk_show_backend_notification(message, element = null) {
    var top = (jQuery('.notification-bar-wb').length + 1) * 10 + 'px'
    var message_html =
        '<div style="top:' +
        top +
        ';" class="notification-bar-wb" data-js="notification-bar-wb"><span class="block-icon-wb"><img src= "' +
        wbk_dashboardl10n_old.nofication_icon +
        '"></span><div class="block-text-wb">' +
        message +
        '</div><span class="block-close-wb" data-js="block-close-wb"></span></div>'
    jQuery(element).append(message_html)

    jQuery('.notification-bar-wb')
        .first()
        .delay(5000)
        .fadeOut('slow', function () {
            jQuery(this.remove())
        })

    jQuery('.notification-bar-wb')
        .first()
        .find('.block-close-wb')
        .click(function () {
            jQuery(this).closest('.notification-bar-wb').remove()
        })
}

function wbk_init_backend_tab_menu() {
    jQuery('[data-js="appearance-menu-wb"]').each(function () {
        var jQueryappearance_menu_li = jQuery(this).find('li')
        jQueryappearance_menu_li.click(function () {
            var appearance_menu_li_name = jQuery(this).attr('data-name')
            if (appearance_menu_li_name == 'service_schedule') {
                jQuery('.schedule_tools_start_btn').addClass('wbk_hidden')
            } else {
                jQuery('.schedule_tools_start_btn').removeClass('wbk_hidden')
            }
            jQueryappearance_menu_li.removeClass('active-wb')
            jQuery(this).addClass('active-wb')
            jQuery(
                '[data-js="appearance-tabs-wb"] [data-js="single-tab-wb"]'
            ).removeClass('active-wb')
            jQuery(
                '[data-js="appearance-tabs-wb"] [data-js="single-tab-wb"][data-name=' +
                    appearance_menu_li_name +
                    ']'
            ).addClass('active-wb')
        })
    })
}
