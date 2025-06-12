class Plugion_WBK {
    constructor() {
        const get_this = () => {
            return this
        }
        get_this().properties_default_content_add = new Object()
        get_this().properties_default_content_update = new Object()
        get_this().filter_form_content = new Object()
        get_this().filter_form_values = new Object()
        get_this().discard_buffer = ''
        get_this().tables = new Object()
        get_this().field_validators = {
            // validation for text field
            text: function (value, required, element) {
                if (value.trim() == '' && required == '1') {
                    return false
                }
                if (element.attr('data-type') == '') {
                    if (value.trim().length > 256) {
                        return false
                    }
                } else {
                    if (element.attr('data-type') == 'positive_integer') {
                        return get_this().validate_integer_range(
                            value,
                            1,
                            2147483647
                        )
                    }
                    if (element.attr('data-type') == 'none_negative_integer') {
                        if (required == '' && value == '') {
                            return true
                        }
                        return get_this().validate_integer_range(
                            value,
                            0,
                            2147483647
                        )
                    }
                    if (element.attr('data-type') == 'integer') {
                        return get_this().validate_integer_range(
                            value,
                            -2147483647,
                            2147483647
                        )
                    }
                    if (element.attr('data-type') == 'float') {
                        return get_this().validate_integer_range(value)
                    }
                    if (element.attr('data-type') == 'none_negative_float') {
                        if (get_this().validate_float(value)) {
                            if ((value) => 0) {
                                return true
                            } else {
                                return false
                            }
                        } else {
                            return false
                        }
                    }
                    if (element.attr('data-type') == 'email') {
                        return get_this().validate_email(value)
                    }
                }
                return true
            },
            // validation for radio button
            radio: function (value, required, element) {
                return true
            },
            // validation for checbox button
            checkbox: function (value, required, element) {
                return true
            },
            // validation for select
            select: function (value, required, element) {
                if (element.prop('multiple')) {
                    if ((value == null || value == '') && required == '1') {
                        return false
                    }
                } else {
                    if (value.trim() == 'plugion_null' && required == '1') {
                        return false
                    }
                }
                return true
            },
            // validation for datetime input
            datetime: function (value, required, element) {
                if (value.trim() == '' && required == '1') {
                    var date_input = jQuery('#' + element.attr('id') + '_date')
                    if (date_input.val() == '') {
                        date_input.addClass('plugion_input_field_error')
                    }
                    var time_input = jQuery('#' + element.attr('id') + '_time')
                    if (time_input.val() == '') {
                        time_input.addClass('plugion_input_field_error')
                    }
                    return false
                }
                return true
            },
            date: function (value, required, element) {
                if (value.trim() == '' && required == '1') {
                    return false
                }
                return true
            },
            textarea: function (value, required, element) {
                if (value.trim().length > 65535) {
                    return false
                }
                if (value.trim() == '' && required == '1') {
                    return false
                }
                return true
            },
            editor: function (value, required, element) {
                if (value.trim().length > 65535) {
                    return false
                }
                if (value.trim() == '' && required == '1') {
                    return false
                }
                return true
            },
            date_range: function (value, required, element) {
                var start = Date.parse(element.attr('data-start'))
                var end = Date.parse(element.attr('data-end'))
                if ((isNaN(start) || isNaN(end)) && required == '1') {
                    return false
                }
                if (
                    (!isNaN(start) && isNaN(end)) ||
                    (isNaN(start) && !isNaN(end))
                ) {
                    return false
                }
                if (start > end) {
                    return false
                }
                return true
            },
            wbk_business_hours: function (value, required, element) {
                return true
            },
        }
        get_this().field_setters = {
            // setter for radio
            radio: function (element, value) {
                element.val([value])
            },
            // setter for checkbox
            checkbox: function (element, value) {
                element.val([value])
            },
            // setter for select
            select: function (element, value) {
                if (value == '' || value == null) {
                    if (element.attr('data-default') == '') {
                        value = []
                    } else {
                        value = element.attr('data-default')
                    }
                }
                if (element.prop('multiple')) {
                    element.chosen('destroy')
                    if (!Array.isArray(value)) {
                        value = JSON.parse(value)
                    }
                    element.val(value)
                    element.attr('data-initial-val', value)
                    element.chosen({ width: '99%' })
                    element
                        .closest('.plugion_input_container')
                        .find('.plugion_deselect_all_options')
                        .click(function () {
                            element.find('option').prop('selected', false)
                            element.trigger('chosen:updated')
                        })
                    element
                        .closest('.plugion_input_container')
                        .find('.plugion_select_all_options')
                        .click(function () {
                            element.find('option').prop('selected', true)
                            element.trigger('chosen:updated')
                        })
                } else {
                    element.niceSelect('destroy')
                    element.val(value)
                    element.attr('data-initial-val', value)
                    element.niceSelect()
                }
            },
            datetime: function (element, value) {
                var datepicker = element
                    .siblings('.plugion_input_container_small')
                    .find('.plugion_input_datetime_date')
                    .pickadate({
                        monthsFull: [
                            wbk_dashboardl10n.january,
                            wbk_dashboardl10n.february,
                            wbk_dashboardl10n.march,
                            wbk_dashboardl10n.april,
                            wbk_dashboardl10n.may,
                            wbk_dashboardl10n.june,
                            wbk_dashboardl10n.july,
                            wbk_dashboardl10n.august,
                            wbk_dashboardl10n.september,
                            wbk_dashboardl10n.october,
                            wbk_dashboardl10n.november,
                            wbk_dashboardl10n.december,
                        ],
                        monthsShort: [
                            wbk_dashboardl10n.jan,
                            wbk_dashboardl10n.feb,
                            wbk_dashboardl10n.mar,
                            wbk_dashboardl10n.apr,
                            wbk_dashboardl10n.mays,
                            wbk_dashboardl10n.jun,
                            wbk_dashboardl10n.jul,
                            wbk_dashboardl10n.aug,
                            wbk_dashboardl10n.sep,
                            wbk_dashboardl10n.oct,
                            wbk_dashboardl10n.nov,
                            wbk_dashboardl10n.dec,
                        ],
                        weekdaysFull: [
                            wbk_dashboardl10n.sunday,
                            wbk_dashboardl10n.monday,
                            wbk_dashboardl10n.tuesday,
                            wbk_dashboardl10n.wednesday,
                            wbk_dashboardl10n.thursday,
                            wbk_dashboardl10n.friday,
                            wbk_dashboardl10n.saturday,
                        ],
                        weekdaysShort: [
                            wbk_dashboardl10n.sun,
                            wbk_dashboardl10n.mon,
                            wbk_dashboardl10n.tue,
                            wbk_dashboardl10n.wed,
                            wbk_dashboardl10n.thu,
                            wbk_dashboardl10n.fri,
                            wbk_dashboardl10n.sat,
                        ],
                        today: wbk_dashboardl10n.today,
                        clear: wbk_dashboardl10n.clear,
                        close: wbk_dashboardl10n.close,
                        format: element.attr('data-dateformat'),
                        onSet: function (thingSet) {
                            if (thingSet.select == null) {
                                element
                                    .siblings('.plugion_input_container_small')
                                    .find('.plugion_input_datetime_date')
                                    .siblings('label')
                                    .removeClass('plugion_label_pickadate')
                                element.attr('data-date', '')
                            } else {
                                element.attr(
                                    'data-date',
                                    this.get('select', 'dd mmm yyyy')
                                )
                                element
                                    .siblings('.plugion_input_container_small')
                                    .find('.plugion_input_datetime_date')
                                    .siblings('label')
                                    .addClass('plugion_label_pickadate')
                            }
                            if (
                                element.attr('data-date') != '' &&
                                element.attr('data-time') != ''
                            ) {
                                element.val(
                                    element.attr('data-date') +
                                        ' ' +
                                        element.attr('data-time') +
                                        ' ' +
                                        element.attr('data-timezone')
                                )
                            } else {
                                element.val('')
                            }
                        },
                    })
                var timepicker = element
                    .siblings('.plugion_input_container_small')
                    .find('.plugion_input_datetime_time')
                    .pickatime({
                        format: element.attr('data-timeformat'),
                        onSet: function (thingSet) {
                            if (thingSet.select == null) {
                                element
                                    .siblings('.plugion_input_container_small')
                                    .find('.plugion_input_datetime_time')
                                    .siblings('label')
                                    .removeClass('plugion_label_pickadate')
                                element.attr('data-time', '')
                            } else {
                                element.attr(
                                    'data-time',
                                    this.get('select', 'HH:i:00')
                                )
                                element
                                    .siblings('.plugion_input_container_small')
                                    .find('.plugion_input_datetime_time')
                                    .siblings('label')
                                    .addClass('plugion_label_pickadate')
                            }
                            if (
                                element.attr('data-date') != '' &&
                                element.attr('data-time') != ''
                            ) {
                                element.val(
                                    element.attr('data-date') +
                                        ' ' +
                                        element.attr('data-time') +
                                        ' ' +
                                        element.attr('data-timezone')
                                )
                            } else {
                                element.val('')
                            }
                        },
                    })
                if (value != '' && value != null) {
                    let date1 = new Date(
                        Date.parse(value.replace(/[-]/g, '/') + ' UTC')
                    )
                    let date2 = new Date(
                        Date.parse(
                            value.replace(/[-]/g, '/') +
                                ' ' +
                                element.attr('data-timezone')
                        )
                    )
                    var delta = (date1 - date2) / 1000
                    date1.setSeconds(date1.getSeconds() + delta)
                    datepicker
                        .pickadate('picker')
                        .set('select', [
                            date1.getUTCFullYear(),
                            date1.getUTCMonth(),
                            date1.getUTCDate(),
                        ])
                    timepicker
                        .pickatime('picker')
                        .set('select', [
                            date1.getUTCHours(),
                            date1.getUTCMinutes(),
                        ])
                }
            },
            date: function (element, value) {
                var datepicker = element.pickadate({
                    monthsFull: [
                        wbk_dashboardl10n.january,
                        wbk_dashboardl10n.february,
                        wbk_dashboardl10n.march,
                        wbk_dashboardl10n.april,
                        wbk_dashboardl10n.may,
                        wbk_dashboardl10n.june,
                        wbk_dashboardl10n.july,
                        wbk_dashboardl10n.august,
                        wbk_dashboardl10n.september,
                        wbk_dashboardl10n.october,
                        wbk_dashboardl10n.november,
                        wbk_dashboardl10n.december,
                    ],
                    monthsShort: [
                        wbk_dashboardl10n.jan,
                        wbk_dashboardl10n.feb,
                        wbk_dashboardl10n.mar,
                        wbk_dashboardl10n.apr,
                        wbk_dashboardl10n.mays,
                        wbk_dashboardl10n.jun,
                        wbk_dashboardl10n.jul,
                        wbk_dashboardl10n.aug,
                        wbk_dashboardl10n.sep,
                        wbk_dashboardl10n.oct,
                        wbk_dashboardl10n.nov,
                        wbk_dashboardl10n.dec,
                    ],
                    weekdaysFull: [
                        wbk_dashboardl10n.sunday,
                        wbk_dashboardl10n.monday,
                        wbk_dashboardl10n.tuesday,
                        wbk_dashboardl10n.wednesday,
                        wbk_dashboardl10n.thursday,
                        wbk_dashboardl10n.friday,
                        wbk_dashboardl10n.saturday,
                    ],
                    weekdaysShort: [
                        wbk_dashboardl10n.sun,
                        wbk_dashboardl10n.mon,
                        wbk_dashboardl10n.tue,
                        wbk_dashboardl10n.wed,
                        wbk_dashboardl10n.thu,
                        wbk_dashboardl10n.fri,
                        wbk_dashboardl10n.sat,
                    ],
                    today: wbk_dashboardl10n.today,
                    clear: wbk_dashboardl10n.clear,
                    close: wbk_dashboardl10n.close,
                    firstDay: 1,
                    format: element.attr('data-dateformat'),
                    formatSubmit: 'yyyy-mm-dd',
                    onSet: function (thingSet) {
                        if (thingSet.select == null) {
                            element
                                .siblings('label')
                                .removeClass('plugion_label_pickadate')
                        } else {
                            element
                                .siblings('label')
                                .addClass('plugion_label_pickadate')
                        }
                    },
                })
                if (value != '' && value != null) {
                    var date = new Date(
                        Date.parse(value.replace(/[-]/g, '/') + ' UTC')
                    )
                    datepicker
                        .pickadate('picker')
                        .set('select', [
                            date.getUTCFullYear(),
                            date.getUTCMonth(),
                            date.getUTCDate(),
                        ])
                }
            },
            editor: function (element, value) {
                let editor = tinymce.get(element.attr('id'))
                if (editor == null) {
                    var seconds = 0
                    setTimeout(function () {
                        wp.editor.initialize(element.attr('id'), {
                            tinymce: {
                                height: '150',
                                wpautop: true,
                                theme: 'modern',
                                skin: 'lightgray',
                                language: 'en',
                                valid_elements: '*[*]',
                                formats: {
                                    alignleft: [
                                        {
                                            selector:
                                                'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
                                            styles: { textAlign: 'left' },
                                        },
                                        {
                                            selector: 'img,table,dl.wp-caption',
                                            classes: 'alignleft',
                                        },
                                    ],
                                    aligncenter: [
                                        {
                                            selector:
                                                'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
                                            styles: { textAlign: 'center' },
                                        },
                                        {
                                            selector: 'img,table,dl.wp-caption',
                                            classes: 'aligncenter',
                                        },
                                    ],
                                    alignright: [
                                        {
                                            selector:
                                                'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
                                            styles: { textAlign: 'right' },
                                        },
                                        {
                                            selector: 'img,table,dl.wp-caption',
                                            classes: 'alignright',
                                        },
                                    ],
                                    strikethrough: { inline: 'del' },
                                },
                                relative_urls: false,
                                remove_script_host: false,
                                convert_urls: false,
                                browser_spellcheck: true,
                                fix_list_elements: true,
                                entities: '38,amp,60,lt,62,gt',
                                entity_encoding: 'raw',
                                keep_styles: true,
                                paste_webkit_styles:
                                    'font-weight font-style color',
                                preview_styles:
                                    'font-family font-size font-weight font-style text-decoration text-transform',
                                tabfocus_elements: ':prev,:next',
                                plugins:
                                    'charmap,hr,media,paste,tabfocus,textcolor,wordpress,wpeditimage,wpgallery,wplink,wpdialogs,wpview',
                                resize: 'vertical',
                                menubar: false,
                                indent: false,
                                toolbar1:
                                    'bold,italic,strikethrough,bullist,numlist,blockquote,hr,alignleft,aligncenter,alignright,link,unlink,wp_more,spellchecker,fullscreen,wp_adv',
                                toolbar2:
                                    'formatselect,underline,alignjustify,forecolor,pastetext,removeformat,charmap,outdent,indent,undo,redo,wp_help',
                                toolbar3: '',
                                toolbar4: '',
                                body_class:
                                    'id post-type-post post-status-publish post-format-standard',
                                wpeditimage_disable_captions: false,
                                wpeditimage_html5_captions: true,
                            },
                            quicktags: true,
                            mediaButtons: true,
                        })
                        tinymce
                            .get(element.attr('id'))
                            .onChange.add(function (ed, e) {
                                element.trigger('change')
                            })
                        jQuery(window).trigger('resize')
                    }, seconds)
                } else {
                    editor.setContent(value)
                }
            },
            date_range: function (element, value) {
                var datepicker_start = element
                    .parent()
                    .find('.plugion_input_date_range_start')
                    .pickadate('picker')
                if (typeof datepicker_start === 'undefined') {
                    var datepicker_start = element
                        .parent()
                        .find('.plugion_input_date_range_start')
                        .pickadate({
                            monthsFull: [
                                wbk_dashboardl10n.january,
                                wbk_dashboardl10n.february,
                                wbk_dashboardl10n.march,
                                wbk_dashboardl10n.april,
                                wbk_dashboardl10n.may,
                                wbk_dashboardl10n.june,
                                wbk_dashboardl10n.july,
                                wbk_dashboardl10n.august,
                                wbk_dashboardl10n.september,
                                wbk_dashboardl10n.october,
                                wbk_dashboardl10n.november,
                                wbk_dashboardl10n.december,
                            ],
                            monthsShort: [
                                wbk_dashboardl10n.jan,
                                wbk_dashboardl10n.feb,
                                wbk_dashboardl10n.mar,
                                wbk_dashboardl10n.apr,
                                wbk_dashboardl10n.mays,
                                wbk_dashboardl10n.jun,
                                wbk_dashboardl10n.jul,
                                wbk_dashboardl10n.aug,
                                wbk_dashboardl10n.sep,
                                wbk_dashboardl10n.oct,
                                wbk_dashboardl10n.nov,
                                wbk_dashboardl10n.dec,
                            ],
                            weekdaysFull: [
                                wbk_dashboardl10n.sunday,
                                wbk_dashboardl10n.monday,
                                wbk_dashboardl10n.tuesday,
                                wbk_dashboardl10n.wednesday,
                                wbk_dashboardl10n.thursday,
                                wbk_dashboardl10n.friday,
                                wbk_dashboardl10n.saturday,
                            ],
                            weekdaysShort: [
                                wbk_dashboardl10n.sun,
                                wbk_dashboardl10n.mon,
                                wbk_dashboardl10n.tue,
                                wbk_dashboardl10n.wed,
                                wbk_dashboardl10n.thu,
                                wbk_dashboardl10n.fri,
                                wbk_dashboardl10n.sat,
                            ],
                            today: wbk_dashboardl10n.today,
                            clear: wbk_dashboardl10n.clear,
                            close: wbk_dashboardl10n.close,
                            format: element.attr('data-dateformat'),
                            onSet: function (thingSet) {
                                if (thingSet.select == null) {
                                    element
                                        .siblings(
                                            '.plugion_input_container_small'
                                        )
                                        .find('.plugion_input_date_range_start')
                                        .siblings('label')
                                        .removeClass('plugion_label_pickadate')
                                    element.attr('data-start', '')
                                } else {
                                    element
                                        .siblings(
                                            '.plugion_input_container_small'
                                        )
                                        .find('.plugion_input_date_range_start')
                                        .siblings('label')
                                        .addClass('plugion_label_pickadate')
                                    element.attr(
                                        'data-start',
                                        this.get('select', 'mm/dd/yyyy')
                                    )
                                }
                            },
                        })
                }
                var datepicker_end = element
                    .parent()
                    .find('.plugion_input_date_range_end')
                    .pickadate('picker')
                if (typeof datepicker_end === 'undefined') {
                    var datepicker_end = element
                        .parent()
                        .find('.plugion_input_date_range_end')
                        .pickadate({
                            format: element.attr('data-dateformat'),
                            onSet: function (thingSet) {
                                if (thingSet.select == null) {
                                    element
                                        .siblings(
                                            '.plugion_input_container_small'
                                        )
                                        .find('.plugion_input_date_range_end')
                                        .siblings('label')
                                        .removeClass('plugion_label_pickadate')
                                    element.attr('data-end', '')
                                } else {
                                    element
                                        .siblings(
                                            '.plugion_input_container_small'
                                        )
                                        .find('.plugion_input_date_range_end')
                                        .siblings('label')
                                        .addClass('plugion_label_pickadate')
                                    element.attr(
                                        'data-end',
                                        this.get('select', 'mm/dd/yyyy')
                                    )
                                }
                            },
                        })
                }
                if (value != null) {
                    if (value == '') {
                        element
                            .parent()
                            .find('.plugion_input_date_range_start')
                            .pickadate('picker')
                            .clear()
                        element
                            .parent()
                            .find('.plugion_input_date_range_end')
                            .pickadate('picker')
                            .clear()
                        return
                    }
                    var value = value.split(' - ')
                    var start = value[0]
                    var date_start = new Date(
                        Date.parse(start.replace(/[-]/g, '/') + ' UTC')
                    )
                    element
                        .parent()
                        .find('.plugion_input_date_range_start')
                        .pickadate('picker')
                        .set('select', [
                            date_start.getUTCFullYear(),
                            date_start.getUTCMonth(),
                            date_start.getUTCDate(),
                        ])

                    var end = value[1]
                    var date_end = new Date(
                        Date.parse(end.replace(/[-]/g, '/') + ' UTC')
                    )
                    element
                        .parent()
                        .find('.plugion_input_date_range_end')
                        .pickadate('picker')
                        .set('select', [
                            date_end.getUTCFullYear(),
                            date_end.getUTCMonth(),
                            date_end.getUTCDate(),
                        ])
                }
            },
            wbk_business_hours: function (element, value) {
                element.val(value)
                var format = element.attr('data-format')

                jQuery('.wbk_repeater_add_btn').unbind()
                var $repeater = element.siblings('.repeater').repeater({
                    defaultValues: {
                        day_of_week: '1',
                        status: 'active',
                    },
                    show: function () {
                        jQuery(this).slideDown('fast')

                        var start_field =
                            jQuery(this).find('.wbk_bh_data_start')
                        var end_field = jQuery(this).find('.wbk_bh_data_end')

                        if ('' == start_field.val()) {
                            var prev_day = jQuery(this)
                                .closest('.repeater')
                                .find('.wbk_business_hours_group')
                                .eq(-2)
                                .find('.wbk_bh_data_day option:selected')
                                .attr('data-number')
                            prev_day++
                            if (prev_day == 8) {
                                prev_day = 1
                            }
                            jQuery(this)
                                .find(
                                    '.wbk_bh_data_day option[data-number="' +
                                        prev_day +
                                        '"]'
                                )
                                .attr('selected', 'selected')

                            start_field.val(32400)
                            end_field.val(64800)
                        }
                        jQuery(this)
                            .find('.wbk_bh_data_day')
                            .niceSelect('update')

                        var jQuerybusiness_hours_time = jQuery(this).find(
                            '[data-js-business-hours-time]'
                        )
                        var jQuerybusiness_hours_slider = jQuery(this).find(
                            '[data-js-business-hours-slider]'
                        )
                        jQuerybusiness_hours_slider.html('')
                        let slide = jQuery(jQuerybusiness_hours_slider).slider({
                            range: true,
                            min: 0,
                            max: 86400,
                            step: 300,
                            values: [start_field.val(), end_field.val()],
                            slide: function (e, ui) {
                                var date = new Date(null)
                                date.setUTCSeconds(ui.values[0])
                                if (format == 'ampm') {
                                    var time_start = wbk_format_ampm(date)
                                } else {
                                    var time_start =
                                        date.getUTCHours() +
                                        ':' +
                                        (date.getUTCMinutes() < 10 ? '0' : '') +
                                        date.getUTCMinutes()
                                }
                                var date = new Date(null)
                                date.setUTCSeconds(ui.values[1])
                                if (format == 'ampm') {
                                    var time_end = wbk_format_ampm(date)
                                } else {
                                    var time_end =
                                        date.getUTCHours() +
                                        ':' +
                                        (date.getUTCMinutes() < 10 ? '0' : '') +
                                        date.getUTCMinutes()
                                }
                                start_field.val(ui.values[0])
                                end_field.val(ui.values[1])

                                jQuery(jQuerybusiness_hours_time).val(
                                    time_start.toUpperCase() +
                                        ' - ' +
                                        time_end.toUpperCase()
                                )
                                element.trigger('change')
                            },
                        })
                        if (
                            typeof slide.slider('option', 'slide').call ===
                            'function'
                        ) {
                            slide.slider('option', 'slide').call(slide, null, {
                                values: slide.slider('values'),
                            })
                        }

                        jQuery('[data-js-toggle-business-hours]').unbind(
                            'click'
                        )
                        jQuery('[data-js-toggle-business-hours]').click(
                            function () {
                                const row = jQuery(this).closest(
                                    '[data-js-business-hours-row]'
                                )
                                const status = row.find(
                                    '[data-js-status-business-hours]'
                                )
                                if (jQuery(this).hasClass('on')) {
                                    jQuery(this).removeClass('on')
                                    row.attr('disabled', '')
                                    status.val('inactive')
                                } else {
                                    jQuery(this).addClass('on')
                                    row.removeAttr('disabled')
                                    status.val('active')
                                }
                            }
                        )

                        setTimeout(function () {
                            window.dispatchEvent(new Event('resize'))
                        }, 100)
                        element.trigger('change')
                    },
                    hide: function (deleteElement) {
                        element.trigger('change')
                        jQuery(this).slideUp(deleteElement)
                    },
                    isFirstItemUndeletable: true,
                })
                if (value !== null) {
                    value = value.replace(/'/g, '"')
                }
                if (value != '' && value !== null) {
                    value = JSON.parse(value)
                    value = value['dow_availability']
                    if ($repeater) {
                        $repeater.setList(value)
                    }
                } else {
                    if (typeof element.attr('data-default') != 'undefined') {
                        value = element.attr('data-default')
                        value = value.replace(/'/g, '"')
                        value = jQuery.parseJSON(value)
                        value = value['dow_availability']
                        if ($repeater) {
                            $repeater.setList(value)
                        }
                    } else {
                        $repeater.setList({})
                    }
                }
                jQuery('.wbk_bh_data_day').niceSelect('update')
            },
            wbk_app_custom_data: function (element, value) {
                element.val(value)
                if (value == '') {
                    return
                }
                var custom_data = jQuery.parseJSON(value)
                jQuery.each(custom_data, function (k, v) {
                    var id = v[0].trim()
                    var value = v[2].trim()
                    element
                        .parent()
                        .find('[data-field-id="' + id + '"]')
                        .val(value)
                })
            },
        }

        jQuery(document).trigger('plugion_setter_added')
        get_this().field_getters = {
            // getter for radio
            radio: function (element) {
                if (element.is(':checked')) {
                    return element.val()
                } else {
                    return null
                }
            },
            // getter for checkbox
            checkbox: function (element) {
                if (element.is(':checked')) {
                    return element.val()
                } else {
                    return ''
                }
            },
            datetime: function (element) {
                if (element.val() == '') {
                    return
                }
                var in_time_zone = Date.parse(element.val())
                var date = new Date(in_time_zone)
                return date.toJSON().slice(0, 19).replace('T', ' ')
            },
            date: function (element) {
                return element.siblings('input').val()
            },
            editor: function (element) {
                var content
                var editor = tinyMCE.get(element.attr('id'))
                if (editor) {
                    // Ok, the active tab is Visual
                    content = editor.getContent()
                } else {
                    // The active tab is HTML, so just query the textarea
                    content = jQuery('#' + element.attr('id')).val()
                }
                return content
            },
            date_range: function (element) {
                if (
                    element.attr('data-start') == '' ||
                    element.attr('data-end') == ''
                ) {
                    return ''
                }
                return (
                    element.attr('data-start') +
                    ' - ' +
                    element.attr('data-end')
                )
            },
            select: function (element) {
                var value = element.val()
                if (value === null || value.length == 0) {
                    value = ''
                }
                return value
            },
            wbk_business_hours_v4: function (element) {
                if (
                    element.siblings('.repeater').find('.wbk_bh_data_start')
                        .length == 0
                ) {
                    return ''
                }
                var value = element.siblings('.repeater').repeaterVal()
                return JSON.stringify(value)
            },
        }

        get_this().set_properties_default()

        // store filter form content to object
        jQuery('.plugion_filter_form').each(function () {
            get_this().filter_form_content[jQuery(this).attr('data-table')] =
                jQuery(this).html()
            jQuery(this).html('')
        })

        // initialize add new element form
        jQuery('.plugion_table_add_button').click(function () {
            const dataName = jQuery(this).attr('data-name')

            jQuery('.sidebar-roll-wb .plugion_properties_save').attr(
                'data-id',
                ''
            )
            jQuery('.sidebar-roll-wb .plugion_delete_row').attr(
                'data-row-id',
                ''
            )
            jQuery('.sidebar-roll-wb .plugion_duplicate_row').attr(
                'data-row-id',
                ''
            )
            get_this().error_reset()
            get_this().set_properties_default()
            get_this().init_dependency()
            get_this().show_row_controls_properties_form(dataName)
            get_this().properties_form_open(dataName)
            get_this().initialize_property_form()

            if ('wp_wbk_service_categories' === dataName) {
                get_this().update_service_list(dataName)
            }
        })

        jQuery('[data-js="close-button-wbkb"]').click(function () {
            jQuery(this)
                .parent()
                .find('.delete-confirm-wb')
                .removeClass('wbk_hidden')
            jQuery(this).parent().find('.delete-confirm-wb').unbind('click')
            jQuery(this)
                .parent()
                .find('.delete-confirm-wb')
                .click(function () {
                    get_this().properties_form_close()
                })
        })

        // initialize filter form
        jQuery('.plugion_filter_button').click(function () {
            jQuery('.plugion_filter_form').show(
                'slide',
                {
                    direction: 'right',
                },
                300
            )
            get_this().initialize_filter_form(jQuery(this).attr('data-table'))
        })

        jQuery('.plugion_properties_save').click(function () {
            let table = jQuery(this).data('table')
            let row_id = jQuery(this).attr('data-id')
            get_this().save_properties(table, row_id)
        })

        jQuery(document).trigger('plugion_before_row_events', false)

        get_this().initialize_property_form()
        get_this().row_controls_tabs()

        jQuery('.plugion_table').each(function () {
            get_this().tables[jQuery(this).attr('data-table')] =
                get_this().init_datatable(jQuery(this))

            jQuery(this).on('draw.dt', function () {
                get_this().initialize_property_form()
                get_this().set_properties_default()
            })
        })

        jQuery.fn.plugion_observe = function (eventName, callback) {
            return this.each(function () {
                var el = this
                jQuery(document).on(eventName, function () {
                    callback.apply(el, arguments)
                })
            })
        }
    }

    init_datatable(elem) {
        const get_this = () => {
            return this
        }
        var i = 0
        var columnDefs = []
        elem.find('th').each(function () {
            if (jQuery(this).attr('data-sorttype') != '') {
                columnDefs.push({
                    type: jQuery(this).attr('data-sorttype'),
                    targets: i,
                })
            }
            i++
        })
        get_this().get_cookie('page_length')

        var page_length = get_this().get_cookie('page_length')
        if (page_length == null) {
            page_length = 10
        }
        if (jQuery('.schedules-calendar-block-wb').length > 0) {
            page_length = -1
        }

        var order_col = 0
        if (jQuery('.table_wp_wbk_appointments').length > 0) {
            order_col = 3
        }

        var dt_lang = {
            emptyTable: wbk_dashboardl10n.empty_table,
        }

        if (jQuery('[data-empty-table]').length) {
            dt_lang['zeroRecords'] = jQuery('[data-empty-table]')
                .find('.table-empty-content-wb')
                .html()
        }

        var dt = elem.DataTable({
            info: false,
            searching: true,
            lengthChange: false,
            language: dt_lang,
            drawCallback: function (settings) {
                let pagination = jQuery(this)
                    .closest('.dataTables_wrapper')
                    .find('.dataTables_paginate')
                pagination.toggle(this.api().page.info().recordsTotal > 1)
            },
        })

        let table = elem.attr('data-table')
        jQuery('.input-search-wb[data-name=' + table + ']').keyup(function () {
            dt.search(this.value).draw()
        })

        return dt
    }

    initialize_property_form() {
        const get_this = () => {
            return this
        }

        // remove error class on focus
        jQuery('input').focus(function () {
            jQuery(this).removeClass('plugion_input_field_error')
        })
        jQuery('select').change(function () {
            jQuery(this).removeClass('plugion_input_field_error')
            jQuery(this)
                .siblings('.nice-select')
                .removeClass('plugion_input_field_error')
        })

        jQuery('.bookings-filter-select').unbind('change')
        jQuery('.bookings-filter-select').change(function () {
            if ('appointment_service_id' === jQuery(this).attr('name')) {
                jQuery('select[name="appointment_service_categories"]')
                    .val('')
                    .niceSelect('update')
            } else if (
                'appointment_service_categories' === jQuery(this).attr('name')
            ) {
                jQuery('select[name="appointment_service_id"]')
                    .val('')
                    .niceSelect('update')
            }
            get_this().apply_filters()
        })

        jQuery('.plugion_filter_daterange').each(function () {
            var element = jQuery(this)
            jQuery(this).pickadate({
                monthsFull: [
                    wbk_dashboardl10n.january,
                    wbk_dashboardl10n.february,
                    wbk_dashboardl10n.march,
                    wbk_dashboardl10n.april,
                    wbk_dashboardl10n.may,
                    wbk_dashboardl10n.june,
                    wbk_dashboardl10n.july,
                    wbk_dashboardl10n.august,
                    wbk_dashboardl10n.september,
                    wbk_dashboardl10n.october,
                    wbk_dashboardl10n.november,
                    wbk_dashboardl10n.december,
                ],
                monthsShort: [
                    wbk_dashboardl10n.jan,
                    wbk_dashboardl10n.feb,
                    wbk_dashboardl10n.mar,
                    wbk_dashboardl10n.apr,
                    wbk_dashboardl10n.mays,
                    wbk_dashboardl10n.jun,
                    wbk_dashboardl10n.jul,
                    wbk_dashboardl10n.aug,
                    wbk_dashboardl10n.sep,
                    wbk_dashboardl10n.oct,
                    wbk_dashboardl10n.nov,
                    wbk_dashboardl10n.dec,
                ],
                weekdaysFull: [
                    wbk_dashboardl10n.sunday,
                    wbk_dashboardl10n.monday,
                    wbk_dashboardl10n.tuesday,
                    wbk_dashboardl10n.wednesday,
                    wbk_dashboardl10n.thursday,
                    wbk_dashboardl10n.friday,
                    wbk_dashboardl10n.saturday,
                ],
                weekdaysShort: [
                    wbk_dashboardl10n.sun,
                    wbk_dashboardl10n.mon,
                    wbk_dashboardl10n.tue,
                    wbk_dashboardl10n.wed,
                    wbk_dashboardl10n.thu,
                    wbk_dashboardl10n.fri,
                    wbk_dashboardl10n.sat,
                ],
                today: wbk_dashboardl10n.today,
                clear: wbk_dashboardl10n.clear,
                close: wbk_dashboardl10n.close,
                firstDay: 1,
                format: jQuery(this).attr('data-dateformat'),
                onSet: function (thingSet) {
                    if (thingSet.select == null) {
                    } else {
                        element.attr(
                            'data-formated-date',
                            this.get('select', 'mm/dd/yyyy')
                        )
                        get_this().apply_filters()
                    }
                },
            })
        })

        jQuery('.plugion_filter_daterange').off('change')
        jQuery('.plugion_filter_daterange').on('change', function () {
            // get_this().apply_filters();
        })

        get_this().set_rows_events()
        get_this().duplicate_row_button_init()
        get_this().hidden_details_row_init()
        get_this().delete_row_button_init()
        get_this().delete_rows_button_init()
        get_this().table_checkbox_add_class_to_row()
        get_this().toggle_business_hours()
        get_this().appointments_status_change_init()
        get_this().resend_email()

        jQuery(document).trigger('plugion_properties_form_initialized')
    }

    initialize_filter_form(table) {
        const get_this = () => {
            return this
        }
        jQuery('.plugion_filter_form').html(
            get_this().filter_form_content[table]
        )
        jQuery('.plugion_filter_form').attr('data-table', table)
        jQuery('.plugion_filter_cancel').click(function () {
            jQuery('.plugion_filter_form').hide(
                'slide',
                {
                    direction: 'right',
                },
                300
            )
        })

        // todo: field not initialized when peoperty form is opened for the second time
        if (get_this().filter_form_values[table] != undefined) {
            jQuery.each(get_this().filter_form_values[table], function (k, v) {
                var elem = jQuery('#' + v.name)
                get_this().set_field_value(elem, v.value)
            })
        } else {
            jQuery('.plugion_filter_input').each(function () {
                get_this().set_field_value(jQuery(this), '')
            })
        }

        jQuery(document).trigger('plugion_filter_form_initialized')
    }

    init_dependency() {
        const get_this = () => {
            return this
        }
        jQuery('.field-block-wb').each(function () {
            var field_container = jQuery(this)
            if (
                typeof jQuery(this).attr('data-dependency') !== 'undefined' &&
                jQuery(this).attr('data-dependency') != '[]'
            ) {
                var deps = jQuery.parseJSON(
                    jQuery(this).attr('data-dependency')
                )
                jQuery.each(deps, function (k, v) {
                    var event_name = 'plugion_' + v[0] + '_change'
                    field_container.plugion_observe(event_name, function (e) {
                        get_this().apply_dependency(jQuery(this))
                    })
                })
            }
        })
        jQuery('.plugion_property_input').change(function () {
            var event_name = 'plugion_' + jQuery(this).attr('name') + '_change'
            jQuery(this).trigger(event_name)
        })
        jQuery('.plugion_property_input').each(function () {
            var event_name = 'plugion_' + jQuery(this).attr('name') + '_change'
            jQuery(this).trigger(event_name)
        })
        // initialize discard changes button
        jQuery(
            '.plugion_property_input, .plugion_input_date_range_start, .plugion_input_date_range_end'
        ).focusout(function () {
            jQuery('#plugion_properties_discard').fadeIn('slow', function () {
                jQuery(this).removeClass('plugion_hidden')
            })
        })
        jQuery('.plugion_input_radio_label').click(function () {
            jQuery('#plugion_properties_discard').fadeIn('slow', function () {
                jQuery(this).removeClass('plugion_hidden')
            })
        })
        jQuery(document).trigger('plugion_after_dependency_initialized')
    }

    add_appointment_fullcalendar(time, service_id) {
        const get_this = () => {
            return this
        }

        const table = jQuery('.plugion_table_add_button').attr('data-name')
        const propertyContainer = jQuery(
            '.plugion_property_container_form[data-table=' + table + ']'
        )
        const sidebarRoll = propertyContainer.find(
            '[data-js="sidebar-roll-wb"]'
        )
        const title = propertyContainer.find('.property_form_title')

        get_this().row_controls_tabs_reset()

        title.text(wbk_dashboardl10n.new)

        sidebarRoll.addClass('slide-wb')
        setTimeout(function () {
            sidebarRoll.addClass('open-wb')
            sidebarRoll.addClass('loading')
        }, 200)

        jQuery('body').addClass('freeze_form')
        jQuery('[data-js="main-curtain-wb"]').fadeIn(200)

        get_this().freeze_form()

        var response = {
            name: '',
            service_id: service_id,
            day: new Date(time * 1000).toISOString().split('T')[0],
            time: time,
        }

        Scrollbar.initAll({
            alwaysShowTracks: true,
            damping: 0.5,
        })
        get_this().discard_buffer = response
        propertyContainer.find('.plugion_properties_save').attr('data-id', '')
        propertyContainer.find('.plugion_delete_row').attr('data-row-id', '')
        propertyContainer.find('.plugion_duplicate_row').attr('data-row-id', '')
        get_this().show_row_controls_properties_form(table)
        get_this().set_properties(response)
        get_this().init_dependency()
        get_this().initialize_property_form()
        if ('wp_wbk_service_categories' === table) {
            get_this().update_service_list(table)
        }

        // TO DO: sidebarRoll.removeClass('loading');
        setTimeout(function () {
            sidebarRoll.removeClass('loading')
        }, 500)
    }

    apply_dependency(elem) {
        const get_this = () => {
            return this
        }

        var deps = jQuery.parseJSON(elem.attr('data-dependency'))
        var passed = true
        jQuery.each(deps, function (k, v) {
            var subject = jQuery(".plugion_input[name='" + v[0] + "']")
            if (subject.hasClass('plugion_input_radio')) {
                subject = jQuery(".plugion_input[name='" + v[0] + "']:checked")
            }
            // operand equals
            if (v[1] == '=') {
                if (subject.val() != v[2]) {
                    passed = false
                }
            }
            // operand not equals
            if (v[1] == '!=') {
                if (subject.val() == v[2]) {
                    passed = false
                }
            }
            // operand more than
            if (v[1] == '>') {
                if (parseFloat(subject.val()) <= parseFloat(v[2])) {
                    passed = false
                }
            }

            if (subject.hasClass('plugion_hidden')) {
                passed = false
            }
        })
        if (!passed) {
            if (!elem.hasClass('plugion_hidden')) {
                get_this().hide_element(elem)
            }
        } else {
            if (elem.hasClass('plugion_hidden')) {
                get_this().show_element(elem)
            }
        }
    }

    hide_element(elem) {
        elem.addClass('plugion_hidden')
    }

    show_element(elem) {
        elem.removeClass('plugion_hidden')
    }

    apply_filters() {
        const get_this = () => {
            return this
        }
        var es = false
        var filters = []
        var error_labels = []
        jQuery(document).trigger('plugion_before_apply_filters')
        jQuery('.plugion_filter_input').each(function () {
            var value = jQuery(this).val()
            if (value != '' && value != 'plugion_null') {
                let name = jQuery(this).attr('name')

                if ('appointment_day' == name) {
                    value = jQuery(this).attr('data-formated-date')
                }

                var filter = {
                    name: name,
                    value: value,
                }
                filters.push(filter)
            }
        })
        if (es) {
            return
        }
        jQuery('.plugion_input_field_error').removeClass(
            'plugion_input_field_error'
        )
        var table = jQuery('.plugion_filter_form').attr('data-table')
        var data = {
            table: table,
            filters: filters,
        }
        get_this().freeze_form()

        // dashboard
        if (jQuery('.dasbhoard-blocks-wb').length) {
            jQuery.ajax(plugionl10n.rest_url + 'wbk/v1/get-dashboard', {
                method: 'POST',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', plugionl10n.nonce)
                },
                data: data,
                statusCode: {
                    200: function (response) {
                        get_this().unfreeze_form()
                        jQuery('.dasbhoard-blocks-wb').html(response)
                        dashboard_graph()
                    },
                    400: function (response) {
                        get_this().unfreeze_form()
                    },
                    404: function (response) {
                        get_this().unfreeze_form()
                    },
                    401: function (response) {
                        get_this().unfreeze_form()
                    },
                    403: function (response) {
                        get_this().unfreeze_form()
                    },
                },
            })
        } else {
            jQuery.ajax(plugionl10n.rest_url + 'plugion/v1/get-rows', {
                method: 'POST',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', plugionl10n.nonce)
                },
                data: data,
                statusCode: {
                    200: function (response) {
                        get_this().tables[table].destroy()
                        jQuery(
                            '.plugion_table[data-table="' + table + '"] > tbody'
                        ).replaceWith(response)
                        jQuery(document).trigger(
                            'plugion_before_row_events',
                            true
                        )

                        get_this().tables[table] = get_this().init_datatable(
                            jQuery('.plugion_table[data-table="' + table + '"]')
                        )
                        get_this().unfreeze_form()
                        get_this().filter_form_values[table] = filters
                        get_this().appointments_status_change_init()
                        get_this().resend_email()
                        get_this().initialize_property_form()
                        get_this().set_properties_default()
                    },
                    400: function (response) {
                        get_this().unfreeze_form()
                    },
                    404: function (response) {
                        get_this().unfreeze_form()
                    },
                    401: function (response) {
                        get_this().unfreeze_form()
                    },
                    403: function (response) {
                        get_this().unfreeze_form()
                        jQuery('.plugion_properties_title').html(
                            plugionl10n.failed
                        )
                        jQuery('.plugion_property_content_inner').html(
                            plugionl10n.forbidden
                        )
                        jQuery('.plugion_form_controls > input').prop(
                            'disabled',
                            true
                        )
                    },
                },
            })
        }
    }

    delete_rows(row_ids, table_name, element) {
        const get_this = () => {
            return this
        }
        var data = {
            table: table_name,
            row_ids: row_ids,
        }
        get_this().freeze_form()
        jQuery.ajax(plugionl10n.rest_url + 'plugion/v1/delete-rows', {
            method: 'POST',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', plugionl10n.nonce)
            },
            data: data,
            statusCode: {
                200: function (response) {
                    jQuery.each(response, function (k, v) {
                        get_this()
                            .tables[table_name].row("tr[data-id='" + v + "']")
                            .remove()
                            .draw()
                    })
                    jQuery('[select-rows-checkbox]').prop('checked', false)
                    jQuery('[checkbox-select-all]').prop('checked', false)
                    get_this().unfreeze_form()

                    if (jQuery('.schedules-calendar-block-wb').length > 0) {
                        let service_id = jQuery(
                            '.schedule-chosen-select'
                        ).val()[0]
                        let current_timestamp = jQuery(
                            '[data-timeslot-edited-timestamp]'
                        ).data('timeslot-edited-timestamp')
                        let current_timeslot = jQuery(
                            '[data-timeslot-timestamp="' +
                                current_timestamp +
                                '"]'
                        )
                        let is_new = false
                        if (
                            current_timeslot.closest('.fc-duplicated-event')
                                .length
                        ) {
                            is_new = true
                        }
                        var data = {
                            action: 'wbk_add_appointment_backend_fullcalendar',
                            nonce: wbkl10n.wbkb_nonce,
                            service_id: service_id,
                            time: current_timestamp,
                            edited_time: current_timestamp,
                            is_new: is_new,
                        }

                        current_timeslot
                            .closest('.fc-event-main')
                            .find('.fc-event-main-frame')
                            .html(
                                '<div class="loading"></div><div class="cb"></div>'
                            )

                        jQuery.post(ajaxurl, data, function (response) {
                            if (
                                response != -1 &&
                                response != -2 &&
                                response != -3 &&
                                response != -4 &&
                                response != -5 &&
                                response != -6 &&
                                response != -7 &&
                                response != -8 &&
                                response != -9 &&
                                response != -10 &&
                                response != -11 &&
                                response != -12
                            ) {
                                var objdata = jQuery.parseJSON(response)
                                if (is_new === false) {
                                    current_timeslot
                                        .closest('.fc-event-main')
                                        .parent()
                                        .css('background-color', '')
                                }
                                current_timeslot
                                    .closest('.fc-event-main')
                                    .html(objdata.day)
                                setEvents_fullcalendar(calendar)
                            } else {
                                current_timeslot
                                    .closest('.fc-event-main')
                                    .html('error ' + response)
                            }
                        })
                    }

                    return
                },
                403: function (response) {
                    get_this().unfreeze_form()
                    jQuery('.plugion_properties_title').html(plugionl10n.failed)
                    jQuery('.plugion_property_content_inner').html(
                        plugionl10n.forbidden
                    )
                    jQuery('.plugion_form_controls > input').prop(
                        'disabled',
                        true
                    )
                    return
                },
            },
        })
    }

    save_properties(table, row_id) {
        const get_this = () => {
            return this
        }
        let es = false,
            fields = [],
            error_labels = [],
            data = {}
        let schedules_calendar =
            jQuery('.schedules-calendar-block-wb').length > 0
        let schedules = {}
        const propertyContainerForm = jQuery(
            '.plugion_property_container_form[data-table=' + table + ']'
        )
        const propertyInfo = propertyContainerForm.find('.plugion_propery_info')
        const sidebarRoll = propertyContainerForm.find(
            '[data-js="sidebar-roll-wb"]'
        )
        jQuery(document).trigger('plugion_before_save_properties')
        sidebarRoll.addClass('loading')
        propertyContainerForm
            .find('.plugion_property_input')
            .not('.nice-select')
            .each(function () {
                if (
                    !jQuery(this)
                        .closest('.field-block-wb')
                        .hasClass('plugion_hidden')
                ) {
                    var name = jQuery(this).attr('id')
                    var value = get_this().get_field_value(jQuery(this))

                    if (
                        !get_this().field_validators[
                            jQuery(this).attr('data-validation')
                        ](
                            value,
                            jQuery(this).attr('data-required'),
                            jQuery(this)
                        )
                    ) {
                        es = true
                        error_labels.push(
                            jQuery('label[for=' + name + ']').html()
                        )
                        jQuery(this).addClass('plugion_input_field_error')
                        jQuery(this)
                            .siblings('.nice-select')
                            .find('.current')
                            .addClass('plugion_input_field_error')
                        jQuery(this)
                            .closest('.date-range-select-wb')
                            .addClass('plugion_input_field_error')
                    } else {
                        jQuery(this)
                            .closest('.date-range-select-wb')
                            .removeClass('plugion_input_field_error')
                        if (value !== null) {
                            let name = jQuery(this).attr('name')
                            var field = {
                                name: name,
                                value: value,
                            }
                            if (
                                schedules_calendar &&
                                (name === 'service_id' ||
                                    name === 'day' ||
                                    name === 'time')
                            ) {
                                schedules[name] = value
                            }
                            fields.push(field)
                        }
                    }
                }
            })

        if (es === true) {
            sidebarRoll.removeClass('loading')
            propertyInfo.html(
                plugionl10n.properties_error_list_title +
                    ' ' +
                    error_labels.join(', ')
            )
            jQuery('.plugion_property_content_inner').scrollTop(0)
            return
        }

        if (row_id) {
            data = {
                table: table,
                fields: fields,
                row_id: row_id,
            }
        } else {
            data = {
                table: table,
                fields: fields,
            }
        }

        get_this().freeze_form()
        jQuery.ajax(plugionl10n.rest_url + 'plugion/v1/save-properties', {
            method: 'POST',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', plugionl10n.nonce)
            },
            data: data,
            statusCode: {
                200: function (response) {
                    if (row_id) {
                        get_this()
                            .tables[table].row(
                                "tr[data-id='" + response.db_row_data.id + "']"
                            )
                            .data(response.row_data)
                            .draw()
                    } else {
                        var node = get_this()
                            .tables[table].row.add(response.row_data)
                            .draw()
                            .node()

                        get_this()
                            .tables[table].order([[0, 'desc']])
                            .draw(true)

                        if ('wp_wbk_services' === table) {
                            jQuery('#category_list').append(
                                jQuery('<option>', {
                                    value: response.db_row_data.id,
                                    text: response.db_row_data.name,
                                })
                            )
                        }

                        node.setAttribute('data-id', response.db_row_data.id)
                        node.setAttribute('data-table', table)
                        node.setAttribute('has-hidden-details', '')
                        if (response.row_options.canedit == true) {
                            node.classList.add('plugion_editable_row')
                        }

                        get_this().set_properties(response.db_row_data)
                        get_this().init_dependency()
                        jQuery('.plugion_table td').each(function () {
                            if (jQuery(this).html() == '[object Object]') {
                                jQuery(this).html('')
                            }
                        })
                        jQuery(document).trigger(
                            'plugion_after_row_added',
                            response.db_row_data
                        )
                    }

                    sidebarRoll.removeClass('loading')
                    get_this().unfreeze_form()
                    get_this().properties_form_close()
                    get_this().initialize_property_form()
                    get_this().set_properties_default()

                    if (null != response.db_row_data.name) {
                        var title = response.db_row_data.name
                        if (title.length > 30) {
                            title = title.substring(0, 30) + '...'
                        }
                        jQuery('.plugion_properties_title').html(title)
                    } else {
                        jQuery('.plugion_properties_title').html('')
                    }
                },
                400: function (response) {
                    get_this().unfreeze_form()
                    jQuery('.plugion_properties_title').html(plugionl10n.failed)
                    jQuery('.plugion_property_content_inner').html(
                        plugionl10n.bad_request
                    )
                    jQuery('.plugion_form_controls > input').prop(
                        'disabled',
                        true
                    )
                },
                404: function (response) {
                    get_this().unfreeze_form()
                    jQuery('.plugion_properties_title').html(plugionl10n.failed)
                    jQuery('.plugion_property_content_inner').html(
                        plugionl10n.element_not_found
                    )
                    jQuery('.plugion_form_controls > input').prop(
                        'disabled',
                        true
                    )
                },
                401: function (response) {
                    get_this().unfreeze_form()
                    jQuery('.plugion_properties_title').html(plugionl10n.failed)
                    jQuery('.plugion_property_content_inner').html(
                        plugionl10n.forbidden
                    )
                    jQuery('.plugion_form_controls > input').prop(
                        'disabled',
                        true
                    )
                },
                403: function (response) {
                    get_this().unfreeze_form()
                    jQuery('.plugion_properties_title').html(plugionl10n.failed)
                    jQuery('.plugion_property_content_inner').html(
                        plugionl10n.forbidden
                    )
                    jQuery('.plugion_form_controls > input').prop(
                        'disabled',
                        true
                    )
                },
                422: function (response) {
                    propertyInfo.html(response.responseJSON[0][1])
                    jQuery('[data-js="sidebar-roll-wb"]').removeClass('loading')
                },
            },
        })
    }

    freeze_form() {
        jQuery('body').addClass('freeze_form')
        jQuery('.plugion_line_loader').removeClass('plugion_hidden')
        jQuery('.plugion_overlay').removeClass('plugion_hidden')
        jQuery('.plugion_form_controls > input').prop('disabled', true)
        jQuery('[data-js="main-curtain-wb"]').fadeIn(200)
    }

    unfreeze_form() {
        jQuery('body').removeClass('freeze_form')
        jQuery('.plugion_line_loader').addClass('plugion_hidden')
        jQuery('.plugion_overlay').addClass('plugion_hidden')
        jQuery('.plugion_form_controls > input').prop('disabled', false)
        jQuery('[data-js="main-curtain-wb"]').fadeOut(200)
        jQuery('[data-js="sidebar-roll-wb"]').removeClass('loading')
    }

    set_rows_events() {
        const get_this = () => {
            return this
        }
        const editRow = jQuery('.options-item-edit-wb')
        editRow.unbind('click')
        editRow.click(function () {
            jQuery('.sidebar_confirm_wb').addClass('wbk_hidden')
            const table = jQuery(this).closest('table').attr('data-table')
            const propertyContainer = jQuery(
                '.plugion_property_container_form[data-table=' + table + ']'
            )
            const sidebarRoll = propertyContainer.find(
                '[data-js="sidebar-roll-wb"]'
            )
            const title = propertyContainer.find('.property_form_title')

            get_this().error_reset()
            get_this().row_controls_tabs_reset()

            title.text(wbk_dashboardl10n.edit)

            sidebarRoll.addClass('slide-wb')
            sidebarRoll
                .find('.help-popover-box-wb')
                .first()
                .addClass('wbk_wide_tooltip')
            setTimeout(function () {
                sidebarRoll.addClass('open-wb')
            }, 200)
            jQuery('body').addClass('freeze_form')
            jQuery('[data-js="main-curtain-wb"]').fadeIn(200)

            get_this().freeze_form()
            var row_id = jQuery(this).closest('tr').attr('data-id')
            propertyContainer.attr('data-id', row_id)
            var data = {
                table: table,
                row_id: row_id,
            }
            jQuery.ajax(plugionl10n.rest_url + 'plugion/v1/load-properties', {
                method: 'POST',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', plugionl10n.nonce)
                },
                data: data,
                statusCode: {
                    200: function (response) {
                        Scrollbar.initAll({
                            alwaysShowTracks: true,
                            damping: 0.5,
                        })
                        get_this().discard_buffer = response
                        propertyContainer
                            .find('.plugion_properties_save')
                            .attr('data-id', row_id)
                        propertyContainer
                            .find('.plugion_delete_row')
                            .attr('data-row-id', row_id)
                        propertyContainer
                            .find('.plugion_duplicate_row')
                            .attr('data-row-id', row_id)
                        get_this().show_row_controls_properties_form(table)
                        get_this().set_properties(response)
                        get_this().init_dependency()
                        get_this().initialize_property_form()
                        if ('wp_wbk_service_categories' === table) {
                            get_this().update_service_list(table)
                        }
                        jQuery('.slide-wb').removeClass('loading')
                        sidebarRoll.removeClass('loading')
                        jQuery(document).trigger('plugion_properties_form_set')
                    },
                    400: function (response) {
                        get_this().unfreeze_form()
                        jQuery('.plugion_properties_title').html(
                            plugionl10n.failed
                        )
                        jQuery('.plugion_property_content_inner').html(
                            plugionl10n.bad_request
                        )
                        jQuery('.plugion_form_controls > input').prop(
                            'disabled',
                            true
                        )
                    },
                    404: function (response) {
                        get_this().unfreeze_form()
                        jQuery('.plugion_properties_title').html(
                            plugionl10n.failed
                        )
                        jQuery('.plugion_property_content_inner').html(
                            plugionl10n.element_not_found
                        )
                        jQuery('.plugion_form_controls > input').prop(
                            'disabled',
                            true
                        )
                    },
                    401: function (response) {
                        get_this().unfreeze_form()
                        jQuery('.plugion_properties_title').html(
                            plugionl10n.failed
                        )
                        jQuery('.plugion_property_content_inner').html(
                            plugionl10n.forbidden
                        )
                        jQuery('.plugion_form_controls > input').prop(
                            'disabled',
                            true
                        )
                    },
                    403: function (response) {
                        get_this().unfreeze_form()
                        jQuery('.plugion_properties_title').html(
                            plugionl10n.failed
                        )
                        jQuery('.plugion_property_content_inner').html(
                            plugionl10n.forbidden
                        )
                        jQuery('.plugion_form_controls > input').prop(
                            'disabled',
                            true
                        )
                    },
                },
            })
        })
        jQuery(document).trigger('plugion_row_events_set')
    }

    set_properties(data) {
        const get_this = () => {
            return this
        }
        if (null == data) {
            jQuery('.plugion_properties_title').html(plugionl10n.failed)
            jQuery('.plugion_property_content_inner').html(
                plugionl10n.bad_request
            )
        }
        jQuery.each(data, function (k, v) {
            if (
                jQuery(".plugion_property_input[name='" + k + "']").length > 0
            ) {
                var elem = jQuery(".plugion_property_input[name='" + k + "']")
                get_this().set_field_value(elem, v)
                if (k == 'name') {
                    var title = v
                    if (v != null) {
                        if (title.length > 30) {
                            title = title.substring(0, 30) + '...'
                        }
                        jQuery('.plugion_properties_title').html(title)
                    } else {
                        jQuery('.plugion_properties_title').html('')
                    }
                }
            }
        })

        jQuery(document).trigger('plugion_properties_set')
    }
    set_properties_default() {
        const get_this = () => {
            return this
        }
        jQuery('.plugion_property_input').each(function () {
            if (typeof jQuery(this).attr('data-default') != 'undefined') {
                get_this().set_field_value(
                    jQuery(this),
                    jQuery(this).attr('data-default')
                )
            }
        })
    }
    set_field_value(elem, value) {
        const get_this = () => {
            return this
        }
        if (typeof elem.attr('data-setter') !== 'undefined') {
            if (!get_this().field_setters[elem.attr('data-setter')]) {
                return
            }
            get_this().field_setters[elem.attr('data-setter')](elem, value)
        } else {
            elem.val(value)
        }
        jQuery(document).trigger('plugion_input_set', [elem, value])
    }

    get_field_value(elem) {
        const get_this = () => {
            return this
        }
        if (typeof elem.attr('data-getter') !== 'undefined') {
            var value = get_this().field_getters[elem.attr('data-getter')](elem)
        } else {
            var value = elem.val()
        }
        return value
    }

    add_setter(name, func) {
        const get_this = () => {
            return this
        }
        get_this().field_setters[name] = func
    }

    add_getter(name, func) {
        const get_this = () => {
            return this
        }
        get_this().field_getters[name] = func
    }

    add_validator(name, func) {
        const get_this = () => {
            return this
        }
        get_this().field_validators[name] = func
    }

    validate_integer(val) {
        return /^\+?(0|[1-9]\d*)$/.test(val)
    }

    validate_float(val) {
        return /^(?:[1-9]\d*|0)?(?:\.\d+)?$/.test(val)
    }

    validate_string_length(val, min, max) {
        if (val.length < min || val.length > max) {
            return false
        } else {
            return true
        }
    }

    validate_email(val) {
        var re =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (val == '' || !re.test(val)) {
            return false
        }
        return true
    }

    validate_integer_range(val, min, max) {
        const get_this = () => {
            return this
        }
        if (!get_this().validate_integer(val)) {
            return false
        }
        val = parseInt(val)
        min = parseInt(min)
        max = parseInt(max)

        if (val < min || val > max) {
            return false
        } else {
            return true
        }
    }

    valodate_phone(val) {
        var pattern = new RegExp(
            /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/
        )
        return pattern.test(val)
    }

    validate_price(val) {
        const get_this = () => {
            return this
        }
        if (val == '') {
            return false
        }
        if (wbkCheckInteger(val)) {
            if (get_this().validate_integer_range(val, 0, MAX_SAFE_INTEGER)) {
                return true
            }
        }
        if (get_this().validate_float(val)) {
            if (val >= 0 || val <= MAX_SAFE_INTEGER) {
                return true
            }
        }
        return false
    }

    set_cookie(name, value, days) {
        var expires = ''
        if (days) {
            var date = new Date()
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
            expires = '; expires=' + date.toUTCString()
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/'
    }

    get_cookie(name) {
        var nameEQ = name + '='
        var ca = document.cookie.split(';')
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i]
            while (c.charAt(0) == ' ') c = c.substring(1, c.length)
            if (c.indexOf(nameEQ) == 0)
                return c.substring(nameEQ.length, c.length)
        }
        return null
    }

    duplicate_row(table, row_id, element) {
        const get_this = () => {
            return this
        }
        element.addClass('loading')
        let schedules_calendar =
            jQuery('.schedules-calendar-block-wb').length > 0
        var data = {
            table: table,
            row_id: row_id,
        }
        jQuery.ajax(plugionl10n.rest_url + 'plugion/v1/duplicate-row', {
            method: 'POST',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', plugionl10n.nonce)
            },
            data: data,
            statusCode: {
                200: function (response) {
                    var node = get_this()
                        .tables[table].row.add(response.row_data)
                        .draw()
                        .node()
                    get_this()
                        .tables[table].order([[0, 'desc']])
                        .draw(true)

                    node.setAttribute('data-id', response.db_row_data.id)
                    node.setAttribute('data-table', table)
                    node.setAttribute('has-hidden-details', '')
                    if (response.row_options.canedit == true) {
                        node.classList.add('plugion_editable_row')
                    }
                    jQuery(document).trigger(
                        'plugion_after_row_added',
                        response.db_row_data
                    )

                    element.removeClass('loading')

                    get_this().initialize_property_form()
                    get_this().set_properties_default()

                    if (schedules_calendar && typeof calendar !== 'undefined') {
                        let service_id = jQuery(
                            '.schedule-chosen-select'
                        ).val()[0]
                        let current_timestamp = jQuery(
                            '[data-timeslot-edited-timestamp]'
                        ).data('timeslot-edited-timestamp')
                        let current_timeslot = jQuery(
                            '[data-timeslot-timestamp="' +
                                current_timestamp +
                                '"]'
                        )
                        let current_event =
                            current_timeslot.closest('.fc-event')
                        let current_event_main =
                            current_timeslot.closest('.fc-event-main')
                        let is_new = true

                        current_event_main.html(
                            '<div class="loading"></div><div class="cb"></div>'
                        )

                        var data = {
                            action: 'wbk_add_appointment_backend_fullcalendar',
                            nonce: wbkl10n.wbkb_nonce,
                            service_id: service_id,
                            time: current_timestamp,

                            edited_time: current_timestamp,
                            is_new: is_new,
                        }
                        jQuery.post(ajaxurl, data, function (response) {
                            if (
                                response != -1 &&
                                response != -2 &&
                                response != -3 &&
                                response != -4 &&
                                response != -5 &&
                                response != -6 &&
                                response != -7 &&
                                response != -8 &&
                                response != -9 &&
                                response != -10 &&
                                response != -11 &&
                                response != -12
                            ) {
                                var objdata = jQuery.parseJSON(response)
                                current_event_main.html(objdata.day)

                                setEvents_fullcalendar(calendar)
                            } else {
                                current_timeslot.html('error ' + response)
                            }
                        })
                    }
                },
                400: function (response) {},
                404: function (response) {},
                401: function (response) {},
                403: function (response) {},
                422: function (response) {},
            },
        })
    }

    duplicate_row_button_init() {
        const get_this = () => {
            return this
        }
        const duplicateRow = jQuery('.plugion_duplicate_row')
        duplicateRow.unbind('click')
        duplicateRow.click(function (event) {
            let table = jQuery(this).data('table')
            let row_id = jQuery(this).data('row-id')
            row_id = jQuery(this).attr('data-row-id')
            event.stopPropagation()
            get_this().duplicate_row(table, row_id, jQuery(this))
            get_this().properties_form_close()
        })
    }

    hidden_details_row_init() {
        const hiddenDetailsRow = jQuery('.hidden_details_row')
        hiddenDetailsRow.unbind('click')
        hiddenDetailsRow.click(function (event) {
            var jQueryhas_hidden_details = jQuery(this).closest(
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
        })
    }

    delete_row_button_init() {
        const get_this = () => {
            return this
        }
        const deleteRow = jQuery('.plugion_delete_row')
        deleteRow.unbind('click')
        deleteRow.click(function () {
            const button = jQuery(this)
            let deleteConfirm

            if ('edit' === button.data('type')) {
                deleteConfirm = button
                    .closest('.manipulations-block-wb')
                    .find('.single-delete-edit-confirm-wb')
            } else {
                deleteConfirm = button
                    .closest('.table-options-wb')
                    .find('.single-delete-confirm-wb')
            }

            deleteConfirm.show()

            deleteConfirm.unbind('click')
            deleteConfirm.click(function () {
                if ('edit' === button.data('type')) {
                    get_this().properties_form_close()
                }
                get_this().delete_rows(
                    [button.data('row-id')],
                    button.data('table'),
                    button
                )
                deleteConfirm.remove()
            })
        })
    }

    delete_rows_button_init() {
        const get_this = () => {
            return this
        }
        const massDeleteButton = jQuery('[mass-delete-button]')

        massDeleteButton.unbind('click')
        massDeleteButton.click(function () {
            const button = jQuery(this)

            const massDeleteConfirm = button
                .closest('.select-rows-block-wb')
                .find('.mass-delete-confirm-wb')

            massDeleteConfirm.show()

            massDeleteConfirm.unbind('click')
            massDeleteConfirm.click(function () {
                let tableArea = jQuery(this).closest('.table-area-wb')

                let rows = []
                tableArea
                    .find('[checkbox-select-row]:checked')
                    .each(function () {
                        rows.push(jQuery(this).closest('tr').data('id'))
                    })
                get_this().delete_rows(rows, button.data('table'), button)
                massDeleteConfirm.hide()
            })
        })
    }
    /*
    table_checkbox_add_class_to_row() {
        jQuery('[checkbox-select-row]').on('click', function () {
            if (jQuery(this).is(':checked')) {
                jQuery(this).closest('tr').addClass('row-selected-wb');
                jQuery(this)
                    .closest('[custom-table-wrapper]')
                    .find('[select-rows-checkbox]')
                    .prop('checked', true);
            } else {
                jQuery(this).closest('tr').removeClass('row-selected-wb');
            }
        });
    }
    */
    table_checkbox_add_class_to_row() {
        jQuery('[checkbox-select-row]').on('click', function () {
            const table = jQuery(this).closest('[custom-table-wrapper]')
            const checkbox = table.find('[checkbox-select-row]')
            let checked = false
            if (jQuery(this).is(':checked')) {
                jQuery(this).closest('tr').addClass('row-selected-wb')
                table.find('[select-rows-checkbox]').prop('checked', true)
            } else {
                jQuery(this).closest('tr').removeClass('row-selected-wb')
            }
            checkbox.each(function () {
                if (jQuery(this).is(':checked')) {
                    checked = true
                }
            })
            if (!checked) {
                table.find('[select-rows-checkbox]').prop('checked', false)
                table.find('[checkbox-select-all]').prop('checked', false)
            }
        })
    }

    properties_form_open(dataName) {
        jQuery('.sidebar_confirm_wb').addClass('wbk_hidden')
        const containerAdd = jQuery(
            '.plugion_property_container_form[data-table=' + dataName + ']'
        )

        if (containerAdd.length) {
            const sidebarRoll = containerAdd.find('[data-js="sidebar-roll-wb"]')
            sidebarRoll
                .find('.help-popover-box-wb')
                .first()
                .addClass('wbk_wide_tooltip')
            const title = containerAdd.find('.property_form_title')
            this.row_controls_tabs_reset()
            title.text(wbk_dashboardl10n.new)
            sidebarRoll.addClass('slide-wb')
            setTimeout(function () {
                sidebarRoll.addClass('open-wb')
            }, 200)
            jQuery('body').addClass('freeze_form')
            jQuery('[data-js="main-curtain-wb"]').fadeIn(200)
        }
    }

    properties_form_close() {
        jQuery('[data-js="sidebar-roll-wb"]').each(function () {
            jQuery(this).removeClass('slide-wb')

            setTimeout(function () {
                jQuery(this).removeClass('open-wb')
            }, 200)
            jQuery('body').removeClass('freeze_form')
            jQuery('[data-js="main-curtain-wb"]').fadeOut(200)
        })
    }

    row_controls_tabs() {
        const tabs = jQuery('.plugion_row_controls_tabs')

        if (tabs.length) {
            tabs.click(function () {
                const item = jQuery(this).data('js-item')

                tabs.removeClass('active-wb')
                jQuery(this).addClass('active-wb')

                const scrollContent = jQuery(this).closest('.scroll-content')
                scrollContent
                    .find('.new-service-content-item-wb')
                    .removeClass('active-wb')
                scrollContent
                    .find(
                        '.new-service-content-item-wb[data-js-item="' +
                            item +
                            '"]'
                    )
                    .addClass('active-wb')
                scrollContent
                    .find(
                        '.new-service-content-item-wb[data-js-item="' +
                            item +
                            '"]'
                    )
                    .find('.help-popover-box-wb')
                    .first()
                    .addClass('wbk_wide_tooltip')
            })
        }
    }

    row_controls_tabs_reset() {
        const tabs = jQuery('.plugion_row_controls_tabs')
        if (tabs.length) {
            tabs.removeClass('active-wb')
            tabs.first().addClass('active-wb')

            const scrollContent = tabs.first().closest('.scroll-content')
            scrollContent
                .find('.new-service-content-item-wb')
                .removeClass('active-wb')
            scrollContent
                .find('.new-service-content-item-wb')
                .first()
                .addClass('active-wb')
        }
    }

    show_row_controls_properties_form(dataName) {
        const propertyContainerForm = jQuery(
            '.plugion_property_container_form[data-table=' + dataName + ']'
        )
        const propertiesSaveId = propertyContainerForm
            .find('.plugion_properties_save')
            .attr('data-id')
        const manipulationItems = jQuery('.manipulations-block-wb .item-wb')
        if (propertiesSaveId) {
            manipulationItems.removeClass('hide_element')
        } else {
            manipulationItems.addClass('hide_element')
        }
    }

    toggle_business_hours() {
        jQuery('[data-js-status-business-hours]').each(function () {
            const row = jQuery(this).closest('[data-js-business-hours-row]')
            const switcher = row.find('[data-js-toggle-business-hours]')
            if (jQuery(this).val() === 'inactive') {
                switcher.removeClass('on')
                row.attr('disabled', '')
            } else {
                switcher.addClass('on')
                row.removeAttr('disabled')
            }
        })
    }

    resend_email(){
        const resend_btn = jQuery('.resend_email_btn')
        resend_btn.unbind('click')
        resend_btn.on('click', function () {
            const normal_text = jQuery(this).html();
            const button =  jQuery(this)
            button.html(button.attr('data-action-text'));
            button.attr('disabled', true);
            button.siblings('.wbk_email_resend_result').html('')
            button.siblings('.wbk_email_resend_result').removeClass('wbk_font_green')
            button.siblings('.wbk_email_resend_result').removeClass('wbk_font_red')
            const notification_type = jQuery(this).siblings('.wbk_resend_email').val();
            const booking_id = parseInt(jQuery(this).closest('tr').find('td:first-child').html().replace(/<[^>]*>/g, "").replace(/\s+/g, "").replace(/\D/g, ""));       
            let data = {
                id: booking_id,
                notification_type: notification_type,
            }        
            jQuery.ajax(
                plugionl10n.rest_url + 'wbk/v1/resend-email',
                {
                    method: 'POST',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('X-WP-Nonce', plugionl10n.nonce)
                    },
                    data: data,
                    complete: function(xhr, status) {                    
                        button.html(normal_text);
                        button.attr('disabled', false);
                        button.siblings('.wbk_email_resend_result').html(xhr.responseJSON.message);
                    },  
                    success: function (response) {
                        button.siblings('.wbk_email_resend_result').addClass('wbk_font_green')
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        button.siblings('.wbk_email_resend_result').addClass('wbk_font_red') 
                    }
                    
                }
            )
            
        });
    }

    appointments_status_change_init() {
        const statusChange = jQuery('.appointments_status_change')
        statusChange.unbind('change')
        statusChange.on('change', function () {
            let row = jQuery(this).closest('tr')
            let data = {
                table: row.data('table'),
                row_id: row.data('id'),
                status: jQuery(this).val(),
            }
            let statusSelect = jQuery(this).closest('[status-select]')
            statusSelect.attr('data-value', jQuery(this).val())
            jQuery.ajax(
                plugionl10n.rest_url + 'wbk/v1/appointments-status-change',
                {
                    method: 'POST',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('X-WP-Nonce', plugionl10n.nonce)
                    },
                    data: data,
                    statusCode: {
                        200: function (response) {},
                    },
                }
            )
        })
    }

    error_reset() {
        jQuery('.plugion_propery_info').html('')
        jQuery('.plugion_input_field_error').removeClass(
            'plugion_input_field_error'
        )
    }

    update_service_list(table) {
        return
        const categoryList = jQuery('#category_list')
        const chosen = categoryList
            .siblings('.chosen-container')
            .find('.chosen-choices')
        let data = {
            table: table,
        }

        chosen.find('.chosen-search-input').css('visibility', 'hidden')
        chosen.addClass('plugion_loader')
        jQuery.ajax(plugionl10n.rest_url + 'wbk/v1/get-service-list', {
            method: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', plugionl10n.nonce)
            },
            data: data,
            statusCode: {
                200: function (response) {
                    chosen
                        .find('.chosen-search-input')
                        .css('visibility', 'visible')
                    chosen.removeClass('plugion_loader')
                    categoryList.html(response.html).trigger('chosen:updated')
                },
            },
        })
    }
}
var plugion
jQuery(function ($) {
    plugion = new Plugion_WBK()

    jQuery(document).trigger('plugion_initialized')
})

/* START document ready */
jQuery(function () {
    /* help popover function call (full function is in current file) */
    help_popover()

    /* custom select function call (full function is in plugins.js) */
    //  jQuery('select:not(.chosen-select)').niceSelect();

    /* toggle container function call (full function is in current file) */
    toggle_container()

    /* toggle visual editor (full function is in current file) */
    toggle_visual_editor()

    /* slider range working hours function call (init function is in current file, and full plugin is in plugins.js ) */
    slider_range_working_hours()

    /* copy to clipboard (full function is in current file) */
    copy_to_clipboard()

    /* multiselect (full plugin is in plugins.js) */
    jQuery('.chosen-select').chosen()

    /* close notification bar (full function is in current file) */
    close_notification_bar()

    /* appearance tab menu (full function is in currrent file) */
    appearance_tab_menu()

    /* appearance selector checkboxes (full function is in current file) */
    appearance_selector_checkboxes()

    /* color picker function call (full function is in current file) */
    color_picker_block()

    /* colors color picker (full function is in current file) */
    colors_color_picker()

    /* colors border radius (full function is in current file) */
    colors_border_radius()

    /* borders background color (full function is in current file) */
    borders_background_color()

    /* borders text color (full function is in current file) */
    borders_text_color()

    /* borders color on click function call (full function is in current file) */
    borders_color_on_click()

    /* borders border radius (full function is in current file) */
    borders_border_radius()

    /* buttons background color function call (full function is in current file) */
    buttons_background_color()

    /* buttons text color function call (full function is in current file) */
    buttons_text_color()

    /* buttons border radius (full function is in current file) */
    buttons_border_radius()

    /* appearance font change function call (full function is in current file) */
    apperance_font()

    /* toggle switcher appearance desktop/mobile function call (full function is in current file) */
    toggle_switcher_mobile()

    /* appearance main menu mobile toggle (full function is in current file) */
    appearance_main_menu_mobile_toggle()

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
            jQuery('[data-js="next-step-button-wbk"]').removeAttr('disabled')
        },
    })

    /* sppearance back/next buttons function call (full function is in current file) */
    appearance_back_next_buttons()

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
    input_help_popover()

    /* new service tabs menu (full function is in current file) */
    new_service_tabs_menu()

    /* toggle switch function call (full function is in current file) */
    toggle_switch()

    /* add one more field (full function is in current file) */
    add_one_more_field()

    /* business hours slider time calculation */
    business_slider_time_calculation()

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
    toggle_switch_buttons()

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
    //fullcalendar();

    /* full function is in current file */
    selected_customers_list_delete_row()

    /* full function is in current file */
    custom_scrollbar()

    bookings_filter_select_init()

    /* filter options*/
    status_custom_select()

    /** Graph */
    dashboard_graph()
    jQuery('.button-wbkb-appearance-save').click(function () {
        var appearance_data = []
        var btn = jQuery(this)
        wbk_change_button_status(btn, 'loading')
        jQuery('.input-wb[type=text], .input-wb[type=number]').each(
            function () {
                var classes = jQuery(this).attr('data-class').split(',')
                for (i = 0; i < classes.length; i++) {
                    var appearance_item = {
                        class: classes[i],
                        property: jQuery(this).attr('data-property'),
                        value: jQuery(this).val(),
                        id: jQuery(this).attr('id'),
                    }
                    appearance_data.push(appearance_item)
                }
            }
        )
        var form_data = new FormData()
        var name = jQuery.trim(jQuery('[name="wbk-name"]').val())
        form_data.append('appearance_data', JSON.stringify(appearance_data))
        form_data.append('action', 'wbk_save_appearance')
        form_data.append('nonce', wbk_dashboardl10n.wbkb_nonce)

        jQuery.ajax({
            url: wbk_dashboardl10n.ajaxurl,
            type: 'POST',
            data: form_data,
            cache: false,
            processData: false,
            contentType: false,
            success: function (response) {
                wbk_change_button_status(btn, 'regular')
                wbk_show_backend_notification(
                    "Appearance settings saved. Please, don't forget to clear the cache in your browser.",
                    jQuery(btn.parent())
                )
            },
        })
    })

    jQuery('.wbk_demo_button').click(function () {
        wbk_show_backend_notification(
            'This button is for demonstration purposes only.',
            jQuery('.main-block-wb')
        )
        return false
    })
})
/* END document ready */

function bookings_filter_select_init() {
    jQuery('.bookings-filter-select').niceSelect()
}

/* START help popover */

function help_popover() {
    jQuery('[data-js="help-popover-wb"]').each(function () {
        var jQueryhelp_popover_wb = jQuery(this)

        jQueryhelp_popover_wb
            .find('[data-js="help-icon-wb"]')
            .click(function (e) {
                e.stopPropagation()
                jQuery('[data-js="help-popover-box-wb"]').toggle(false)
                jQueryhelp_popover_wb
                    .find('[data-js="help-popover-box-wb"]')
                    .fadeToggle(200)
            })
        jQueryhelp_popover_wb
            .find('[data-js="help-popover-box-wb"]')
            .click(function () {
                jQuery(this).toggle()
            })
    })
}

/* END help popover */

/* START toggle container */

function toggle_container() {
    jQuery('[data-js="toggle-container-wb"]').each(function () {
        var jQuerytoggle_container_wb = jQuery(this)

        jQuerytoggle_container_wb
            .find('[data-js="toggle-title-wb"]')
            .click(function () {
                jQuerytoggle_container_wb
                    .find('[data-js="toggle-content-wb"]')
                    .slideToggle(200, function () {
                        jQuerytoggle_container_wb.toggleClass('open-wb')
                    })
            })
    })
}

/* END toggle container */

/* START toggle visual editor */

function toggle_visual_editor() {
    jQuery('[data-js="toggle-editor-wrapper-wb"]').each(function () {
        var jQuerytoggle_editor_wrapper_wb = jQuery(this)

        jQuerytoggle_editor_wrapper_wb
            .find('[data-js="toggle-visual-editor-wb"]')
            .click(function (e) {
                e.preventDefault()

                jQuerytoggle_editor_wrapper_wb
                    .find('[data-js="toggle-visual-edotor-content-wb"]')
                    .slideToggle(200)
            })
    })
}

/* END toggle visual editor */

/* START range slider */

function slider_range_working_hours() {
    jQuery('#slider-range-working-hours-wb').slider({
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

            jQuery('#slider-range-working-hours-time-wb').val(
                hours1 + ':' + minutes1 + ' - ' + hours2 + ':' + minutes2
            )
        },
    })
}

/* END range slider */

/* START copy to clipboard */

function copy_to_clipboard() {
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

function close_notification_bar() {
    var jQuerynotification_bar_wb = jQuery('[data-js="notification-bar-wb"]')

    jQuerynotification_bar_wb
        .find('[data-js="block-close-wb"]')
        .click(function () {
            jQuerynotification_bar_wb.slideUp(200)
        })
}

/* END close notification bar */

/* START appearance tab menu */

function appearance_tab_menu() {
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

function appearance_selector_checkboxes() {
    jQuery('[data-js="radio-selector-of-services-wb"]').click(function () {
        var radio_selector_of_services_name = jQuery(this).attr('data-name')

        jQuery('[data-js="selector-of-services-wb"]').removeClass('active-wb')

        jQuery(
            '[data-js="selector-of-services-wb"][data-name=' +
                radio_selector_of_services_name +
                ']'
        ).addClass('active-wb')
    })
}

/* END appearance selector checkboxes */

/* START color picker block */

function color_picker_block() {
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

function colors_color_picker() {
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

function colors_border_radius() {
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

function borders_background_color() {
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

        jQuery('[data-borders-background-color] ~ .nice-select .current').css(
            'background-color',
            jQuery(this).val()
        )

        jQuery('[data-calendar-borders-background-color] .refDate').css(
            'background-color',
            jQuery(this).val()
        )
    })
}

/* END borders background color */

/* START borders text color */

function borders_text_color() {
    jQuery('[data-js="borders-text-color-picker"]').on('input', function () {
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

function borders_color_on_click() {}

/* END borders color on click */

/* START borders border radius */

function borders_border_radius() {
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

function buttons_background_color() {
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

function buttons_text_color() {
    jQuery('[data-js="buttons-text-color-picker"]').on('input', function () {
        jQuery('[data-buttons-background-color]').css(
            'color',
            jQuery(this).val()
        )
    })

    jQuery('[data-js="buttons-text-color"]').on('input', function () {
        jQuery('[data-buttons-background-color]').css(
            'color',
            jQuery(this).val()
        )
    })
}

/* END buttons text color */

/* START buttons border radius */

function buttons_border_radius() {
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

function apperance_font() {
    jQuery('[data-js="appearance-font"]').on('change', function () {
        var select_value = jQuery(this).val()
        jQuery('[data-appearance-font]').css('font-family', select_value)
    })
}

/* END appearance font */

/* START desktop/mobile-sitcher */

function toggle_switcher_mobile() {
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

function appearance_main_menu_mobile_toggle() {
    jQuery('[data-js="appearance-toggle-mobile-menu-w"]').click(function () {
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
    })
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

function appearance_back_next_buttons() {
    jQuery('[data-js-appointment-button]').click(function (e) {
        e.preventDefault()

        var appointment_button_data = jQuery(this).attr(
            'data-js-appointment-button'
        )

        if (appointment_button_data != 0) {
            jQuery('[data-js-appointment-box]').removeClass('active-wb')

            jQuery(
                '[data-js-appointment-box="' + appointment_button_data + '"]'
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

        jQueryadditional_select_list_w.find('[data-option]').click(function () {
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

function input_help_popover() {
    jQuery('[data-js="input-help-w"]').each(function () {
        var jQueryhelp_ico_w = jQuery(this).find('[data-js="help-icon"]')

        var jQueryhelp_popover_w = jQuery(this).find(
            '[data-js="help-popover-w"]'
        )

        jQueryhelp_ico_w.click(function () {
            jQueryhelp_popover_w.fadeToggle(200)
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

function toggle_switch() {
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

/* START delete business hours row */

function delete_business_hours_row() {
    jQuery('[data-js-delete-business-hours-row]').click(function () {
        jQuery(this).closest('[data-js-business-hours-row]').detach()
    })
}

/* END delete business hours row */

/* START business hours slider time calculation */

function business_slider_time_calculation() {}

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
                    hours1 + ':' + minutes1 + ' - ' + hours2 + ':' + minutes2
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

        var jQuerybusiness_hours_field_block = jQuerybusiness_hours_area.find(
            '[data-js-business-hours-field-block]'
        )

        var jQuerybusiness_hours_copy_button = jQuerybusiness_hours_area.find(
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
                        if (jQuery(this).attr('data-status') == this_data_js) {
                            if (jQuery(this).is(':checked')) {
                                jQuery(this).prop('checked', false)

                                jQuerycustom_table_wrapper
                                    .find('[select-rows-checkbox]')
                                    .prop('checked', false)

                                jQuerycustom_table_wrapper
                                    .find('[checkbox-select-all]')
                                    .prop('checked', false)

                                jQuerycustom_table_wrapper
                                    .find('tbody')
                                    .find('tr')
                                    .removeClass('row-selected-wb')
                            } else {
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
                        }
                    })
            }

            jQueryselect_rows_area.removeClass('active-wb')

            jQueryblock_dropdown.fadeOut(200)
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
function remove_details_on_pagination_click() {
    jQuery('.dataTables_paginate').on('click', function () {
        jQuery('[has-hidden-details]').removeClass('active-wb')
    })
}
/* END hidden details row copy */

/* START toggle switch buttons */
function toggle_switch_buttons() {
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
    jQuery('[selected-customers-list] [delete-row]').on('click', function () {
        jQuery(this).closest('li').detach()
    })
}

/* END selected customers list delete row */

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
                        '<div class="event-popover-wb"><div class="popover-title-wb">Jenifer Wilson</div><div class="popover-time-wb">10:30-11:00 AM</div><div class="popover-service-wb">Example Service</div><div class="popover-footer-wb"><div class="popover-name-letter-wb">A</div><div class="popover-name-wb">Amina Amina</div><div class="popover-edit-wb" data-js="open-sidebar-wb" data-name="sidebar-edit-appointment"></div></div></div>'
                    )

                    jQuery(this)
                        .closest('.fc-event')
                        .on('click', function () {
                            var jQueryevent_popover_wb_new =
                                jQuery(this).find('.event-popover-wb')

                            if (
                                jQueryevent_popover_wb_new.hasClass('active-wb')
                            ) {
                                jQueryevent_popover_wb_new.removeClass(
                                    'active-wb'
                                )
                            } else {
                                jQueryevent_popover_wb_new.addClass('active-wb')
                            }
                        })
                }
            })

            /* START add test lock closed to month view */

            jQuerycalendarEl.find('th:first-child').addClass('locked-wb')

            jQuerycalendarEl.find('td:first-child').addClass('locked-wb')

            /* END add test lock closed to month view */
        }, 500)
    }
}

/* END fullcalendar */

/* START status custom select */

function status_custom_select() {
    jQuery('.custom-select-wb > select').niceSelect()

    jQuery('[status-select]').each(function () {
        var data_value = jQuery(this).attr('data-value')

        jQuery(this)
            .closest('tr')
            .find('[checkbox-select-row]')
            .attr('data-status', data_value)
    })

    jQuery('[status-select] .nice-select .list li').on('click', function () {
        var jQuerystatus_select = jQuery(this).closest('[status-select]')

        var data_value = jQuery(this).attr('data-value')

        jQuerystatus_select.attr('data-value', data_value)

        jQuery(this)
            .closest('tr')
            .find('[checkbox-select-row]')
            .attr('data-status', data_value)
    })

    // var format = 'MMMM D,YYYY';
    var input_format = 'MM/DD/YYYY'

    jQuery('[data-date-filter] .nice-select .list li').on('click', function () {
        var data_value = jQuery(this).attr('data-value')

        switch (data_value) {
            case 'today':
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_start'
                ).val(moment().format(input_format))
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_end'
                ).val(moment().format(input_format))

                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_start'
                ).attr('data-formated-date', moment().format(input_format))
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_end'
                ).attr('data-formated-date', moment().format(input_format))

                break
            case 'l_7':
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_start'
                ).val(moment().subtract(8, 'days').format(input_format))
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_end'
                ).val(moment().subtract(1, 'days').format(input_format))

                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_start'
                ).attr(
                    'data-formated-date',
                    moment().subtract(8, 'days').format(input_format)
                )
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_end'
                ).attr(
                    'data-formated-date',
                    moment().subtract(1, 'days').format(input_format)
                )

                break
            case 'u_7':
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_start'
                ).val(moment().format(input_format))
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_end'
                ).val(moment().add(7, 'days').format(input_format))

                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_start'
                ).attr('data-formated-date', moment().format(input_format))
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_end'
                ).attr(
                    'data-formated-date',
                    moment().add(7, 'days').format(input_format)
                )

                break
            case 'l_30':
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_start'
                ).val(moment().subtract(31, 'days').format(input_format))
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_end'
                ).val(moment().subtract(1, 'days').format(input_format))

                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_start'
                ).attr(
                    'data-formated-date',
                    moment().subtract(31, 'days').format(input_format)
                )
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_end'
                ).attr(
                    'data-formated-date',
                    moment().subtract(1, 'days').format(input_format)
                )

                break
            case 'u_30':
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_start'
                ).val(moment().format(input_format))
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_end'
                ).val(moment().add(30, 'days').format(input_format))

                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_start'
                ).attr('data-formated-date', moment().format(input_format))
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_end'
                ).attr(
                    'data-formated-date',
                    moment().add(30, 'days').format(input_format)
                )

                break
            case 'custom':
                break
        }

        plugion.apply_filters()
    })

    jQuery('.dashboard-header-wb .plugion_input_text').on(
        'change',
        function () {
            jQuery('[data-date-filter] select').val('custom')
            jQuery(
                '[data-date-filter] .nice-select .list li.selected'
            ).removeClass('selected forcus')
            jQuery(
                '[data-date-filter] .nice-select .list [data-value="custom"]'
            ).addClass('selected forcus')
            jQuery('[data-date-filter] .nice-select .current').text(
                jQuery(
                    '[data-date-filter] .nice-select .list [data-value="custom"]'
                ).text()
            )
        }
    )

    jQuery('.dashboard-header-wb .plugion_input_date_range_start').on(
        'change',
        function (e) {
            var start = jQuery(
                '.dashboard-header-wb .plugion_input_date_range_start'
            ).val()
            var end = jQuery(
                '.dashboard-header-wb .plugion_input_date_range_end'
            ).val()

            if (
                moment(start, input_format).isAfter(moment(end, input_format))
            ) {
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_end'
                ).val(start)
            }
        }
    )

    jQuery('.dashboard-header-wb .plugion_input_date_range_end').on(
        'change',
        function (e) {
            var start = jQuery(
                '.dashboard-header-wb .plugion_input_date_range_start'
            ).val()
            var end = jQuery(
                '.dashboard-header-wb .plugion_input_date_range_end'
            ).val()

            if (
                moment(end, input_format).isBefore(moment(start, input_format))
            ) {
                jQuery(
                    '.dashboard-header-wb .plugion_input_date_range_start'
                ).val(end)
            }
        }
    )
}

/* END status custom select */

/** */
function dashboard_graph() {
    var graph = document.getElementById('dashboard-graph')

    if (graph) {
        if (typeof window.wbk_dashboard_options == 'undefined') {
            jQuery('.graph-wb .table-empty-content-wb').removeClass(
                'wbk_hidden'
            )
            return
        } else {
            jQuery(graph).removeClass('wbk_hidden')
        }

        if (typeof window.wbk_dashboard_graph == 'undefined') {
            var price_format = jQuery(graph).attr('data-price-format')

            window.wbk_dashboard_graph = new Chart(graph, {
                type: 'line',
                data: window.wbk_dashboard_options,
                options: {
                    responsive: true,
                    stacked: false,
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            beginAtZero: true,
                            ticks: {
                                display: true,
                                stepSize: 1,
                            },
                        },
                        yRevenu: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            beginAtZero: true,
                            ticks: {
                                display: true,
                                callback: function (label, index, labels) {
                                    return price_format.replace('#price', label)
                                },
                            },
                        },
                    },
                },
            })
        } else {
            window.wbk_dashboard_graph.data = window.wbk_dashboard_options
            window.wbk_dashboard_graph.update()
        }
    }
}
function wbk_show_backend_notification(message, element = null) {
    var message_html =
        '<div class="notification-bar-wb" data-js="notification-bar-wb"><span class="block-icon-wb"><img src= "' +
        wbk_dashboardl10n.nofication_icon +
        '"></span><div class="block-text-wb">' +
        message +
        '</div><span class="block-close-wb" data-js="block-close-wb"></span></div>'

    jQuery(element).append(message_html)

    jQuery('.notification-bar-wb')
        .last()
        .delay(5000)
        .fadeOut('slow', function () {
            jQuery(this.remove())
        })

    jQuery('.notification-bar-wb')
        .last()
        .find('.block-close-wb')
        .click(function () {
            jQuery(this).closest('.notification-bar-wb').remove()
        })
}

function wbk_format_ampm(date) {
    var hours = date.getUTCHours()
    var minutes = date.getUTCMinutes()
    var ampm = hours >= 12 ? 'pm' : 'am'
    hours = hours % 12
    hours = hours ? hours : 12
    minutes = minutes < 10 ? '0' + minutes : minutes
    var strTime = hours + ':' + minutes + ' ' + ampm
    return strTime
}

jQuery(document).on('plugion_initialized', function (event) {
    // wbk_dashboard = new WBK_Dashboard();
    jQuery('.table_wbk_appointments').on('draw.dt', function () {
        wbk_hide_default_custom_field()
    })
})
jQuery(document).on('plugion_before_row_events', function (event, skip_th) {
    wbk_init_app_custom_fiels(skip_th)
    jQuery(
        '.plugion_table_add_button[data-table="wbk_cancelled_appointments"]'
    ).remove()
})
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
jQuery(document).on('plugion_row_events_set', function (event) {
    wbk_hide_default_custom_field()
    if (jQuery('.table_wp_wbk_appointments').length > 0) {
        jQuery('.plugion_duplicate_btn').click(function (event) {
            jQuery(this)
                .closest('td')
                .append(
                    '<span style="color: red;">' +
                        wbk_dashboardl10n.duplication_warning +
                        '</span>'
                )
        })
    }
})
jQuery(function ($) {})

function wbk_init_app_custom_fiels(skip_th = false) {
    if (typeof wbk_custom_fields == 'undefined') {
        return
    }

    if (wbk_custom_fields != '') {
        var items = wbk_get_custom_fields(wbk_custom_fields)
        if (!skip_th) {
            var title_html = ''
            jQuery.each(items, function (i, val) {
                title_html +=
                    '<th class="plugion_cell plugion_exportable">' +
                    val[1] +
                    '</th>'
            })
            jQuery(title_html).insertAfter('#title_appointment_extra')
        }
        jQuery('.wbk_app_custom_data_value').each(function () {
            wbk_set_custom_fields_value(jQuery(this), items)
        })
        wbk_hide_default_custom_field()
    }
}
function wbk_hide_default_custom_field() {
    if (typeof wbk_custom_fields === 'undefined') {
        return
    }

    if (wbk_custom_fields != '') {
        var items = wbk_get_custom_fields(wbk_custom_fields)
        if (items.length > 0) {
            jQuery('#title_appointment_extra').addClass('plugion_hidden')
            jQuery('.wbk_app_custom_data_value')
                .parent()
                .addClass('plugion_hidden')
        }
    }
}
function wbk_set_custom_fields_value(elem, items) {
    var td_elem = elem.parent()
    var value_html = ''
    jQuery.each(items, function (i, val) {
        var current_name = ''
        var current_val = ''
        var elem_html = elem.html()
        elem_html = elem_html.trim()
        if (elem_html != '') {
            var custom_data = jQuery.parseJSON(elem_html)

            jQuery.each(custom_data, function (k, v) {
                if (val[0].trim() == v[0].trim()) {
                    current_name = v[1].trim()
                    current_val = v[2].trim()
                }
            })
        }

        value_html +=
            '<br /><span class="plugion_cell plugion_exportable">' +
            current_name +
            ': ' +
            current_val +
            '</span>'
    })
    jQuery(value_html).insertAfter(td_elem)
}
function wbk_get_custom_fields(input) {
    var items = input.split(',')
    var result = []
    jQuery.each(items, function (i, val) {
        val = val.trim()
        var title = val.substring(
            val.lastIndexOf('[') + 1,
            val.lastIndexOf(']')
        )
        var id = val.substring(0, val.lastIndexOf('['))
        if (id == '') {
            id = val
            title = val
        }
        result.push([id.trim(), title.trim()])
    })
    return result
}
class WBK_Dashboard {
    constructor() {
        const get_this = () => {
            return this
        }
        get_this().initialize_plugion_fields()
        get_this().initialize_plugion_events()
    }

    initialize_plugion_fields() {
        const get_this = () => {
            return this
        }
        plugion.add_getter('wbk_business_hours', function (element) {
            if (
                element.siblings('.repeater').find('.wbk_bh_data_start')
                    .length == 0
            ) {
                return ''
            }
            var value = element.siblings('.repeater').repeaterVal()
            return JSON.stringify(value)
        })
        plugion.add_validator(
            'wbk_business_hours',
            function (value, required, element) {
                return true
            }
        )
        plugion.add_getter('wbk_app_custom_data', function (element) {
            var custom_data = []
            element
                .parent()
                .find('.wbk_custom_data_item')
                .each(function () {
                    var id = jQuery(this).attr('data-field-id')
                    var title = jQuery(this).attr('data-title')
                    var val = jQuery(this).val()
                    custom_data.push([id, title, val])
                })
            if (custom_data.length > 0) {
                element.val(JSON.stringify(custom_data))
            }
            return element.val()
        })
        plugion.add_setter('wbk_app_custom_data', function (element, value) {
            element.val(value)
            if (value == '') {
                return
            }

            var custom_data = jQuery.parseJSON(value)
            var parent = jQuery('#appointment_extra').parent()
            jQuery.each(custom_data, function (k, v) {
                var id = v[0].trim()
                var label = v[1].trim()
                var value = v[2].trim()

                value = value.replace('&#039;', "'")

                if (
                    element.parent().find('[data-field-id="' + id + '"]')
                        .length == 0
                ) {
                    var new_custom_field = '<div><div class="label-wb">'
                    new_custom_field +=
                        '<label for="appointment_extra_last_name">' +
                        label +
                        '</label></div>'
                    new_custom_field += '<div class="field-wrapper-wb">'
                    new_custom_field +=
                        '<input value="' +
                        value +
                        '" id="appointment_extra_' +
                        id +
                        '" name="extra" data-title="' +
                        label +
                        '" data-field-id="' +
                        id +
                        '" class="plugion_input plugion_input_text plugion_simple_text_input wbk_custom_data_item" type="text" required="">'
                    new_custom_field += '</div></div>'
                    parent.append(new_custom_field)
                } else {
                    element
                        .parent()
                        .find('[data-field-id="' + id + '"]')
                        .val(value)
                }
            })
        })
        plugion.add_getter('wbk_date_range', function (element) {
            if (
                element.attr('data-start') == '' ||
                element.attr('data-end') == ''
            ) {
                return ''
            }
            return [element.attr('data-start'), element.attr('data-end')]
        })
        plugion.add_setter('wbk_date_range', function (element, value) {
            var datepicker_start = element
                .parent()
                .find('.plugion_input_date_range_start')
                .pickadate('picker')
            if (typeof datepicker_start === 'undefined') {
                var datepicker_start = element
                    .parent()
                    .find('.plugion_input_date_range_start')
                    .pickadate({
                        format: element.attr('data-dateformat'),
                        onSet: function (thingSet) {
                            if (thingSet.select == null) {
                                element
                                    .siblings('.plugion_input_container_small')
                                    .find('.plugion_input_date_range_start')
                                    .siblings('label')
                                    .removeClass('plugion_label_pickadate')
                                element.attr('data-start', '')
                            } else {
                                element
                                    .siblings('.plugion_input_container_small')
                                    .find('.plugion_input_date_range_start')
                                    .siblings('label')
                                    .addClass('plugion_label_pickadate')
                                element.attr(
                                    'data-start',
                                    this.get('select', 'mm/dd/yyyy')
                                )
                            }
                        },
                    })
            }
            var datepicker_end = element
                .parent()
                .find('.plugion_input_date_range_end')
                .pickadate('picker')
            if (typeof datepicker_end === 'undefined') {
                var datepicker_end = element
                    .parent()
                    .find('.plugion_input_date_range_end')
                    .pickadate({
                        format: element.attr('data-dateformat'),
                        onSet: function (thingSet) {
                            if (thingSet.select == null) {
                                element
                                    .siblings('.plugion_input_container_small')
                                    .find('.plugion_input_date_range_end')
                                    .siblings('label')
                                    .removeClass('plugion_label_pickadate')
                                element.attr('data-end', '')
                            } else {
                                element
                                    .siblings('.plugion_input_container_small')
                                    .find('.plugion_input_date_range_end')
                                    .siblings('label')
                                    .addClass('plugion_label_pickadate')
                                element.attr(
                                    'data-end',
                                    this.get('select', 'mm/dd/yyyy')
                                )
                            }
                        },
                    })
            }
            if (value != null) {
                if (value == '') {
                    var date_start = new Date()
                    element
                        .parent()
                        .find('.plugion_input_date_range_start')
                        .pickadate('picker')
                        .set('select', [
                            date_start.getUTCFullYear(),
                            date_start.getUTCMonth(),
                            date_start.getUTCDate(),
                        ])
                    var default_daterange = element.attr('data-rangedefault')
                    if (!plugion.validate_integer(default_daterange)) {
                        default_daterange = 14
                    }
                    var date_end = new Date(
                        date_start.getTime() + 86400000 * default_daterange
                    )
                    element
                        .parent()
                        .find('.plugion_input_date_range_end')
                        .pickadate('picker')
                        .set('select', [
                            date_end.getUTCFullYear(),
                            date_end.getUTCMonth(),
                            date_end.getUTCDate(),
                        ])
                    return
                }

                var start = value[0]
                var date_start = new Date(
                    Date.parse(start.replace(/[-]/g, '/') + ' UTC')
                )
                element
                    .parent()
                    .find('.plugion_input_date_range_start')
                    .pickadate('picker')
                    .set('select', [
                        date_start.getUTCFullYear(),
                        date_start.getUTCMonth(),
                        date_start.getUTCDate(),
                    ])

                var end = value[1]
                var date_end = new Date(
                    Date.parse(end.replace(/[-]/g, '/') + ' UTC')
                )
                element
                    .parent()
                    .find('.plugion_input_date_range_end')
                    .pickadate('picker')
                    .set('select', [
                        date_end.getUTCFullYear(),
                        date_end.getUTCMonth(),
                        date_end.getUTCDate(),
                    ])
            }
        })
        jQuery('#wbk_csv_export').unbind('click')
        jQuery('#wbk_csv_export').on('click', function () {
            const startExport = jQuery('#wbk_start_export')
            jQuery('.plugion_filter_button').trigger('click')
            jQuery('.plugion_filter_title').html(wbk_dashboardl10n.export_csv)
            jQuery('#plugion_filter_apply').remove()
            jQuery('#plugion_filter_apply_close').remove()
            startExport.toggleClass('hidden')
            startExport.unbind('click')
            startExport.on('click', function () {
                var es = false
                var filters = []
                var error_labels = []
                jQuery(this).html(wbk_dashboardl10n.please_wait)

                jQuery('.plugion_filter_input')
                    .not('.nice-select')
                    .each(function () {
                        var value = plugion.get_field_value(jQuery(this))

                        if (value != '' && value != 'plugion_null') {
                            let name = jQuery(this).attr('name')

                            if ('appointment_day' == name) {
                                value = jQuery(this).attr('data-formated-date')
                            }

                            var filter = {
                                name: name,
                                value: value,
                            }
                            filters.push(filter)
                        }
                    })

                if (es) {
                    return
                }
                jQuery('.plugion_input_field_error').removeClass(
                    'plugion_input_field_error'
                )

                var data = {
                    filters: filters,
                }
                jQuery.ajax(plugionl10n.rest_url + 'wbk/v1/csv-export/', {
                    method: 'POST',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('X-WP-Nonce', plugionl10n.nonce)
                    },
                    data: data,
                    statusCode: {
                        200: function (response) {
                            jQuery('#wbk_start_export').html(
                                wbk_dashboardl10n.start_export
                            )
                            jQuery('.plugion_loader_quad').addClass(
                                'plugion_hidden'
                            )
                            location.href = response.url
                        },
                    },
                })
            })
            return
        })
    }

    build_users_fields() {
        if (
            jQuery('#service_users_chosen').length == 0 &&
            jQuery('#calendar_user_id').length == 0
        ) {
            return
        }
        var data = {}
        jQuery('#service_users_chosen > ul').addClass('plugion_loader')
        jQuery('#service_users_chosen').find('input').addClass('plugion_hidden')

        var option_0 = jQuery('#calendar_user_id').html()
        jQuery('#calendar_user_id').html('')
        jQuery('#calendar_user_id').addClass('plugion_loader')
        jQuery('#calendar_user_id').niceSelect('update')

        jQuery.ajax(plugionl10n.rest_url + 'wbk/v1/get-wp-users/', {
            method: 'POST',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', plugionl10n.nonce)
            },
            data: data,
            statusCode: {
                200: function (response) {
                    var options_html = ''
                    jQuery.each(response.none_admin_users, function (i, val) {
                        if (val.free_places != 0) {
                            options_html +=
                                '<option value="' + i + '">' + val + '</option>'
                        }
                    })
                    jQuery('#calendar_user_id').removeClass('plugion_loader')
                    jQuery('#calendar_user_id').html(option_0 + options_html)
                    jQuery('#calendar_user_id').niceSelect('update')

                    jQuery('#service_users_chosen > ul').removeClass(
                        'plugion_loader'
                    )
                    jQuery('#service_users_chosen')
                        .find('input')
                        .removeClass('plugion_hidden')
                    jQuery('#service_users').html(options_html)

                    if (jQuery('#service_users').length > 0) {
                        if (
                            jQuery('#service_users').attr('data-initial-val') !=
                            ''
                        ) {
                            jQuery('#service_users').val(
                                jQuery('#service_users')
                                    .attr('data-initial-val')
                                    .split(',')
                            )
                        }
                        jQuery('#service_users').trigger('chosen:updated')
                    }
                    if (jQuery('#calendar_user_id').length > 0) {
                        if (
                            jQuery('#calendar_user_id').attr(
                                'data-initial-val'
                            ) != ''
                        ) {
                            jQuery('#calendar_user_id').val(
                                jQuery('#calendar_user_id').attr(
                                    'data-initial-val'
                                )
                            )
                            jQuery('#calendar_user_id').niceSelect('update')
                        }
                    }

                    return
                },
                400: function (response) {
                    jQuery('#service_users_chosen > ul').removeClass(
                        'plugion_loader'
                    )
                    jQuery('#service_users_chosen')
                        .find('input')
                        .removeClass('plugion_hidden')
                    jQuery('#calendar_user_id').removeClass('plugion_loader')
                    return
                },
                403: function (response) {
                    jQuery('#service_users_chosen > ul').removeClass(
                        'plugion_loader'
                    )
                    jQuery('#service_users_chosen')
                        .find('input')
                        .removeClass('plugion_hidden')
                    jQuery('#calendar_user_id').removeClass('plugion_loader')
                    return
                },
            },
        })
    }

    build_booking_time_field() {
        if (jQuery('#appointment_time').length == 0) {
            return
        }
        const get_this = () => {
            return this
        }
        var date = jQuery('#appointment_day')
            .siblings("[name='day_submit']")
            .val()
        var service_id = jQuery('#appointment_service_id').val()
        if (date == '' || service_id == 'plugion_null') {
            jQuery('#appointment_time')
                .html(
                    '<option value="plugion_null">' +
                        plugionl10n.no_time +
                        '</option>'
                )
                .niceSelect('update')
            jQuery('#appointment_quantity')
                .html(
                    '<option value="plugion_null">' +
                        plugionl10n.select_option +
                        '</option>'
                )
                .niceSelect('update')
            return
        }

        jQuery('#appointment_time').attr('disabled', true)
        jQuery('#appointment_time option').remove()
        jQuery('#appointment_time').niceSelect('update')

        jQuery('#appointment_time')
            .siblings('.nice-select')
            .addClass('plugion_loader')
        jQuery('#appointment_time').addClass('plugion_loader')

        var current_booking = ''
        if (
            jQuery('#appointment_time').closest(
                '.plugion_property_container_form'
            ).length > 0
        ) {
            current_booking = jQuery('#appointment_time')
                .closest('.plugion_property_container_form')
                .attr('data-id')
        }
        var data = {
            date: date,
            service_id: service_id,
            current_booking: current_booking,
        }
        jQuery.ajax(
            plugionl10n.rest_url + 'wbk/v1/get-available-time-slots-day/',
            {
                method: 'POST',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', plugionl10n.nonce)
                },
                data: data,
                statusCode: {
                    200: function (response) {
                        jQuery('#appointment_time')
                            .siblings('.nice-select')
                            .removeClass('plugion_loader')
                        jQuery('#appointment_time').removeClass(
                            'plugion_loader'
                        )
                        var options_html =
                            ' <option value="plugion_null">' +
                            plugionl10n.select_option +
                            '</option>'
                        let empty = true
                        jQuery.each(response.time_slots, function (i, val) {
                            if (
                                val.free_places != 0 &&
                                val.free_places != null
                            ) {
                                options_html +=
                                    '<option value="' +
                                    val.start +
                                    '" data-min_quantity="' +
                                    val.min_quantity +
                                    '"  data-availablility=' +
                                    val.free_places +
                                    ' >' +
                                    val.formated_time_backend +
                                    ' (' +
                                    val.free_places +
                                    ' available)' +
                                    '</option>'
                                empty = false
                            }
                        })
                        if (empty) {
                            options_html =
                                ' <option value="plugion_null">' +
                                plugionl10n.no_time +
                                '</option>'
                        }
                        jQuery('#appointment_time').html(options_html)
                        jQuery('#appointment_time').attr('disabled', false)
                        if (
                            jQuery('#appointment_time').attr(
                                'data-initial-val'
                            ) != ''
                        ) {
                            jQuery('#appointment_time').val(
                                jQuery('#appointment_time').attr(
                                    'data-initial-val'
                                )
                            )
                        }
                        jQuery('#appointment_time').on('change', function () {
                            var quantity = jQuery(this)
                                .find('option:selected')
                                .attr('data-availablility')
                            var min_quantity = jQuery(this)
                                .find('option:selected')
                                .attr('data-min_quantity')
                            var options_html =
                                '<option value="plugion_null">' +
                                plugionl10n.select_option +
                                '</option>'
                            var i
                            min_quantity = parseInt(min_quantity)
                            quantity = parseInt(quantity)
                            for (i = min_quantity; i <= quantity; i++) {
                                if (i == 1) {
                                    var selected = ' selected '
                                } else {
                                    var selected = ''
                                }

                                options_html +=
                                    '<option ' +
                                    selected +
                                    ' value="' +
                                    i +
                                    '">' +
                                    i +
                                    '</option>'
                            }
                            jQuery('#appointment_quantity').html(options_html)
                            jQuery('#appointment_quantity').niceSelect('update')
                        })
                        jQuery('#appointment_time').niceSelect('update')
                        jQuery('#appointment_time').trigger('change')

                        if (
                            jQuery('#appointment_quantity').attr(
                                'data-initial-val'
                            ) != ''
                        ) {
                            jQuery('#appointment_quantity').val(
                                jQuery('#appointment_quantity').attr(
                                    'data-initial-val'
                                )
                            )
                        }

                        jQuery('#appointment_quantity').niceSelect('update')
                        return
                    },
                    400: function (response) {
                        jQuery('#appointment_time')
                            .siblings('.nice-select')
                            .removeClass('plugion_loader')
                        return
                    },
                    403: function (response) {
                        jQuery('#appointment_time')
                            .siblings('.nice-select')
                            .removeClass('plugion_loader')
                        return
                    },
                },
            }
        )
    }

    initialize_plugion_events() {
        const get_this = () => {
            return this
        }
        jQuery(document).on('plugion_properties_form_initialized', function () {
            // initialize automatic update of step based on duration and interval
            jQuery('#service_duration, #service_interval_between').focusout(
                function () {
                    var duration = parseInt(jQuery('#service_duration').val())
                    var interval = parseInt(
                        jQuery('#service_interval_between').val()
                    )
                    var sum = duration + interval
                    if (Number.isInteger(sum)) {
                        jQuery('#service_step').val(duration + interval)
                    }
                }
            )
            if (
                jQuery('.plugion_property_container_form').attr('data-table') ==
                'wbk_cancelled_appointments'
            ) {
                jQuery('#appointment_name')
                    .parent()
                    .parent()
                    .css('display', 'none')
            }
            jQuery('#coupon_amount_fixed').focusout(function () {
                jQuery('#coupon_amount_percentage').val('0')
            })
            jQuery('#coupon_amount_percentage').focusout(function () {
                if (100 < parseInt(jQuery(this).val())) {
                    jQuery(this).val('100')
                }
                jQuery('#coupon_amount_fixed').val('0')
            })
        })
        jQuery(document).on('plugion_filter_form_initialized', function () {
            jQuery('#wbk_category_list').change(function () {
                if (jQuery(this).val() == 0) {
                    return
                }
                var services = jQuery(this)
                    .find('option:selected')
                    .attr('data-services')

                if (services != 'false') {
                    jQuery('#appointment_service_id').val(
                        jQuery.parseJSON(services)
                    )
                    jQuery('#appointment_service_id').trigger('chosen:updated')
                }
            })
        })

        jQuery(document).on(
            'plugion_after_dependency_initialized',
            function () {
                // initialize loading of available time slots when service or
                // day is updated in the appointment settings
                jQuery('#appointment_service_id, #appointment_day').change(
                    function () {
                        get_this().build_booking_time_field()
                    }
                )
                get_this().build_booking_time_field()
                get_this().build_users_fields()
                if (
                    typeof wbk_dashboardl10n != 'undefined' &&
                    wbk_dashboardl10n.disable_nice_select == 'true'
                ) {
                    jQuery('.plugion_input_select').niceSelect('destroy')
                }
            }
        )
    }

    get_available_time_slots_day(service, day) {}
}

var wbk_dashboard

jQuery(document).on('plugion_initialized', function (event) {
    wbk_dashboard = new WBK_Dashboard()
    jQuery('.table_wbk_appointments').on('draw.dt', function () {
        wbk_hide_default_custom_field()
    })
})
