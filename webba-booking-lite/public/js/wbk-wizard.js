class WBK_Wizard_Form {
    constructor(container) {
        const get_this = () => {
            return this;
        };

        this.container = container;
        get_this().init_nice_select();

        var i = 1;

        container.find('.wbk-input').on('input', function () {
            get_this().validate_form();
        });

        container
            .find('.wizard-content-screen-active-w')
            .find('.wbk-input')
            .addClass('linear-animation-w');

        container.find('.button-next-w').click(function () {
            get_this().next_step();
            return false;
        });

        container.find('.button-prev-w').click(function () {
            get_this().prev_step();
            return false;
        });

        jQuery(document).on(
            'wbk_after_screen_rendered',
            function (event, response) {
                get_this().after_screen_rendered(response);
            }
        );

        this.container.attr('data-step', '1');
        this.validate_prev_next_buttons();
        wb_slider_range_working_hours();

        this.validate_form();
        this.update_steps();
      
        jQuery('#more_services').change(function () {
            jQuery('.more_services_message_wb').toggle();
        });
    }

    after_screen_rendered(response) {
        const get_this = () => {
            return this;
        };
    }

    remove_step_subtitle(slug) {
        this.container
            .find(".appointment-status-list-w li[data-slug='" + slug + "']")
            .find('.subtitle-list-w')
            .remove();
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
        );
    }

    change_button_status(elem, status) {
        if (status == 'loading') {
            elem.addClass('loading-btn-wb');
            elem.find('.btn-ring-wb').css('opacity', '1');
            elem.attr('disabled', true);
        }
        if (status == 'regular') {
            elem.removeClass('loading-btn-wb');
            elem.find('.btn-ring-wb').css('opacity', '0');
            elem.attr('disabled', false);
        }
    }

    init_nice_select() {
        //  jQuery('.wbk-select').niceSelect();
    }

    get_next_screen() {
        return this.container
            .find('.wizard-tab-active-wb')
            .next('.wizard-tab-wb');
    }

    get_prev_screen() {
        return this.container
            .find('.wizard-tab-active-wb')
            .prev('.wizard-tab-wb');
    }

    switch_to_screen() {}

    validate_form() {
        const get_this = () => {
            return this;
        };
        let passed = false;
        let all_passed = true;
        this.container
            .find('.wizard-tab-active-wb')
            .find('.wbk-input')
            .not('.nice-select')
            .each(function () {
                const elem = jQuery(this);
                const value = jQuery(this).val();
                const field_name = jQuery(this).attr('data-validationmsg');
                switch (jQuery(this).attr('data-validation')) {
                    case 'positive':
                        if (value.trim() == '') {
                            passed = false;
                        } else {
                            passed = wbk_check_integer_min_max(
                                value,
                                1,
                                99999999
                            );
                        }
                        break;
                    case 'not_empty':
                        passed = wbk_check_string(value, 1, 16384);
                        break;
                    case 'must_have_items':
                        passed = false;
                        elem.find('option').each(function () {
                            if (jQuery(this).prop('selected')) {
                                passed = true;
                            }
                        });
                        break;
                    case 'email':
                        passed = wbk_check_email(value);
                        break;
                    default:
                        passed = true;
                }
                if (!passed) {
                    all_passed = false;
                }
            });
        if (!all_passed) {
            get_this().container.find('.button-next-w').attr('disabled', true);
        } else {
            get_this().container.find('.button-next-w').attr('disabled', false);
        }

        return all_passed;
    }

    clear_fields(element) {
        element.find('.dynamic-content-w').remove();
        element.find('.wbk-input').val('');
        element.find('select.wbk-input').val(0);
        // element.find('.wbk-input').niceSelect('update');
        element.find('.wbk_times > option').remove();
        element.attr('style', '');
    }

    validate_prev_next_buttons() {
        const get_this = () => {
            return this;
        };
        var step = parseInt(get_this().container.attr('data-step'));
         
        if (step == 1) {
            get_this()
                .container.find('.button-prev-w')
                .addClass('wbk_hidden');
            get_this()
                .container.find('.wbk_wizard_youtube_link')
                .removeClass('wbk_hidden');
        } else {
            get_this()
                .container.find('.button-prev-w')
                .removeClass('wbk_hidden');
            get_this()
                .container.find('.wbk_wizard_youtube_link')
                .addClass('wbk_hidden');
        }
    }

    finalize(response) {
        const get_this = () => {
            return this;
        };
        this.container.find('.appointment-status-wrapper-w').fadeOut('fast');
        this.container.find('.wizard-content-w').fadeOut('fast', function () {
            response = jQuery.parseJSON(response);
            get_this().container.append(response.thanks_message);
        });
    }

    prev_step() {
        const get_this = () => {
            return this;
        };
        var prev_screen = get_this().get_prev_screen();
        var step = parseInt(get_this().container.attr('data-step'));

        step--;
        get_this().container.attr('data-step', step);

        //this.clear_fields(prev_screen);
        get_this().container.find('.wizard-tab-active-wb');

        get_this().change_button_status(
            get_this().container.find('.button-next-w'),
            'regular'
        );
        get_this()
            .container.find('.wizard-tab-active-wb')
            .removeClass('wizard-tab-active-wb');

        prev_screen.addClass('wizard-tab-active-wb');
        prev_screen.toggle(true);

        get_this().update_steps();

        this.validate_prev_next_buttons();
        get_this().update_steps();
    }

    async next_step() {
        const get_this = () => {
            return this;
        };
        var next_screen = get_this().get_next_screen();
        if (next_screen.length == 0) {
            return;
        }
        // this.clear_fields(next_screen);
        var step = parseInt(get_this().container.attr('data-step'));
        step++;
        get_this().container.attr('data-step', step);
        if (typeof next_screen.attr('data-request') !== 'undefined') {
            get_this().change_button_status(
                get_this().container.find('.button-next-w'),
                'loading'
            );
            var response = await this.do_request(
                next_screen.attr('data-request')
            );
            response = jQuery.parseJSON(response);
            if (response != false) {
                this.show_next_screen(next_screen, response);
                return;
            }
        }
        this.show_next_screen(next_screen);
    }
    do_request(action) {
        return new Promise((resolve) => {
            var form_data = new FormData(this.container.find('form')[0]);

            form_data.append('action', action);
            form_data.append('nonce', wbk_wizardl10n.nonce);

            const result = jQuery.ajax({
                url: wbk_wizardl10n.ajaxurl,
                type: 'POST',
                data: form_data,
                cache: false,
                processData: false,
                contentType: false,

                success: function (response) {
                    resolve(response);
                },
                error: function () {
                    resolve(false);
                },
                complete: function () {},
            });
        });
    }

    show_next_screen(next_screen, response) {
        const get_this = () => {
            return this;
        };
        this.container
            .find('.wizard-tab-active-wb')
            .fadeOut('fast', function () {
                get_this().change_button_status(
                    get_this().container.find('.button-next-w'),
                    'regular'
                );
                get_this()
                    .container.find('.wizard-tab-active-wb')
                    .removeClass('wizard-tab-active-wb');
                next_screen.addClass('wizard-tab-active-wb');
                next_screen.find('.wbk-input').addClass('linear-animation-w');

                get_this().validate_prev_next_buttons();
                get_this().update_steps();

                var next_screen_check = get_this().get_next_screen();
                if (next_screen_check.length == 0) {
                    jQuery('.buttons-block-wb').css(
                        'flex-direction',
                        'row-reverse'
                    );
                    jQuery('.buttons-block-wb').html(
                        '<button type="button" data-action="finalize" class="button-wb wizard-final-wb">' +
                            wbk_wizardl10n.finish_setup_wizard +
                            '<span class="btn-ring-wb"></span>' +
                            '</button>' +
                            '<input type="hidden" class="final_action" name="final_action">'
                    );
                    jQuery('.skip-link-wrapper-wb').remove();

                    jQuery('#shortcode-booking-form-wb').val(
                        response.shortcode
                    );
                    jQuery('.wizard-final-wb').click(async function (event) {
                        get_this().change_button_status(
                            jQuery(this),
                            'loading'
                        );
                        get_this()
                            .container.find('.final_action')
                            .val(jQuery(this).attr('data-action'));

                        var response = await get_this().do_request(
                            'wbk_wizard_final_setup'
                        );
                        response = jQuery.parseJSON(response);
                        if (response.status == 'fail') {
                            window.location = wbk_wizardl10n.admin_url;
                        } else {
                            window.location = response.url;
                            return;
                        }
                        event.preventDefault();
                    });
                    return;
                }
            });
    }

    update_steps() {
        jQuery('.setup-steps-block-wb > li').removeClass('active');
        jQuery('.setup-steps-block-wb > li').removeClass('done');

        var step = this.container.attr('data-step');
        jQuery('.setup-steps-block-wb > li:nth-child(' + step + ')').addClass(
            'active'
        );
        for (var i = 1; i < step; i++) {
            jQuery('.setup-steps-block-wb > li:nth-child(' + i + ')').addClass(
                'done'
            );
        }
    }
}

jQuery(function ($) {
    jQuery('.setup-area-wb').each(function () {
        var form = new WBK_Wizard_Form(jQuery(this));
    });
});

function wb_slider_range_working_hours() {
    jQuery('#slider-range-working-hours-wb').slider({
        range: true,
        min: 0,
        max: 1440,
        step: 15,
        values: [535, 1080],
        slide: function (e, ui) {
            jQuery('.range_start').val(ui.values[0]);
            jQuery('.range_end').val(ui.values[1]);

            var hours1 = Math.floor(ui.values[0] / 60);
            var minutes1 = ui.values[0] - hours1 * 60;

            if (hours1.length == 1) hours1 = '0' + hours1;
            if (minutes1.length == 1) minutes1 = '0' + minutes1;
            if (minutes1 == 0) minutes1 = '00';
            if (hours1 >= 12) {
                if (hours1 == 12) {
                    hours1 = hours1;
                    minutes1 = minutes1 + ' PM';
                } else {
                    hours1 = hours1 - 12;
                    minutes1 = minutes1 + ' PM';
                }
            } else {
                hours1 = hours1;
                minutes1 = minutes1 + ' AM';
            }
            if (hours1 == 0) {
                hours1 = 12;
                minutes1 = minutes1;
            }

            var hours2 = Math.floor(ui.values[1] / 60);
            var minutes2 = ui.values[1] - hours2 * 60;

            if (hours2.length == 1) hours2 = '0' + hours2;
            if (minutes2.length == 1) minutes2 = '0' + minutes2;
            if (minutes2 == 0) minutes2 = '00';
            if (hours2 >= 12) {
                if (hours2 == 12) {
                    hours2 = hours2;
                    minutes2 = minutes2 + ' PM';
                } else if (hours2 == 24) {
                    hours2 = 0;
                    minutes2 = '00 AM';
                } else {
                    hours2 = hours2 - 12;
                    minutes2 = minutes2 + ' PM';
                }
            } else {
                hours2 = hours2;
                minutes2 = minutes2 + ' AM';
            }

            jQuery('#slider-range-working-hours-time-wb').val(
                hours1 + ':' + minutes1 + ' - ' + hours2 + ':' + minutes2
            );
        },
    });
}

function wbk_copy_shortcode() {
    var copyText = document.getElementById('shortcode-booking-form-wb');
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    jQuery('.inner_copy_wb').html('Copied  ');
    return false;
}
