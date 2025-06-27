/* START document ready */

;(function ($) {
    jQuery(document).ready(function () {
        /* help popover function call (full function is in current file) */
        wbk_help_popover()

        /* custom select function call (full function is in plugins.js) */
        jQuery('.wbk_option_select').niceSelect()

        /* toggle container function call (full function is in current file) */
        wbk_toggle_container()

        /* sidebar roll open (full function is in current file) */
        wbk_sidebar_roll()

        /* toggle visual editor (full function is in current file) */
        wbk_toggle_visual_editor()

        /* copy to clipboard (full function is in current file) */
        wbk_copy_to_clipboard()

        /* multiselect (full plugin is in plugins.js) */
        jQuery('.wbk_option_multi_select').chosen()

        /* close notification bar (full function is in current file) */
        wbk_close_notification_bar()

        /* appearance tab menu (full function is in currrent file) */
        wbk_appearance_tab_menu()

        /* appearance selector checkboxes (full function is in current file) */
        wbk_appearance_selector_checkboxes()

        /* color picker function call (full function is in current file) */
        wbk_color_picker_block()

        /* colors color picker (full function is in current file) */
        wbk_colors_color_picker()

        /* colors border radius (full function is in current file) */
        wbk_colors_border_radius()

        /* borders background color (full function is in current file) */
        wbk_borders_background_color()

        /* borders text color (full function is in current file) */
        wbk_borders_text_color()

        /* borders color on click function call (full function is in current file) */
        wbk_borders_color_on_click()

        /* borders border radius (full function is in current file) */
        wbk_borders_border_radius()

        /* buttons background color function call (full function is in current file) */
        wbk_buttons_background_color()

        /* buttons text color function call (full function is in current file) */
        wbk_buttons_text_color()

        /* buttons border radius (full function is in current file) */
        wbk_buttons_border_radius()

        /* appearance font change function call (full function is in current file) */
        wbk_apperance_font()

        /* toggle switcher appearance desktop/mobile function call (full function is in current file) */
        wbk_wbk_toggle_switcher_mobile()

        /* appearance main menu mobile toggle (full function is in current file) */
        wbk_appearance_main_menu_mobile_toggle()

        /* datepicker (full plugin is in plugins.js)*/
        jQuery('#datepicker-w').datepicker({
            beforeShow: function () {
                add_clear_button_to_datepicker()
            },
            dateFormat: 'MM dd, yy',
            showButtonPanel: true,
            currentText: 'Today',
            closeText: 'Close',
            showOtherMonths: true,
            selectOtherMonths: true,
            dayNamesMin: jQuery.datepicker._defaults.dayNamesShort,
            onSelect: function () {
                jQuery('[data-js="next-step-button-wbk"]').removeAttr(
                    'disabled'
                )
            },
        })

        /* sppearance back/next buttons function call (full function is in current file) */
        wbk_appearance_back_next_buttons()

        /* horizontal calendar (full plugin is in plugins.js)*/
        jQuery('#calendar-horizontal-w').rescalendar({
            id: 'calendar-horizontal-w',
            format: 'MM-DD-YYYY',
            refDate: '08-28-2022',
            calSize: 5,
            jumpSize: 0,
            dataKeyField: 'name',
            dataKeyValues: ['item1'],
        })

        jQuery('#calendar-horizontal-w button').click(function (e) {
            e.preventDefault()
        })

        /* select country phone code (full plugin is in plugins.js) */
        if (jQuery('#phone-select-w').length) {
            var input = document.querySelector('#phone-select-w')
            window.intlTelInput(input, {
                // allowDropdown: false,
            })
        }

        /* additional select function call (full function is in current file) */
        additional_select()

        /* input help popover function call (full function is in current file) */
        input_wbk_help_popover()

        /* new service tabs menu (full function is in current file) */
        new_service_tabs_menu()

        /* toggle switch function call (full function is in current file) */
        wbk_toggle_switch()

        /* add one more field (full function is in current file) */
        add_one_more_field()

        /* business hours slider time calculation */
        business_slider_time_calculation()

        /* toggle business hours function call (full function is in current file) */
        toggle_business_hours()

        /* delete business hours row (full function is in current file) */
        delete_business_hours_row()

        /* copy business hours row function call (full function is in current file) */
        copy_business_hours_row()

        /* full function is in current file */
        category_custom_table()

        /* full function is in current file */
        custom_table_select_all_checkbox()

        /* full function is in current file */
        custom_table_delete_row()

        /* full function is in current file */
        custom_table_copy_row()

        /* full function is in current file */
        select_several_table_rows()

        /* full function is in current file */
        services_custom_table()

        /* full function is in current file */
        remove_details_on_pagination_click()

        /* full function is in current file */
        wbk_toggle_switch_buttons()

        /* full function is in current file */
        bookings_custom_table()

        /* full function is in current file */
        bookings_custom_table_full()

        /* full function is in current file */
        pricing_rules_custom_table()

        /* full function is in current file */
        coupon_custom_table()

        /* full function is in current file */
        email_templates_custom_table()

        /* full function is in current file */
        google_calendars_custom_table()

        /* full function is in current file */
        custom_table_custom_scrollbar_helper()

        /* full function is in current file */
        table_custom_select_drop_up()

        /* full function is in current file and in plugins.js */
        fullcalendar()

        /* full function is in current file */
        status_custom_select()

        /* full function is in current file */
        selected_customers_list_delete_row()

        /* full function is in current file */
        table_checkbox_add_class_to_row()

        /* full function is in current file */
        custom_scrollbar()

        /* Settings page save options */
        wbk_save_options()

        /* Zoom link update */

        jQuery('#wbk_zoom_client_id, #wbk_zoom_client_secret').on(
            'input',
            function () {
                var website_url = window.location.href.split('wp-admin')[0]
                var authorize_message = jQuery('#wbk_zoom_auth_stat').attr(
                    'data-setmsg'
                )
                var zoom_client_id = jQuery('#wbk_zoom_client_id').val().trim()
                var secret = jQuery('#wbk_zoom_client_secret').val().trim()
                if (zoom_client_id != '' && secret != '') {
                    var zoom_url =
                        '<span class="wbk_zoom_ask_to_save">Please, save the setting.</span>' +
                        '<a class="wbk_hidden wbk_zoom_auth_link" href="https://zoom.us/oauth/authorize?response_type=code&amp;client_id=' +
                        zoom_client_id +
                        '&amp;redirect_uri=' +
                        website_url +
                        '?wbk_zoom_auth=true" target="_blank" rel="noopener noreferrer" >Authorize</a>'
                    jQuery('.wbk_option_zoom_msg_holder').html(zoom_url)
                } else {
                    jQuery('.wbk_option_zoom_msg_holder').html(
                        authorize_message
                    )
                }
            }
        )

        wbk_init_dependencies()
        jQuery('.wbk_option_input').change(function () {
            wbk_init_dependencies()
        })

        jQuery('#tabs').tabs()
        var format = 'yyyy-mm-dd'
        jQuery('#wbk_holydays').datepick({
            multiSelect: 999,
            monthsToShow: 3,
            dateFormat: format,
        })

        jQuery('.wbk_customer_message_btn').on('click', function () {
            var caretPos = document.getElementById(
                'wbk_email_customer_book_message'
            ).selectionStart
            var textAreaTxt = jQuery('#wbk_email_customer_book_message').val()
            var txtToAdd = '#' + jQuery(this).attr('id')
            var newCaretPos = caretPos + txtToAdd.length
            jQuery('#wbk_email_customer_book_message').val(
                textAreaTxt.substring(0, caretPos) +
                    txtToAdd +
                    textAreaTxt.substring(caretPos)
            )
            jQuery('#wbk_email_customer_book_message').focus()
            document
                .getElementById('wbk_email_customer_book_message')
                .setSelectionRange(newCaretPos, newCaretPos)
        })
        jQuery('.wbk_email_editor_toggle').on('click', function () {
            jQuery(this).siblings('.wbk_email_editor_wrap').toggle('fast')
        })

        jQuery('.wbk_option_field_select_multiple').chosen({
            width: '300px',
        })

        jQuery('#wbk_remove_ediotors').on('click', function () {
            if (tinymce.editors.length > 0) {
                for (i = 0; i < tinymce.editors.length; i++) {
                    tinyMCE.editors[i].destroy()
                }
            }
            return false
        })

        jQuery('.wbk_zoom_remove_auth').click(function () {
            jQuery('#wbk_zoom_auth_stat').val('')
            jQuery(this).replaceWith('Please, do not forget to save settings.')
            jQuery('.wbk_zoom_authorized_label').remove()
        })

        // auto open
        const url_params = new URLSearchParams(window.location.search)
        const tab = url_params.get('tab')
        if (tab != null) {
            jQuery('[data-name="' + tab + '"]').trigger('click')
        }
    })

    function wbk_help_popover() {
        jQuery('[data-js="help-popover-wb"]').each(function () {
            var jQuerywbk_help_popover_wb = jQuery(this)

            jQuerywbk_help_popover_wb
                .find(
                    '[data-js="help-icon-wb"], [data-js="help-popover-box-wb"]'
                )
                .click(function (e) {
                    e.stopPropagation()
                    jQuery('[data-js="help-popover-box-wb"]').toggle(false)
                    jQuerywbk_help_popover_wb
                        .find('[data-js="help-popover-box-wb"]')
                        .toggle(1, function () {
                            var offset = jQuery(this).offset()
                            var window_w = jQuery(window).width()
                            var window_h = jQuery(window).height()

                            var class_name = 'wbk_tooltip'
                            var height = jQuery(this).height()

                            if (window_w - offset.left < 137) {
                                class_name += '_right'
                            }

                            jQuery(this).addClass(class_name)
                        })
                    jQuerywbk_help_popover_wb
                        .find('[data-js="help-popover-box-wb"]')
                        .click(function () {
                            jQuery(this).toggle(false)
                        })
                })
        })
    }

    /* END help popover */

    /* START toggle container */

    function wbk_toggle_container() {
        jQuery('[data-js="toggle-container-wb"]').each(function () {
            var jQuerywbk_toggle_container_wb = jQuery(this)

            jQuerywbk_toggle_container_wb
                .find('[data-js="toggle-title-wb"]')
                .click(function () {
                    jQuerywbk_toggle_container_wb
                        .find('[data-js="toggle-content-wb"]')
                        .slideToggle(200, function () {
                            jQuerywbk_toggle_container_wb.toggleClass('open-wb')
                        })
                })
        })
    }

    /* END toggle container */

    /* START sidebar roll open/close*/

    function wbk_sidebar_roll() {
        var jQuerymain_curtain = jQuery('[data-js="main-curtain-wb"]')

        jQuery('[data-js="open-sidebar-wb"]').each(function () {
            var jQueryopen_sidebar_wb = jQuery(this)

            var sidebar_name = jQueryopen_sidebar_wb.attr('data-name')

            jQueryopen_sidebar_wb.click(function () {
                var jQueryrequired_sidebar = jQuery(
                    '[data-js="sidebar-roll-wb"][data-name=' +
                        sidebar_name +
                        ']'
                )

                if (jQueryrequired_sidebar.length) {
                    jQueryrequired_sidebar.addClass('open-wb')

                    setTimeout(function () {
                        jQueryrequired_sidebar.addClass('slide-wb')
                    }, 10)

                    jQuerymain_curtain.fadeIn(200)
                }
                jQueryrequired_sidebar
                    .find('.help-popover-box-wb')
                    .first()
                    .addClass('wbk_wide_tooltip')
            })
        })

        jQuery('[data-js="sidebar-roll-wb"]').each(function () {
            var jQuerywbk_sidebar_roll_wb = jQuery(this)

            jQuerywbk_sidebar_roll_wb
                .find('[data-js="close-button-wbkb"]')
                .click(function () {
                    jQuerywbk_sidebar_roll_wb.removeClass('slide-wb')

                    setTimeout(function () {
                        jQuerywbk_sidebar_roll_wb.removeClass('open-wb')
                    }, 200)

                    jQuerymain_curtain.fadeOut(200)
                })
        })
    }

    /* END sidebar roll open/close */

    /* START toggle visual editor */

    function wbk_toggle_visual_editor() {
        jQuery('.wbk_option_toggle_editor').click(function () {
            jQuery(this)
                .closest('.editor-block-wb')
                .find('.wbk_option_editor_wrapper')
                .slideToggle(200)
        })
    }

    /* END toggle visual editor */

    /* START range slider */

    /* END range slider */

    /* START copy to clipboard */

    function wbk_copy_to_clipboard() {
        jQuery('[data-js="copy-fieldset-wb"]').each(function () {
            var jQuerycopy_fieldset_wb = jQuery(this)

            var jQuerycopy_value_wb = jQuerycopy_fieldset_wb.find(
                '[data-js="copy-value-wb"]'
            )

            jQuerycopy_fieldset_wb
                .find('[data-js="copy-button-wbkb"]')
                .click(function (e) {
                    e.preventDefault()

                    jQuerycopy_value_wb.select()

                    document.execCommand('copy')
                })
        })
    }

    /* END copy to clipboard */

    /* START close notification bar */

    function wbk_close_notification_bar() {
        var jQuerynotification_bar_wb = jQuery(
            '[data-js="notification-bar-wb"]'
        )

        jQuerynotification_bar_wb
            .find('[data-js="block-close-wb"]')
            .click(function () {
                jQuerynotification_bar_wb.slideUp(200)
            })
    }

    /* END close notification bar */

    /* START appearance tab menu */

    function wbk_appearance_tab_menu() {
        jQuery('[data-js="appearance-menu-wb"]').each(function () {
            var jQueryappearance_menu_li = jQuery(this).find('li')

            jQueryappearance_menu_li.click(function () {
                var appearance_menu_li_name = jQuery(this).attr('data-name')

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

    /* END appearance tab menu */

    /* START appearance selector checkboxes */

    function wbk_appearance_selector_checkboxes() {
        jQuery('[data-js="radio-selector-of-services-wb"]').click(function () {
            var radio_selector_of_services_name = jQuery(this).attr('data-name')

            jQuery('[data-js="selector-of-services-wb"]').removeClass(
                'active-wb'
            )

            jQuery(
                '[data-js="selector-of-services-wb"][data-name=' +
                    radio_selector_of_services_name +
                    ']'
            ).addClass('active-wb')
        })
    }

    /* END appearance selector checkboxes */

    /* START color picker block */

    function wbk_color_picker_block() {
        jQuery('[data-js-block="color-picker-wrapper-wb"]').each(function () {
            var jQuerycolor_picker = jQuery(this).find(
                '[data-js-block="color-picker-wb"]'
            )

            var jQuerycolor_picker_input = jQuery(this).find(
                '[data-js-block="color-picker-input-wb"]'
            )

            jQuerycolor_picker.on('input', function () {
                jQuerycolor_picker_input.val(jQuery(this).val())
            })

            jQuerycolor_picker_input.on('input', function () {
                jQuerycolor_picker.val(jQuery(this).val())
            })
        })
    }

    /* END color picker block */

    /* START colors color picker */

    function wbk_colors_color_picker() {
        jQuery('[data-js="colors-color-picker"]').on('input', function () {
            jQuery('[data-colors-input-color] ~ .checkmark-w').css(
                'background-color',
                jQuery(this).val()
            )
        })

        jQuery('[data-js="colors-input-color"]').on('input', function () {
            jQuery('[data-colors-input-color] ~ .checkmark-w').css(
                'background-color',
                jQuery(this).val()
            )
        })
    }

    /* END colors color picker */

    /* START colors border radius */

    function wbk_colors_border_radius() {
        jQuery('[data-js="colors-border-radius"]').on('input', function () {
            var initial_value = jQuery(this).val()

            var new_value = initial_value.replace(/[^0-9]/g, '')

            jQuery('[data-colors-border-radius] ~ .checkmark-w').css(
                'border-radius',
                new_value + 'px'
            )
        })
    }

    /* END colors border radius */

    /* START borders background color */

    function wbk_borders_background_color() {
        jQuery('[data-js="borders-background-color-picker"]').on(
            'input',
            function () {
                jQuery('[data-borders-background-color]').css(
                    'background-color',
                    jQuery(this).val()
                )

                jQuery(
                    '[data-borders-background-color] ~ .nice-select .current'
                ).css('background-color', jQuery(this).val())

                jQuery('[data-calendar-borders-background-color] .refDate').css(
                    'background-color',
                    jQuery(this).val()
                )
            }
        )

        jQuery('[data-js="borders-background-color"]').on('input', function () {
            jQuery('[data-borders-background-color]').css(
                'background-color',
                jQuery(this).val()
            )

            jQuery(
                '[data-borders-background-color] ~ .nice-select .current'
            ).css('background-color', jQuery(this).val())

            jQuery('[data-calendar-borders-background-color] .refDate').css(
                'background-color',
                jQuery(this).val()
            )
        })
    }

    /* END borders background color */

    /* START borders text color */

    function wbk_borders_text_color() {
        jQuery('[data-js="borders-text-color-picker"]').on(
            'input',
            function () {
                jQuery('[data-borders-text-color]').css(
                    'color',
                    jQuery(this).val()
                )

                jQuery('[data-borders-text-color] ~ .nice-select .current').css(
                    'color',
                    jQuery(this).val()
                )

                jQuery('[data-calendar-borders-text-color] .refDate').css(
                    'color',
                    jQuery(this).val()
                )
            }
        )

        jQuery('[data-js="borders-text-color"]').on('input', function () {
            jQuery('[data-borders-text-color]').css('color', jQuery(this).val())

            jQuery('[data-borders-text-color] ~ .nice-select .current').css(
                'color',
                jQuery(this).val()
            )

            jQuery('[data-calendar-borders-text-color] .refDate').css(
                'color',
                jQuery(this).val()
            )
        })
    }

    /* END borders text color */

    /* START borders color on click */

    function wbk_borders_color_on_click() {}

    /* END borders color on click */

    /* START borders border radius */

    function wbk_borders_border_radius() {
        jQuery('[data-js="borders-border-radius"]').on('input', function () {
            var initial_value = jQuery(this).val()

            var new_value = initial_value.replace(/[^0-9]/g, '')

            jQuery('[data-borders-border-radius]').css(
                'border-radius',
                new_value + 'px'
            )

            jQuery('[data-borders-border-radius] ~ .nice-select .current').css(
                'border-radius',
                new_value + 'px'
            )

            jQuery('[data-calendar-borders-border-radius] .refDate').css(
                'border-radius',
                new_value + 'px'
            )
        })
    }

    /* END borders border radius */

    /* START buttons background color */

    function wbk_buttons_background_color() {
        jQuery('[data-js="buttons-background-color-picker"]').on(
            'input',
            function () {
                jQuery('[data-buttons-background-color]').css(
                    'background-color',
                    jQuery(this).val()
                )
            }
        )

        jQuery('[data-js="buttons-background-color"]').on('input', function () {
            jQuery('[data-buttons-background-color]').css(
                'background-color',
                jQuery(this).val()
            )
        })
    }

    /* END buttons background color */

    /* START buttons text color */

    function wbk_buttons_text_color() {
        jQuery('[data-js="buttons-text-color-picker"]').on(
            'input',
            function () {
                jQuery('[data-buttons-background-color]').css(
                    'color',
                    jQuery(this).val()
                )
            }
        )

        jQuery('[data-js="buttons-text-color"]').on('input', function () {
            jQuery('[data-buttons-background-color]').css(
                'color',
                jQuery(this).val()
            )
        })
    }

    /* END buttons text color */

    /* START buttons border radius */

    function wbk_buttons_border_radius() {
        jQuery('[data-js="buttons-border-radius"]').on('input', function () {
            var initial_value = jQuery(this).val()

            var new_value = initial_value.replace(/[^0-9]/g, '')

            jQuery('[data-buttons-border-radius]').css(
                'border-radius',
                new_value + 'px'
            )
        })
    }

    /* END colors border radius */

    /* START appearance font */

    function wbk_apperance_font() {
        jQuery('[data-js="appearance-font"]').on('change', function () {
            var select_value = jQuery(this).val()

            jQuery('[data-appearance-font]').css('font-family', select_value)
        })
    }

    /* END appearance font */

    /* START desktop/mobile-sitcher */

    function wbk_wbk_toggle_switcher_mobile() {
        jQuery('[data-js-toggle-switcher]').each(function () {
            var jQuerytoggle_item = jQuery('[data-js-toggle-item]')

            jQuerytoggle_item.click(function () {
                jQuerytoggle_item.removeClass('active-wb')

                jQuery(this).addClass('active-wb')

                if (jQuery(this).hasClass('toggle-item-mobile-wb')) {
                    jQuery('[data-js-appointment-box-wbkrapper]').addClass(
                        'mobile-version-wb'
                    )
                } else {
                    jQuery('[data-js-appointment-box-wbkrapper]').removeClass(
                        'mobile-version-wb'
                    )
                }
            })
        })
    }

    /* END desktop/mobile-sitcher */

    /* START appearance main menu mobile toggle */

    function wbk_appearance_main_menu_mobile_toggle() {
        jQuery('[data-js="appearance-toggle-mobile-menu-w"]').click(
            function () {
                var jQuerymain_menu_list_w = jQuery(
                    '[data-js="appearance-main-menu-list-w"]'
                )

                if (jQuerymain_menu_list_w.hasClass('active')) {
                    jQuerymain_menu_list_w.slideUp(200, function () {
                        jQuerymain_menu_list_w.removeClass('active')
                    })
                } else {
                    jQuerymain_menu_list_w.slideDown(200, function () {
                        jQuerymain_menu_list_w.addClass('active')
                    })
                }
            }
        )
    }

    /* END appearance main menu mobile toggle */

    /* START clear datepicker */

    function add_clear_button_to_datepicker() {
        setInterval(function () {
            if (!jQuery('.clear-datepicker-w').length) {
                jQuery('.ui-datepicker-current').after(
                    '<button class="clear-datepicker-w" onclick="clear_datepicker_w();">Clear</button>'
                )
            }
        }, 50)
    }

    function clear_datepicker_w() {
        var jQuerydatepicker_w = jQuery('#datepicker-w')

        jQuerydatepicker_w.val('')

        jQuerydatepicker_w.datepicker('hide')

        jQuerydatepicker_w.datepicker('show')

        jQuery('[data-js="next-step-button-wbk"]').attr('disabled', 'disabled')
    }

    /* END clear datepicker */

    /* START appearance back/next buttons */

    function wbk_appearance_back_next_buttons() {
        jQuery('[data-js-appointment-button]').click(function (e) {
            e.preventDefault()

            var appointment_button_data = jQuery(this).attr(
                'data-js-appointment-button'
            )

            if (appointment_button_data != 0) {
                jQuery('[data-js-appointment-box]').removeClass('active-wb')

                jQuery(
                    '[data-js-appointment-box="' +
                        appointment_button_data +
                        '"]'
                ).addClass('active-wb')
            }
        })
    }

    /* END appearance back/next buttons */

    /* START additional select */

    function additional_select() {
        jQuery('[data-js="additional-select-w"]').each(function () {
            var jQueryadditional_select_clickable_w = jQuery(this).find(
                '[data-js="additional-select-clickable-w"]'
            )

            var jQueryadditional_select_list_w = jQuery(this).find(
                '[data-js="additional-select-list-w"]'
            )

            var jQueryadditional_select_selected_w = jQuery(
                '[data-js="additional-select-selected-w"]'
            )

            var jQueryinput_text_card = jQuery('[data-js="input-text-card"]')

            jQueryadditional_select_clickable_w.click(function () {
                jQueryadditional_select_list_w.slideToggle(200)
            })

            jQueryadditional_select_list_w
                .find('[data-option]')
                .click(function () {
                    var data_option = jQuery(this).attr('data-option')

                    var data_html = jQuery(this).html()

                    jQueryinput_text_card.attr('data-card', data_option)

                    jQueryadditional_select_selected_w.html(data_html)

                    jQueryadditional_select_list_w.slideUp(200)
                })
        })
    }

    /* START additional select */

    /* START input help popover */

    function input_wbk_help_popover() {
        jQuery('[data-js="input-help-w"]').each(function () {
            var jQueryhelp_ico_w = jQuery(this).find('[data-js="help-icon"]')

            var jQuerywbk_help_popover_w = jQuery(this).find(
                '[data-js="help-popover-w"]'
            )

            jQueryhelp_ico_w.click(function () {
                jQuerywbk_help_popover_w.fadeToggle(200)
            })
        })
    }

    /* END input help popover */

    /* START new service tabs menu */

    function new_service_tabs_menu() {
        jQuery('[data-js-service-menu-tabs]').each(function () {
            var jQueryservice_menu_tabs = jQuery(this)

            var jQuerynew_service_menu = jQueryservice_menu_tabs.find(
                '[data-js-new-service-menu]'
            )

            var jQuerynew_service_menu_item =
                jQuerynew_service_menu.find('[data-js-item]')

            var jQuerynew_service_menu_content = jQueryservice_menu_tabs.find(
                '[data-js-new-service-menu-content]'
            )

            var jQuerynew_service_menu_content_item =
                jQuerynew_service_menu_content.find('[data-js-item]')

            jQuerynew_service_menu_item.click(function () {
                var menu_item_data = jQuery(this).attr('data-js-item')

                jQuerynew_service_menu_item.removeClass('active-wb')

                jQuery(this).addClass('active-wb')

                jQuerynew_service_menu_content_item.removeClass('active-wb')

                jQuery(
                    '[data-js-new-service-menu-content] [data-js-item="' +
                        menu_item_data +
                        '"]'
                ).addClass('active-wb')
            })
        })
    }

    /* START new service tabs menu */

    /* START toggle switch */

    function wbk_toggle_switch() {
        jQuery('[data-js-toggle-switch]').each(function () {
            jQuery(this)
                .find('[data-js-toggle-item]')
                .click(function () {
                    jQuery(this)
                        .addClass('active-wb')
                        .siblings('[data-js-toggle-item]')
                        .removeClass('active-wb')
                })
        })
    }

    /* END toggle switch */

    /* START add one more field */

    function add_one_more_field() {
        jQuery('[data-js-add-field-button]').on('click', function () {
            var jQueryadd_one_more_field = jQuery(this).closest(
                '[data-js-add-one-more-field]'
            )

            var jQueryadd_one_more_field_wrapper = jQuery(this).closest(
                '[data-js-add-one-more-field-wrapper]'
            )

            jQueryadd_one_more_field
                .clone(true)
                .appendTo(jQueryadd_one_more_field_wrapper)
        })
    }

    /* END add one more field */

    /* START toggle business hours */

    function toggle_business_hours() {
        jQuery('[data-js-toggle-business-hours]').click(function () {
            if (jQuery(this).is(':checked')) {
                jQuery(this)
                    .closest('[data-js-business-hours-row]')
                    .removeAttr('disabled')
            } else {
                jQuery(this)
                    .closest('[data-js-business-hours-row]')
                    .attr('disabled', '')
            }
        })
    }

    /* END toggle business hours */

    /* START delete business hours row */

    function delete_business_hours_row() {
        jQuery('[data-js-delete-business-hours-row]').click(function () {
            jQuery(this).closest('[data-js-business-hours-row]').detach()
        })
    }

    /* END delete business hours row */

    /* START business hours slider time calculation */

    function business_slider_time_calculation() {
        jQuery('[data-js-slider-wrapper-wb]').each(function () {
            var jQuerybusiness_hours_time = jQuery(this).find(
                '[data-js-business-hours-time]'
            )

            var jQuerybusiness_hours_slider = jQuery(this).find(
                '[data-js-business-hours-slider]'
            )

            jQuery(jQuerybusiness_hours_slider).slider({
                range: true,
                min: 0,
                max: 1440,
                step: 15,
                values: [535, 735],
                slide: function (e, ui) {
                    var hours1 = Math.floor(ui.values[0] / 60)
                    var minutes1 = ui.values[0] - hours1 * 60

                    if (hours1.length == 1) hours1 = '0' + hours1
                    if (minutes1.length == 1) minutes1 = '0' + minutes1
                    if (minutes1 == 0) minutes1 = '00'
                    if (hours1 >= 12) {
                        if (hours1 == 12) {
                            hours1 = hours1
                            minutes1 = minutes1 + ' PM'
                        } else {
                            hours1 = hours1 - 12
                            minutes1 = minutes1 + ' PM'
                        }
                    } else {
                        hours1 = hours1
                        minutes1 = minutes1 + ' AM'
                    }
                    if (hours1 == 0) {
                        hours1 = 12
                        minutes1 = minutes1
                    }

                    var hours2 = Math.floor(ui.values[1] / 60)
                    var minutes2 = ui.values[1] - hours2 * 60

                    if (hours2.length == 1) hours2 = '0' + hours2
                    if (minutes2.length == 1) minutes2 = '0' + minutes2
                    if (minutes2 == 0) minutes2 = '00'
                    if (hours2 >= 12) {
                        if (hours2 == 12) {
                            hours2 = hours2
                            minutes2 = minutes2 + ' PM'
                        } else if (hours2 == 24) {
                            hours2 = 11
                            minutes2 = '59 PM'
                        } else {
                            hours2 = hours2 - 12
                            minutes2 = minutes2 + ' PM'
                        }
                    } else {
                        hours2 = hours2
                        minutes2 = minutes2 + ' AM'
                    }

                    jQuery(jQuerybusiness_hours_time).val(
                        hours1 +
                            ':' +
                            minutes1 +
                            ' - ' +
                            hours2 +
                            ':' +
                            minutes2
                    )
                },
            })
        })
    }

    /* END business hours slider time calculation */

    /* START business hours slider time copy calculation */

    function business_slider_time_calculation_copy() {
        jQuery(
            '[data-js-business-hours-row-copy]:last-child [data-js-slider-wrapper-copy]'
        ).each(function () {
            var jQuerybusiness_hours_time_copy_result = jQuery(this).find(
                '[data-js-business-hours-time-copy-result]'
            )

            var jQuerybusiness_hours_slider_copy_result = jQuery(this).find(
                '[data-js-business-hours-slider-copy-result]'
            )

            jQuery(jQuerybusiness_hours_slider_copy_result).slider({
                range: true,
                min: 0,
                max: 1440,
                step: 15,
                values: [535, 735],
                slide: function (e, ui) {
                    var hours1 = Math.floor(ui.values[0] / 60)
                    var minutes1 = ui.values[0] - hours1 * 60

                    if (hours1.length == 1) hours1 = '0' + hours1
                    if (minutes1.length == 1) minutes1 = '0' + minutes1
                    if (minutes1 == 0) minutes1 = '00'
                    if (hours1 >= 12) {
                        if (hours1 == 12) {
                            hours1 = hours1
                            minutes1 = minutes1 + ' PM'
                        } else {
                            hours1 = hours1 - 12
                            minutes1 = minutes1 + ' PM'
                        }
                    } else {
                        hours1 = hours1
                        minutes1 = minutes1 + ' AM'
                    }
                    if (hours1 == 0) {
                        hours1 = 12
                        minutes1 = minutes1
                    }

                    var hours2 = Math.floor(ui.values[1] / 60)
                    var minutes2 = ui.values[1] - hours2 * 60

                    if (hours2.length == 1) hours2 = '0' + hours2
                    if (minutes2.length == 1) minutes2 = '0' + minutes2
                    if (minutes2 == 0) minutes2 = '00'
                    if (hours2 >= 12) {
                        if (hours2 == 12) {
                            hours2 = hours2
                            minutes2 = minutes2 + ' PM'
                        } else if (hours2 == 24) {
                            hours2 = 11
                            minutes2 = '59 PM'
                        } else {
                            hours2 = hours2 - 12
                            minutes2 = minutes2 + ' PM'
                        }
                    } else {
                        hours2 = hours2
                        minutes2 = minutes2 + ' AM'
                    }

                    jQuery(jQuerybusiness_hours_time_copy_result).val(
                        hours1 +
                            ':' +
                            minutes1 +
                            ' - ' +
                            hours2 +
                            ':' +
                            minutes2
                    )
                },
            })
        })
    }

    /* END business hours slider time copy calculation */

    /* START copy business hours row */

    function copy_business_hours_row() {
        jQuery('[data-js-business-hours-area]').each(function () {
            var jQuerybusiness_hours_area = jQuery(this)

            var jQuerybusiness_hours_field_block =
                jQuerybusiness_hours_area.find(
                    '[data-js-business-hours-field-block]'
                )

            var jQuerybusiness_hours_copy_button =
                jQuerybusiness_hours_area.find(
                    '[data-js-business-hours-copy-button]'
                )

            var jQuerybusiness_hours_row_copy = jQuerybusiness_hours_area.find(
                '[data-js-business-hours-row-copy]'
            )

            jQuerybusiness_hours_copy_button.click(function (e) {
                e.preventDefault()

                jQuerybusiness_hours_row_copy
                    .clone(true)
                    .appendTo(jQuerybusiness_hours_field_block)

                jQuery('[data-js-business-hours-row-copy]:last-child').attr(
                    'data-js-business-hours-row-copy-result',
                    ''
                )

                jQuery(
                    '[data-js-business-hours-row-copy]:last-child [data-js-business-hours-time-copy]'
                ).attr('data-js-business-hours-time-copy-result', '')

                jQuery(
                    '[data-js-business-hours-row-copy]:last-child [data-js-business-hours-slider-copy]'
                ).attr('data-js-business-hours-slider-copy-result', '')

                business_slider_time_calculation_copy()
            })
        })
    }

    /* END copy business hours row */

    /* START category custom table */
    function category_custom_table() {
        jQuery('[category-custom-table]').DataTable({
            scrollY: '370px',
            scrollCollapse: true,
            paging: false,
            info: false,
            search: false,
        })
    }

    /* END category custom table */

    /* START custom table select all rows */

    function custom_table_select_all_checkbox() {
        jQuery('[custom-table-wrapper]').each(function () {
            jQuery(this)
                .find('[checkbox-select-all]')
                .on('click', function (e) {
                    e.stopPropagation()

                    var jQuerycustom_table_wrapper = jQuery(this).closest(
                        '[custom-table-wrapper]'
                    )

                    if (jQuery(this).is(':checked')) {
                        jQuerycustom_table_wrapper
                            .find('[checkbox-select-row]')
                            .prop('checked', true)

                        jQuerycustom_table_wrapper
                            .find('[select-rows-checkbox]')
                            .prop('checked', true)

                        jQuerycustom_table_wrapper
                            .find('tbody')
                            .find('tr')
                            .addClass('row-selected-wb')
                    } else {
                        jQuerycustom_table_wrapper
                            .find('[checkbox-select-row]')
                            .prop('checked', false)

                        jQuerycustom_table_wrapper
                            .find('[select-rows-checkbox]')
                            .prop('checked', false)

                        jQuerycustom_table_wrapper
                            .find('tbody')
                            .find('tr')
                            .removeClass('row-selected-wb')
                    }
                })
        })
    }

    /* END custom table select all rows */

    /* START custom table scrollbar */
    function custom_table_custom_scrollbar_helper() {
        if (jQuery('.dataTables_scrollBody').length) {
            jQuery('[custom-table-wrapper] .dataTables_scrollHeadInner').css(
                'width',
                'auto'
            )

            jQuery('[custom-table-wrapper] table').css('width', '100%')
        }
    }

    /* END custom table scrollbar */

    /* START custom table delete row */

    function custom_table_delete_row() {
        jQuery('[custom-table-wrapper] [delete-row]').click(function () {
            jQuery(this).closest('tr').detach()
        })
    }

    /* END custom table delete row */

    /* START custom table copy row */

    function custom_table_copy_row() {
        jQuery('[custom-table-wrapper] [copy-row]').click(function () {
            jQuery(this).closest('tr').siblings('[hidden-details-row]').detach()

            jQuery(this)
                .closest('tr')
                .closest('[custom-table]')
                .find('tr.active-wb')
                .removeClass('active-wb')

            var jQuerycopy_row = jQuery(this).closest('tr')

            var jQuerycloned_row = jQuerycopy_row.clone(true)

            jQuery(jQuerycloned_row).insertAfter(jQuerycopy_row)
        })
    }

    /* END custom table copy row */

    /* START select several table rows */

    function select_several_table_rows() {
        jQuery('[custom-table-wrapper]').each(function () {
            var jQuerycustom_table_wrapper = jQuery(this)

            var jQueryselect_rows_area = jQuery(this).find('[select-rows-area]')

            var jQueryblock_dropdown =
                jQueryselect_rows_area.find('[block-dropdown]')

            var jQueryselect_rows_checkbox = jQuery(this).find(
                '[select-rows-checkbox]'
            )

            var jQuerymass_delete_button = jQuerycustom_table_wrapper.find(
                '[mass-delete-button]'
            )

            jQuerycustom_table_wrapper
                .find('[select-rows-block]')
                .find('[clickable-area]')
                .click(function () {
                    if (jQueryselect_rows_area.hasClass('active-wb')) {
                        jQueryselect_rows_area.removeClass('active-wb')

                        jQueryblock_dropdown.fadeOut(200)
                    } else {
                        jQueryselect_rows_area.addClass('active-wb')

                        jQueryblock_dropdown.fadeIn(200)
                    }
                })

            jQueryblock_dropdown.find('li').click(function () {
                if (jQuery(this).attr('data-js') == 'select-all') {
                    if (jQueryselect_rows_checkbox.is(':checked')) {
                        jQueryselect_rows_checkbox.prop('checked', false)

                        jQuerycustom_table_wrapper
                            .find('[checkbox-select-all]')
                            .prop('checked', false)

                        jQuerycustom_table_wrapper
                            .find('[checkbox-select-row]')
                            .prop('checked', false)

                        jQuerycustom_table_wrapper
                            .find('tbody')
                            .find('tr')
                            .removeClass('row-selected-wb')
                    } else {
                        jQueryselect_rows_checkbox.prop('checked', true)

                        jQuerycustom_table_wrapper
                            .find('[checkbox-select-all]')
                            .prop('checked', true)

                        jQuerycustom_table_wrapper
                            .find('[checkbox-select-row]')
                            .prop('checked', true)

                        jQuerycustom_table_wrapper
                            .find('tbody')
                            .find('tr')
                            .addClass('row-selected-wb')
                    }
                } else {
                    var this_data_js = jQuery(this).attr('data-js')

                    jQuery(this)
                        .closest('[custom-table-wrapper]')
                        .find('[checkbox-select-row]')
                        .each(function () {
                            if (
                                jQuery(this).attr('data-status') == this_data_js
                            ) {
                                jQuery(this).prop('checked', true)

                                jQuerycustom_table_wrapper
                                    .find('[select-rows-checkbox]')
                                    .prop('checked', true)

                                jQuerycustom_table_wrapper
                                    .find('[checkbox-select-all]')
                                    .prop('checked', true)

                                jQuerycustom_table_wrapper
                                    .find('tbody')
                                    .find('tr')
                                    .addClass('row-selected-wb')
                            }
                        })
                }

                jQueryselect_rows_area.removeClass('active-wb')

                jQueryblock_dropdown.fadeOut(200)
            })

            jQuerymass_delete_button.click(function () {
                jQuerycustom_table_wrapper
                    .find('[checkbox-select-row]:checked')
                    .closest('tr')
                    .siblings('tr[hidden-details-row]')
                    .detach()

                jQuerycustom_table_wrapper
                    .find('[checkbox-select-row]:checked')
                    .closest('tr')
                    .detach()

                jQuerycustom_table_wrapper
                    .find('[select-rows-checkbox]')
                    .prop('checked', false)

                jQuerycustom_table_wrapper
                    .find('[checkbox-select-all]')
                    .prop('checked', false)
            })
        })
    }

    /* END select several table rows */

    /* START custom scrollbar */
    function custom_scrollbar() {
        jQuery('.dataTables_scrollBody').attr('data-scrollbar', '')

        Scrollbar.initAll({ alwaysShowTracks: true, damping: 0.5 })
    }

    /* END custom scrollbar */

    /* START services custom table */
    function services_custom_table() {
        jQuery('[services-custom-table]').DataTable({
            paging: true,
            info: false,
            lengthMenu: [
                [5, 10, 20, -1],
                [5, 10, 20, 'All'],
            ],
        })
    }

    /* END services custom table */

    /* START hidden details row copy */

    function hidden_details_row_copy(obj) {
        var jQueryhas_hidden_details = jQuery(obj).closest(
            '[has-hidden-details]'
        )

        var jQueryhidden_details_row = jQueryhas_hidden_details
            .find('[hidden-details-row]')
            .clone(true)

        if (jQueryhas_hidden_details.hasClass('active-wb')) {
            jQueryhas_hidden_details.next('[hidden-details-row]').detach()

            jQueryhas_hidden_details.removeClass('active-wb')
        } else {
            jQueryhas_hidden_details.after(jQueryhidden_details_row)

            jQueryhas_hidden_details.addClass('active-wb')
        }
    }

    function remove_details_on_pagination_click() {
        jQuery('.dataTables_paginate').on('click', function () {
            jQuery('[has-hidden-details]').removeClass('active-wb')
        })
    }

    /* END hidden details row copy */

    /* START toggle switch buttons */
    function wbk_toggle_switch_buttons() {
        jQuery('[toggle-switch] li').click(function () {
            jQuery(this)
                .addClass('active-wb')
                .siblings('li')
                .removeClass('active-wb')
        })
    }

    /* END toggle switch buttons */

    /* START bookings custom table full */
    function bookings_custom_table_full() {
        jQuery('[bookings-custom-table-full]').DataTable({
            scrollY: '520px',
            scrollCollapse: true,
            paging: false,
            info: false,
            search: false,
        })
    }

    /* END bookings custom table full */

    /* START bookings custom table */
    function bookings_custom_table() {
        jQuery('[bookings-custom-table]').DataTable({
            scrollY: '370px',
            scrollCollapse: true,
            paging: false,
            info: false,
            search: false,
        })
    }

    /* END bookings custom table */

    /* START pricing rules custom table */
    function pricing_rules_custom_table() {
        jQuery('[pricing-rules-custom-table]').DataTable({
            scrollY: '450px',
            scrollCollapse: true,
            paging: false,
            info: false,
            search: false,
        })
    }

    /* END pricing rules custom table */

    /* START pricing rules custom table */
    function coupon_custom_table() {
        jQuery('[coupon-custom-table]').DataTable({
            scrollY: '450px',
            scrollCollapse: true,
            paging: false,
            info: false,
            search: false,
        })
    }

    /* END pricing rules custom table */

    /* START pricing rules custom table */
    function email_templates_custom_table() {
        jQuery('[email-templates-custom-table]').DataTable({
            scrollY: '450px',
            scrollCollapse: true,
            paging: false,
            info: false,
            search: false,
        })
    }

    /* END pricing rules custom table */

    /* START google calendars custom table */
    function google_calendars_custom_table() {
        jQuery('[google-calendars-custom-table]').DataTable({
            scrollY: '450px',
            scrollCollapse: true,
            paging: false,
            info: false,
            search: false,
        })
    }

    /* END google calendars custom table */

    /* START status custom select */

    function status_custom_select() {
        jQuery('[status-select]').each(function () {
            var data_value = jQuery(this).attr('data-value')

            jQuery(this)
                .closest('tr')
                .find('[checkbox-select-row]')
                .attr('data-status', data_value)
        })

        jQuery('[status-select] .nice-select .list li').on(
            'click',
            function () {
                var jQuerystatus_select =
                    jQuery(this).closest('[status-select]')

                var data_value = jQuery(this).attr('data-value')

                jQuerystatus_select.attr('data-value', data_value)

                jQuery(this)
                    .closest('tr')
                    .find('[checkbox-select-row]')
                    .attr('data-status', data_value)
            }
        )
    }

    /* END status custom select */

    /* START table custom select drop up */
    function table_custom_select_drop_up() {
        jQuery('.dataTables_scrollBody').each(function () {
            jQuery(this)
                .find('select')
                .closest('[custom-table-wrapper]')
                .addClass('has-select')
        })
    }

    /* END table custom select drop up */

    /* START selected customers list delete row */

    function selected_customers_list_delete_row() {
        jQuery('[selected-customers-list] [delete-row]').on(
            'click',
            function () {
                jQuery(this).closest('li').detach()
            }
        )
    }

    /* END selected customers list delete row */

    /* START table checkbox add class to row */

    function table_checkbox_add_class_to_row() {
        jQuery('[checkbox-select-row]').on('click', function () {
            if (jQuery(this).is(':checked')) {
                jQuery(this).closest('tr').addClass('row-selected-wb')

                jQuery(this)
                    .closest('[custom-table-wrapper]')
                    .find('[select-rows-checkbox]')
                    .prop('checked', true)
            } else {
                jQuery(this).closest('tr').removeClass('row-selected-wb')
            }
        })
    }

    /* END table checkbox add class to row */

    /* START fullcalendar */

    function fullcalendar() {
        if (document.getElementById('schedules-calendar-wb')) {
            jQuery('.main-block-wb').addClass('has-fullcalendar-wb')

            var calendarEl = document.getElementById('schedules-calendar-wb')

            var calendar = new FullCalendar.Calendar(calendarEl, {
                timeZone: 'UTC',
                initialView: 'dayGridMonth',
                allDaySlot: false,
                dayHeaderFormat: { weekday: 'short', day: 'numeric' },
                eventClick: function (info) {},
                headerToolbar: {
                    left: 'title,prev,next',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                },
                dayMaxEvents: true,
                events: 'https://fullcalendar.io/api/demo-feeds/events.json',
            })

            calendar.render()

            var jQuerycalendarEl = jQuery(calendarEl)

            setInterval(function () {
                jQuerycalendarEl.find('.fc-event-main').each(function () {
                    var jQueryevent_popover_wb =
                        jQuery(this).find('.event-popover-wb')

                    if (!jQueryevent_popover_wb.length) {
                        jQuery(this).append(
                            '<div class="event-popover-wb"><div class="popover-title-wb"></div><div class="popover-time-wb">10:30-11:00 AM</div><div class="popover-service-wb">Example Service</div><div class="popover-footer-wb"><div class="popover-name-letter-wb">A</div><div class="popover-name-wb">Amina Amina</div><div class="popover-edit-wb" data-js="open-sidebar-wb" data-name="sidebar-edit-appointment"></div></div></div>'
                        )

                        jQuery(this)
                            .closest('.fc-event')
                            .on('click', function () {
                                var jQueryevent_popover_wb_new =
                                    jQuery(this).find('.event-popover-wb')

                                if (
                                    jQueryevent_popover_wb_new.hasClass(
                                        'active-wb'
                                    )
                                ) {
                                    jQueryevent_popover_wb_new.removeClass(
                                        'active-wb'
                                    )
                                } else {
                                    jQueryevent_popover_wb_new.addClass(
                                        'active-wb'
                                    )
                                }
                            })

                        wbk_sidebar_roll()
                    }
                })

                /* START add test lock closed to month view */

                jQuerycalendarEl.find('th:first-child').addClass('locked-wb')

                jQuerycalendarEl.find('td:first-child').addClass('locked-wb')

                /* END add test lock closed to month view */
            }, 500)
        }
    }

    function wbk_save_options() {
        jQuery('.wb-settings-fields-form').submit(function (e) {
            e.preventDefault()

            let buttonSubmit = jQuery(this).find('.wb-save-options')
            wbk_change_button_status_options(buttonSubmit, 'loading')

            jQuery.ajax({
                type: 'POST',
                url: ajaxurl,
                data: {
                    action: 'wbk_save_options',
                    form_data: jQuery(this).serialize(),
                    nonce: wbkl10n.wbkb_nonce,
                },
                success: function (result) {
                    wbk_change_button_status_options(buttonSubmit, 'regular')

                    jQuery('.wbk_zoom_ask_to_save').addClass('wbk_hidden')
                    jQuery('.wbk_zoom_auth_link').removeClass('wbk_hidden')
                },
            })
        })
    }

    function wbk_init_dependencies() {
        jQuery('.field-block-wb').each(function () {
            let element = jQuery(this)
            let dependency = element.data('dependency')
            if (dependency) {
                jQuery.each(dependency, function (key, value) {
                    let valueArray = value.split('|')
                    let check = false
                    valueArray.forEach(function (value) {
                        let option = jQuery('#' + key)

                        if (':checked' === value && option.is(':checked')) {
                            check = true
                        } else if (value === option.val()) {
                            check = true
                        } else if (
                            'not_checked' === value &&
                            !option.is(':checked')
                        ) {
                            check = true
                        }
                    })
                    if (check) {
                        element.show()
                    } else {
                        element.hide()
                    }
                })
            }
        })
    }
})(jQuery)

function wbk_change_button_status_options(elem, status) {
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
