<?php
if (!defined('ABSPATH')) {
    exit();
}

add_filter('plugion_rows_value', 'wbk_plugion_rows_value', 10, 2);
function wbk_plugion_rows_value($input, $table_name)
{
    if (
        $table_name == get_option('wbk_db_prefix', '') . 'wbk_appointments' ||
        $table_name ==
        get_option('wbk_db_prefix', '') . 'wbk_cancelled_appointments'
    ) {
        foreach ($input as $key => $row) {
            if (!is_object($row)) {
                continue;
            }
            date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
            $row->day = date('Y-m-d', $row->day);
            date_default_timezone_set('UTC');
        }
    }
    return $input;
}

add_filter('plugion_template_file', 'wbk_plugion_template_file', 10, 3);
function wbk_plugion_template_file($file_name, $template, $data)
{
    switch ($template) {
        case 'properties_add_form':
            return wbk_plugion_template('properties_add_form');
        case 'properties_update_form':
            return wbk_plugion_template('empty_template');
        case 'table':
            return wbk_plugion_template('table');
        case 'table_row':
            return wbk_plugion_template('table_row');
        case 'input_textarea':
            return wbk_plugion_template('input_textarea');
        case 'input_text':
            return wbk_plugion_template('input_text');
        case 'input_select':
            return wbk_plugion_template('input_select');
        case 'input_date':
            return wbk_plugion_template('input_date');
        case 'input_date_range':
            return wbk_plugion_template('input_date_range');
        case 'input_radio':
            return wbk_plugion_template('input_radio');
    }

    return $file_name;
}

function wbk_plugion_template($file_name)
{
    return WP_WEBBA_BOOKING__PLUGIN_DIR .
        DIRECTORY_SEPARATOR .
        'templates' .
        DIRECTORY_SEPARATOR .
        'plugion' .
        DIRECTORY_SEPARATOR .
        $file_name .
        '.php';
}

add_action('plugion_before_table', 'wbk_plugion_before_table', 10, 1);
function wbk_plugion_before_table($table_name)
{
    $help_url = '';
    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_gg_calendars') {
        $help_url =
            '<a href="https://webba-booking.com/documentation/google-calendar/" rel="noopener" target="_blank"  class="wbk_question_sign" ></a>';
    }
    if (!is_wbk_table($table_name)) {
        return;
    }
    ?>

    <div class="custom-table-wrapper-wb <?php echo $table_name; ?>-custom-table-wb" custom-table-wrapper>
        <div class="table-area-wb">
            <div class="block-heading-wb">
                <h2 class="block-title-wb">
                    <?php echo Plugion()
                        ->tables->get_element_at($table_name)
                        ->get_multiple_item_name() . $help_url; ?>
                </h2>
                <div class="right-part-wb">
                    <fieldset class="search-field-wb">
                        <input type="text" placeholder="<?php echo esc_attr(__('Search', 'webba-booking-lite')) ?>"
                            class="input-search-wb" data-name="<?php echo $table_name; ?>">
                        <button type="button" class="search-submit-wb">
                            <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/search-icon.png"
                                alt="search">
                        </button>
                    </fieldset>
                    <?php if (
                        $table_name !=
                        get_option('wbk_db_prefix', '') .
                        'wbk_cancelled_appointments'
                    ) { ?>
                        <button class="button-wbkb plugion_table_add_button" data-name="<?php echo $table_name; ?>"
                            data-js="open-sidebar-wb">
                            <span class="text-wb">
                                <?php echo __('Add', 'webba-booking-lite') . ' ' . strtolower(
                                    Plugion()
                                        ->tables->get_element_at($table_name)
                                        ->get_single_item_name()
                                ); ?>
                            </span>
                            <span class="plus-icon-wb"></span>
                        </button>
                    <?php } ?>
                </div>
            </div>

            <?php if (
                get_option('wbk_db_prefix', '') . 'wbk_appointments' ==
                $table_name
            ) { ?>
                <div class="bookings-filter-full-wb">
                    <ul class="filter-list-wb">
                        <li class="cell-2">
                            <div class="custom-select-wb">
                                <select name="appointment_service_categories"
                                    class="bookings-filter-select plugion_filter_input">
                                    <option value="">
                                        <?php echo esc_html__('All Categories', 'webba-booking-lite') ?>
                                    </option>
                                    <?php foreach (WBK_Model_Utils::get_service_categories() as $key => $service_category) { ?>
                                        <option value="<?php echo esc_attr(
                                            $key
                                        ); ?>">
                                            <?php echo esc_html(
                                                $service_category
                                            ); ?>
                                        </option>
                                    <?php } ?>
                                </select>
                            </div>
                        </li>

                        <?php foreach (Plugion()->tables->get_element_at($table_name)->get_data('filters') as $field_slug => $field) {
                            if ($field->get_filter_type() == '') {
                                continue;
                            }
                            if (
                                !has_action(
                                    'plugion_filter_' .
                                    $field->get_filter_type()
                                )
                            ) {
                                echo '<p>No action found for the <strong>' .
                                    'plugion_filter_' .
                                    $field->get_filter_type() .
                                    '</strong></p>';
                            }
                            do_action(
                                'plugion_filter_' . $field->get_filter_type(),
                                [$field, $field_slug]
                            );
                        } ?>
                    </ul>
                </div>
            <?php } ?>

            <div class="table-control-row-wb">
                <div class="select-rows-area-wb" select-rows-area="">
                    <div class="select-rows-block-wb" select-rows-block="">
                        <span class="clickable-area-wb" clickable-area=""></span>
                        <input type="checkbox" class="custom-checkbox-wb" select-rows-checkbox="">
                        <ul class="dropdown-wb" block-dropdown="">
                            <li data-js="select-all">All</li>
                        </ul>
                        <div class="mass-delete-wb" data-table="<?php echo $table_name; ?>" mass-delete-button="">
                            <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/delete-icon-solid.png"
                                alt="delete">
                        </div>
                        <button class="delete-confirm-wb mass-delete-confirm-wb" data-table="<?php echo $table_name; ?>"
                            type="button">Yes, delete it.</button>
                    </div>
                    <div class="delete-selected-rows-wb">
                        <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/delete-icon-solid.png"
                            alt="delete">
                    </div>
                </div>
                <?php if (
                    wbk_fs()->is__premium_only() &&
                    wbk_fs()->can_use_premium_code()
                ) {
                    if (
                        $table_name ==
                        get_option('wbk_db_prefix', '') . 'wbk_appointments'
                    ) {
                        if (
                            get_option('wbk_csv_delimiter', 'comma') == 'comma'
                        ) {
                            $delimiter = ',';
                        } else {
                            $delimiter = ';';
                        } ?>


                        <div class="right-part-wb">
                            <div class="export-link-wrapper-wb">
                                <a id="wbk_csv_export" class="export-link-wb" data-delimiter="<?php echo $delimiter; ?>">Export to
                                    CSV files <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/export-arrow.png"
                                        alt="export"></a>
                                <div class="plugion_loader plugion_loader_quad plugion_hidden" style="float:left;"></div>
                                <button id="wbk_start_export" class="hidden" type="button">Start export</button>
                            </div>
                        </div>

                        <?php
                    }
                } ?>
            </div>
            <?
            if ($table_name != get_option('wbk_db_prefix', '') . 'wbk_appointments' && $table_name != get_option('wbk_db_prefix', '') . 'wbk_cancelled_appointments') {
                return;
            }
            ?>
            <script>
                var wbk_custom_fields = '<?php echo esc_html(
                    get_option('wbk_custom_fields_columns')
                ); ?>';
            </script>
            <?php
}

add_filter('plugion_table_header', 'wbk_plugion_table_header', 10, 2);
function wbk_plugion_table_header($table_header, $slug)
{
    $table_header = '<thead><tr class="plugion_table_row_item">';

    $table_header .=
        '<th class="cell-1"><input type="checkbox" class="custom-checkbox-wb" checkbox-select-all=""></th>';
    if (get_option('wbk_db_prefix', '') . 'wbk_appointments' == $slug) {
        $table_header .= '<th>ID</th>' .
            '<th class="plugion_cell plugion_exportable cell-2" id="title_appointment_datetime" data-sorttype="">' .
            esc_html(__('Date/Time', 'webba-booking-lite')) .
            '</th>';
    }
    $i = 3;
    foreach (Plugion()->tables->get_element_at($slug)->get_data('fields_to_view') as $field_slug => $field) {
        if (!$field->get_in_row()) {
            continue;
        }
        $table_header .=
            '<th class="plugion_cell plugion_exportable cell-' .
            $i .
            ' " id="title_' .
            esc_attr($field_slug) .
            '" data-sorttype="' .
            esc_attr($field->get_sort_type()) .
            '"  >' .
            esc_html($field->get_title()) .
            '</th>';
        $i++;
    }

    $table_header .= '<th></th></tr></thead>';
    return $table_header;
}

add_filter('plugion_table_row', 'wbk_plugion_table_row', 10, 3);
function wbk_plugion_table_row($input, $row, $table)
{
    if (!is_wbk_table($table)) {
        return $input;
    }

    $extra = '';
    if (get_option('wbk_db_prefix', '') . 'wbk_appointments' == $table) {
        $extra = '<td>' . $row->id . '</td>';
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $extra .=
            '<td data-order="' .
            esc_attr($row->time) .
            '">' .
            date(get_option('wbk_date_format_backend', 'm/d/y'), $row->time) .
            '<br />' .
            date(get_option('time_format', 'g:i a'), $row->time) .
            '</td>';
    }

    $input = str_replace('<tr', '<tr has-hidden-details ', $input);
    $input = str_replace(
        'data-category="row_opening">',
        'data-category="row_opening"><td data-order="' .
        $row->id .
        '"><input type="checkbox" class="custom-checkbox-wb" checkbox-select-row=""></td>' .
        $extra,
        $input
    );
    $data = [$row, $table];

    $row_controls = WBK_Renderer::load_template(
        'plugion/row_controls',
        $data,
        false
    );
    $input = str_replace(
        '</tr>',
        '<td class="row-controls-wb">' . $row_controls . '</td></tr>',
        $input
    );

    return $input;
}

add_filter('plugion_table_cell_value', 'wbk_plugion_table_cell_value', 10, 2);
function wbk_plugion_table_cell_value($input, $data)
{
    $title_mobile =
        '<div class="title-mobile-wb">' . $data[0]->get_title() . '</div>';
    if ('appointment_status' == $data[1]) {
        $input =
            '<div class="status-select-wb" status-select="" data-value="' .
            $data[2] .
            '">
                    <select class="plugion_property_input appointments_status_change" data-getter="select" data-validation="select" data-setter="select" data-default="' .
            $data[2] .
            '">';

        foreach (WBK_Model_Utils::get_booking_status_list() as $key => $status) {
            $input .=
                '<option value="' .
                esc_attr($key) .
                '">' .
                esc_html($status) .
                '</option>';
        }
        $input .= '</select></div>';
    } elseif ('pricing_rule_priority' == $data[1]) {
        $input =
            '<div class="priority-wb ' .
            $input .
            '-wb">' .
            ucfirst($input) .
            '</div>';
    } elseif ('service_name' == $data[1] || 'category_name' == $data[1]) {
        $input .= ' <span class="smal_id_wbk">(' . $data[3]['id'] . ')</span>';
    }
    if ('calendar_id' == $data[1]) {
        if (strlen($input) > 30) {
            $input = substr($input, 0, 30 - strlen($input)) . ' ...';
        }
    }
    return $input;
}

add_action('plugion_table_cell_text', 'wbk_plugion_table_cell_text');
function wbk_plugion_table_cell_text($data)
{
}

add_filter(
    'plugion_formated_row_value',
    'wbk_plugion_formated_row_value',
    10,
    2
);
function wbk_plugion_formated_row_value($input, $data)
{
    $slug = $data[1];
    $row = $data[3];
    if ($slug == 'appointment_day' || $slug == 'appointment_time') {
        return ['display' => $input, '@data-order' => $row['time']];
    }

    if ('appointment_status' == $slug) {
        $title_mobile =
            '<div class="title-mobile-wb">' . $data[0]->get_title() . '</div>';
        $input =
            '<div class="status-select-wb" status-select="" data-value="' .
            $data[2] .
            '">
                    <select class="plugion_property_input appointments_status_change" data-getter="select" data-validation="select" data-setter="select" data-default="' .
            $data[2] .
            '">';

        foreach (WBK_Model_Utils::get_booking_status_list() as $key => $status) {
            $input .=
                '<option value="' .
                esc_attr($key) .
                '">' .
                esc_html($status) .
                '</option>';
        }
        $input .= '</select></div>';

        return $title_mobile . $input;
    } elseif ('pricing_rule_priority' == $slug) {
        $input =
            '<div class="priority-wb ' .
            $input .
            '-wb">' .
            ucfirst($input) .
            '</div>';
    }


    return $input;
}

add_filter(
    'plugion_formated_row_values',
    'wbk_plugion_formated_row_values',
    10,
    3
);
function wbk_plugion_formated_row_values($input, $row, $table)
{
    $data = [$row, $table];
    $input[] = WBK_Renderer::load_template(
        'plugion/row_controls',
        $data,
        false
    );

    if (isset($row->extra)) {
        $result = [];
        $custom_data = $row->extra;
        foreach ($input as $item) {
            $result[] = $item;
            if (
                !is_array($item) &&
                strpos($item, 'wbk_app_custom_data_value') !== false
            ) {
                $ids = get_option('wbk_custom_fields_columns', '');
                if ($ids != '') {
                    $ids = explode(',', $ids);
                    foreach ($ids as $id) {
                        $id = explode('[', $id);
                        $id = $id[0];
                        $custom_value = WBK_Model_Utils::extract_custom_field_value(
                            $custom_data,
                            $id
                        );
                        if ($custom_value === null) {
                            $custom_value = '';
                        }
                        $result[] = $custom_value;
                    }
                }
            }
        }
        $input = $result;
    }

    return $input;
}

add_filter('plugion_cell_content', 'wbk_plugion_cell_content', 10, 2);
function wbk_plugion_cell_content($input, $data)
{
    if ($data[1] == 'appointment_quantity') {
        return $data[2];
    }
    if ($data[1] == 'appointment_created_on') {
        $format = get_option('date_format');
        date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
        $date = wp_date(
            $format,
            $data[2],
            new DateTimeZone(date_default_timezone_get())
        );
        $format = get_option('time_format');
        $time = wp_date(
            $format,
            $data[2],
            new DateTimeZone(date_default_timezone_get())
        );
        date_default_timezone_set('UTC');
        return $date . ' ' . $time;
    }
    if ($data[1] == 'appointment_coupon') {
        if ($data[2] != '') {
            $coupon = new WBK_Coupon($data[2]);
            return $coupon->get_name();
        }
    }
    if ($data[1] == 'appointment_service_category') {
        $category_name = __('n/a', 'webba-booking-lite');
        if ($data[2] != '' && $data[2] != '0') {
            $category = new WBK_Service_Category($data[2]);
            if ($category->is_loaded()) {
                $category_name = $category->get_name();
            }

        }
        return $category_name;
    }
    if ($data[1] == 'appointment_email') {
        $html = '<span class="wbk_resend_container">';
        $html .= '<span>' . esc_html__('(Re)send Email notifications:', 'webba-booking-lite') . '</span>';
        $html .= '<select class="wbk_resend_email">';
        $html .= '<option value="confirmation">' . esc_html__('On booking', 'webba-booking-lite') . '</option>';
        $html .= '<option value="payment">' . esc_html__('On payment', 'webba-booking-lite') . '</option>';
        $html .= '<option value="approval">' . esc_html__('On approval', 'webba-booking-lite') . '</option>';
        $html .= '<option value="arrival">' . esc_html__('On arrival', 'webba-booking-lite') . '</option>';
        $html .= '</select>';
        $html .= '<button type="button" data-action-text="' . esc_attr(__('sending...', 'webba-booking-lite')) . '" class="button-wbkb button-wbkb-mini resend_email_btn">' . esc_html__('Send', 'webba-booking-lite') . '</button>';
        $html .= '<span class="wbk_email_resend_result"></span">';
        $input .= $html;

    }
    if ($data[1] == 'appointment_name') {
        $template = get_option('wbk_customer_name_output', '#name');
        $result = str_replace('#name', $data[2], $template);
        $row = $data[3];
        $appointment = new WBK_Appointment_deprecated();
        if (!$appointment->setId($row['id'])) {
            return $result;
        }
        if (!$appointment->load()) {
            return $result;
        }
        $service = new WBK_Service_deprecated();
        if (!$service->setId($appointment->getService())) {
            return $result;
        }
        if (!$service->load()) {
            return $result;
        }

        $result = WBK_Db_Utils::message_placeholder_processing(
            $result,
            $appointment,
            $service
        );

        // remove not used custom field placeholders
        $field_parts = explode('#field_', $result);
        foreach ($field_parts as $part) {
            $to_replace = '#field_' . $part;
            $result = str_replace($to_replace, '', $result);
        }
        return $result;
    }
    if ($data[1] == 'appointment_moment_price') {
        $row = $data[3];

        $payment_details = WBK_Price_Processor::get_payment_items_post_booked(array($row['id']));
        $total = $payment_details['total'];

        $total = number_format(
            $total,
            get_option('wbk_price_fractional', '2'),
            get_option('wbk_price_separator', '.'),
            ''
        );
        return $total;
    }
    return $input;
}
add_filter(
    'plugion_property_field_validation_text',
    'wbk_plugion_property_field_validation_text',
    20,
    4
);
function wbk_plugion_property_field_validation_text(
    $input,
    $value,
    $slug,
    $field
) {
    if ($slug == 'service_service_fee' || $slug == 'service_price') {
        if ($value == '') {
            return [true, ''];
        }
    } elseif ('pricing_rule_amount' == $slug) {
        foreach ($_REQUEST['fields'] as $request_filed) {
            if (
                'fixed_percent' == $request_filed['name'] &&
                'percent' == $request_filed['value'] &&
                100 < $value
            ) {
                return [false, 'Amount field value cannot exceed 100.'];
            }
        }
    } elseif ('coupon_amount_percentage' == $slug && 100 < $value) {
        return [false, 'Amount field value cannot exceed 100.'];
    }
    return $input;
}

add_filter(
    'plugion_property_field_validation_select',
    'wbk_plugion_property_field_validation_select',
    20,
    4
);
function wbk_plugion_property_field_validation_select(
    $input,
    $value,
    $slug,
    $field
) {
    if ($slug == 'appointment_quantity') {
        if (Plugion\Validator::check_integer($value, 1, 2147483647)) {
            return [true, $value];
        } else {
            return [
                false,
                sprintf(
                    plugion_translate_string('Value of %s is not acceptable'),
                    $field->get_title()
                ),
            ];
        }
    }
    if ($slug == 'appointment_service_id') {
        $services = WBK_Model_Utils::get_service_ids(true);
        if (!in_array($value, $services)) {
            return [
                false,
                sprintf(
                    plugion_translate_string('Value of %s is not acceptable'),
                    $field->get_title()
                ),
            ];
        }
    }
    if ($slug == 'service_users' || $slug == 'calendar_user_id') {
        if (is_array($value)) {
            foreach ($value as $item) {
                if (!is_numeric($item)) {
                    return [
                        false,
                        sprintf(
                            plugion_translate_string(
                                'Value of %s is not acceptable'
                            ),
                            $field->get_title()
                        ),
                    ];
                }
            }
        }

        if ($slug == 'service_users') {
            return [true, json_encode($value)];
        } elseif ($slug == 'calendar_user_id') {
            return [true, $value];
        }
    }
    return $input;
}

add_action(
    'plugion_filter_wbk_date_range',
    'native_plugion_filter_wbk_date_range'
);
function native_plugion_filter_wbk_date_range($data)
{
    echo WBK_Renderer::load_template('plugion/filter_wbk_date_range', $data);
}

add_action('plugion_on_after_row_add', 'wbk_plugion_on_after_row_add', 10, 3);
function wbk_plugion_on_after_row_add(
    $table_name,
    $table_name_not_filtered,
    $row
) {
    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_appointments') {
        $bf = new WBK_Booking_Factory();
        $bf->post_production([$row->id], 'on_manual_booking');
        WBK_Mixpanel::track_event("booking created", ['booking_type' => 'backend']);
    }
    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_services') {
        WBK_Mixpanel::track_event("service created", []);
    }
    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_service_categories') {
        WBK_Mixpanel::track_event("service category created", []);
    }
    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_pricing_rules') {
        WBK_Mixpanel::track_event("pricing rule created", []);
    }
}

add_action(
    'plugion_on_before_row_delete',
    'wbk_plugion_on_before_row_delete',
    10,
    3
);
function wbk_plugion_on_before_row_delete(
    $table_name,
    $table_name_not_filtered,
    $row
) {
    global $wpdb;
    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_appointments') {
        $bf = new WBK_Booking_Factory();
        $bf->destroy($row->id, __('Service administrator (dashboard)', 'webba-booking-lite'));
    }
    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_services') {
        $wpdb->query(
            $wpdb->prepare(
                'DELETE from ' .
                get_option('wbk_db_prefix', '') .
                'wbk_appointments where service_id = %d',
                $row->id
            )
        );
    }
}

add_action(
    'plugion_on_after_row_update',
    'wbk_plugion_on_after_row_update',
    10,
    3
);
function wbk_plugion_on_after_row_update(
    $table_name,
    $table_name_not_filtered,
    $row
) {
    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_appointments') {
        $bf = new WBK_Booking_Factory();

        $bf->update($row->id);
    }
}

add_filter('plugion_field_can_view', 'wbk_plugion_field_can_view', 10, 3);
function wbk_plugion_field_can_view($input, $field_name, $table_name)
{
    if (
        $table_name == get_option('wbk_db_prefix', '') . 'wbk_appointments' ||
        $table_name ==
        get_option('wbk_db_prefix', '') . 'wbk_cancelled_appointments'
    ) {
        if (WBK_User_Utils::check_access_to_service()) {
            $user = wp_get_current_user();
            $roles = (array) $user->roles;
            $input = array_unique(array_merge($input, $roles));
        }
    }
    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_services') {
        if (WBK_User_Utils::check_access_to_service(true)) {
            $user = wp_get_current_user();
            $roles = (array) $user->roles;
            $input = array_unique(array_merge($input, $roles));
        }
    }
    return $input;
}

add_filter('plugion_field_can_update', 'wbk_plugion_field_can_update', 10, 3);
function wbk_plugion_field_can_update($input, $field_name, $table_name)
{
    if (
        $table_name == get_option('wbk_db_prefix', '') . 'wbk_appointments' ||
        $table_name ==
        get_option('wbk_db_prefix', '') . 'wbk_cancelled_appointments'
    ) {
        if (WBK_User_Utils::check_access_to_service()) {
            $user = wp_get_current_user();
            $roles = (array) $user->roles;
            $input = array_unique(array_merge($input, $roles));
        }
    }
    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_services') {
        if (WBK_User_Utils::check_access_to_service(true)) {
            $user = wp_get_current_user();
            $roles = (array) $user->roles;
            $input = array_unique(array_merge($input, $roles));
        }
    }
    return $input;
}

add_filter('plugion_field_can_add', 'wbk_plugion_field_can_add', 10, 3);
function wbk_plugion_field_can_add($input, $field_name, $table_name)
{
    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_appointments') {
        if (WBK_User_Utils::check_access_to_service()) {
            $user = wp_get_current_user();
            $roles = (array) $user->roles;
            $input = array_unique(array_merge($input, $roles));
        }
    }
    if (
        $table_name ==
        get_option('wbk_db_prefix', '') . 'wbk_cancelled_appointments'
    ) {
        return [];
    }
    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_services') {
        if (WBK_User_Utils::check_access_to_service(true)) {
            $user = wp_get_current_user();
            $roles = (array) $user->roles;
            $input = array_unique(array_merge($input, $roles));
        }
    }
    return $input;
}

add_filter(
    'plugion_get_rows_conditions',
    'wbk_plugion_get_rows_conditions',
    10,
    2
);
function wbk_plugion_get_rows_conditions($input, $table_name)
{
    if (
        $table_name == get_option('wbk_db_prefix', '') . 'wbk_appointments' ||
        $table_name ==
        get_option('wbk_db_prefix', '') . 'wbk_cancelled_appointments'
    ) {
        $user = wp_get_current_user();
        if (
            in_array('administrator', $user->roles, true) ||
            (is_multisite() && !is_super_admin())
        ) {
            return $input;
        } else {
            $services = WBK_Model_Utils::get_service_ids(true);
            $condition = ' AND service_id in (' . implode(',', $services) . ')';
            $input .= $condition;
        }
    }
    if (
        $table_name == get_option('wbk_db_prefix', '') . 'wbk_services'
    ) {
        $user = wp_get_current_user();
        if (
            in_array('administrator', $user->roles, true) ||
            (is_multisite() && !is_super_admin())
        ) {
            return $input;
        } else {
            $services = WBK_Model_Utils::get_service_ids(true, true);
            $condition = ' id in (' . implode(',', $services) . ')';
            $input .= $condition;
        }
    }
    return $input;
}

add_filter(
    'plugion_table_column_wbk_date_ordering',
    'wbk_plugion_table_column_wbk_date_ordering',
    10,
    2
);
function wbk_plugion_table_column_wbk_date_ordering($input, $data)
{
    $row = $data[3];
    return $row['time'];
}

add_filter(
    'plugion_table_column_wbk_time_ordering',
    'wbk_plugion_table_column_wbk_time_ordering',
    10,
    2
);
function wbk_plugion_table_column_wbk_time_ordering($input, $data)
{
    return $data[2];
}

add_filter('plugion_row_can_delete', 'wbk_plugion_row_can_delete', 10, 3);
function wbk_plugion_row_can_delete($input, $row, $table_name)
{
    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_appointments') {
        $user = wp_get_current_user();
        if (current_user_can('manage_options')) {
            return true;
        } else {
            if (is_null($row)) {
                if (WBK_User_Utils::check_access_to_service()) {
                    return true;
                }
            } else {
                $services = WBK_Model_Utils::get_service_ids(true);
                if (in_array($row->service_id, $services)) {
                    return true;
                } else {
                    return false;
                }
            }
        }
        return false;
    }
    return $input;
}
add_action(
    'plugion_filter_multi_select',
    'wbk_plugion_filter_multi_select_render'
);
function wbk_plugion_filter_multi_select_render($data)
{
    if ($data[1] == 'appointment_service_id') {
        echo WBK_Renderer::load_template('plugion/category_list', $data);
    }
}

add_action('plugion_after_table', 'wbk_plugion_after_table');
function is_wbk_table($table_name)
{
    $webba_tables = false;
    if (
        $table_name == get_option('wbk_db_prefix', '') . 'wbk_appointments' ||
        $table_name ==
        get_option('wbk_db_prefix', '') . 'wbk_cancelled_appointments' ||
        $table_name == get_option('wbk_db_prefix', '') . 'wbk_services' ||
        $table_name == get_option('wbk_db_prefix', '') . 'wbk_gg_calendars' ||
        $table_name ==
        get_option('wbk_db_prefix', '') . 'wbk_email_templates' ||
        $table_name == get_option('wbk_db_prefix', '') . 'wbk_coupons' ||
        $table_name ==
        get_option('wbk_db_prefix', '') . 'wbk_service_categories' ||
        $table_name == get_option('wbk_db_prefix', '') . 'wbk_pricing_rules'
    ) {
        $webba_tables = true;
    }
    return $webba_tables;
}

function wbk_plugion_after_table($table_name)
{
    if (!is_wbk_table($table_name)) {
        return;
    }
    echo '</div></div>';

    $db_prefix = get_option('wbk_db_prefix', '');

    if ($db_prefix . 'wbk_services' == $table_name) {
        Plugion()->table($db_prefix . 'wbk_service_categories');
    }
}

?>