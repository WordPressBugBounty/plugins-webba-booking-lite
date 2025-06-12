<?php
if (!defined('ABSPATH'))
    exit;
/*
 * This file is part of Webba Booking plugin
 */

$field = $data[0];
$slug = $data[1];
$filter_extra = $field->get_filter_extra();

$titles = [
    'service' => 'Services',
    'status' => 'Status',
];

?>

<li class="cell-3">
    <div class="custom-select-wb">
        <select name="<?php echo esc_attr($slug); ?>" class="bookings-filter-select wbkdata_filter_input">
            <option value="">
                <?php echo esc_html__('All', 'webba-booking-lite'); ?>
            </option>
            <?php foreach ($filter_extra as $key => $status) { ?>
                <option value="<?php echo esc_attr($key); ?>">
                    <?php echo esc_html($status); ?>
                </option>
            <?php } ?>
        </select>
    </div>
</li>