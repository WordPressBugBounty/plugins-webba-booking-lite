<?php
if (!defined('ABSPATH')) {
    exit();
}

global $wpdb;

$row = (array) $data[0];
$table_name = $data[1];

$col_span = [
    get_option('wbk_db_prefix', '') . 'wbk_appointments' => 9,
    get_option('wbk_db_prefix', '') . 'wbk_services' => 6,
    get_option('wbk_db_prefix', '') . 'wbk_service_categories' => 6,
];

$table = Plugion()->tables->get_element_at($table_name);
$fields = $table->get_data('fields_to_view');
$filtered_fields = Plugion\Table::filter_fields_by_dependency($fields, $row);

$hidden_values = [];
foreach ($fields as $field_slug => $field) {
    $restricted_fields = [
        'appointment_lang',
        'appointment_end',
        'appointment_attachment',
        'appointment_payment_id',
        'appointment_token',
        'appointment_admin_token',
        'appointment_payment_cancel_token',
        'appointment_expiration_time',
        'appointment_expiration_time',
        'appointment_prev_status',
        'appointment_amount_details',
        'appointment_zoom_meeting_id',
        'appointment_gg_event_id',
        'appointment_time',
        'appointment_day',
        'appointment_time_offset',
    ];

    if ($field->get_in_row() || in_array($field_slug, $restricted_fields)) {
        continue;
    }
    $value = $row[$field->get_name()];

    if (!in_array($field, $filtered_fields)) {
        $value = '';
    }

    if ($value == '') {
        continue;
    }

    if (has_action('plugion_table_cell_' . $field->get_type())) {
        ob_start();
        do_action('plugion_table_cell_' . $field->get_type(), [
            $field,
            $field_slug,
            $value,
            $row,
        ]);
        $hidden_values[] = [
            'title' => $field->get_title(),
            'content' => ob_get_clean(),
        ];
    }
}
?>

<div class="table-options-wb">
    <?php
    if (
        get_option('wbk_db_prefix', '') . 'wbk_cancelled_appointments' !=
        $table_name
    ) { ?>
        <div class="options-item-wb options-item-edit-wb">
            <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/edit-icon.png" alt="edit">
        </div>
    <?php }

    if ($table->current_user_can_duplicate() && $table->get_duplicatable()) { ?>
        <div class="options-item-wb plugion_duplicate_row" data-row-id="<?php echo $row[
            'id'
        ]; ?>" data-table="<?php echo $table_name; ?>">
            <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/duplicate-icon.png" alt="duplicate">
        </div>
    <?php }

    if ($table->current_user_can_delete()) { ?>
        <div class="options-item-wb plugion_delete_row" data-row-id="<?php echo $row[
            'id'
        ]; ?>" data-table="<?php echo $table_name; ?>">
            <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/delete-icon.png" alt="delete">
        </div>
        <button class="delete-confirm-wb single-delete-confirm-wb" data-table="wp_wbk_appointments" type="button">
            <?php echo esc_html(__('Yes, delete it', 'webba-booking-lite')); ?>
        </button>
    <?php }

    if (array_key_exists($table_name, $col_span)) { ?>
        <div class="options-item-wb more-row-wb hidden_details_row">
            <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/more-icon.png" alt="more">
        </div>

        <div class="hidden-details-wb">
            <table>
                <tr hidden-details-row>
                    <td colspan="<?php echo $col_span[$table_name] ?? 3; ?>">
                        <table class="hidden-details-table-wb" style="width: 100%;">
                            <tbody>
                                <tr>

                                    <td>ID:
                                        <b>
                                            <?php echo $row['id']; ?>
                                        </b>
                                    </td>
                                    <?php
                                    date_default_timezone_set(
                                        get_option('wbk_timezone', 'UTC')
                                    );
                                    foreach ($hidden_values as $value) {
                                        if (
                                            get_option('wbk_db_prefix', '') .
                                            'wbk_appointments' ==
                                            $table_name
                                        ) { ?>
                                            <td>
                                                <?php echo $value[
                                                    'title'
                                                ]; ?>: <b>
                                                    <?php echo $value[
                                                        'content'
                                                    ]; ?>
                                                </b>
                                            </td>
                                        <?php } elseif (
                                            !empty($value['content']) &&
                                            !in_array($value['title'], [
                                                __('Business hours', 'webba-booking-lite'),
                                            ])
                                        ) { ?>
                                            <td>
                                                <?php echo $value[
                                                    'title'
                                                ]; ?>: <b>
                                                    <?php echo $value[
                                                        'content'
                                                    ]; ?>
                                                </b>
                                            </td>
                                        <?php }
                                    }
                                    ?>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    <?php }
    ?>
</div>