<?php

if (!defined('ABSPATH'))
    exit;

function wbkdata_get_dashboard_conditions($condition)
{
    $start = strtotime("-1 days");
    $end = strtotime("now");
    $condition = " created_on >= $start AND created_on < $end ORDER BY created_on";
    return $condition;
}

remove_action('wbkdata_before_table', 'wbk_wbkdata_before_table');

add_action('wbkdata_before_table', 'wbk_wbkdata_dashboard_before_table', 10, 1);
function wbk_wbkdata_dashboard_before_table($table_name)
{
    if (!is_wbk_table($table_name)) {
        return;
    } ?>
    <div class="custom-table-wrapper-wb <?php echo $table_name; ?>-custom-table-wb" custom-table-wrapper>
        <div class="table-area-wb">
            <div class="block-heading-wb">
                <h2 class="block-title-wb">
                    <?php echo esc_html__('Bookings made in the last 24 hours', 'webba-booking-lite'); ?>
                </h2>
                <div class="right-part-wb">
                    <a href="#" class="past-bookings-link-wb">
                        <?php echo esc_html__('Show past bookings', 'webba-booking-lite'); ?>
                    </a>
                    <button class="button-wb"><span class="text-wb">
                            <?php echo esc_html__('New booking', 'webba-booking-lite'); ?>
                        </span> <span class="plus-icon-wb"></span></button>
                </div>
            </div>

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
                <?php if (wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code()) {
                    if ($table_name == get_option('wbk_db_prefix', '') . 'wbk_appointments') {
                        if (get_option('wbk_csv_delimiter', 'comma') == 'comma') {
                            $delimiter = ',';
                        } else {
                            $delimiter = ';';
                        } ?>


                        <div class="right-part-wb">
                            <div class="export-link-wrapper-wb">
                                <a id="wbk_csv_export" class="export-link-wb" data-delimiter="<?php echo $delimiter; ?>">Export to
                                    CSV files <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/export-arrow.png"
                                        alt="export"></a>
                                <div class="wbkdata_loader wbkdata_loader_quad wbkdata_hidden" style="float:left;"></div>
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
                var wbk_custom_fields = '<?php echo esc_html(get_option('wbk_custom_fields_columns')); ?>';
            </script>
            <?php
}

$price_format = get_option('wbk_payment_price_format', '$#price');
$user = wp_get_current_user();


$current_time = time();
$last_24_hours_booking_ids = WBK_Model_Utils::get_booking_by_date_range($current_time - DAY_IN_SECONDS, $current_time);

if (empty($last_24_hours_booking_ids)) {
    $sub_title = esc_html__('No bookings in the last 24 hours', 'webba-booking-lite');
} else {
    $sub_title = sprintf(esc_html__('You have %s new bookings in the past 24 hours', 'webba-booking-lite'), count($last_24_hours_booking_ids));
}

$date_format = get_option('wbk_date_format_backend', 'm/d/y');

$date_format_js = str_replace('d', 'dd', $date_format);
$date_format_js = str_replace('j', 'd', $date_format_js);
$date_format_js = str_replace('l', 'dddd', $date_format_js);
$date_format_js = str_replace('D', 'ddd', $date_format_js);
$date_format_js = str_replace('m', 'mm', $date_format_js);
$date_format_js = str_replace('n', 'm', $date_format_js);
$date_format_js = str_replace('F', 'mmmm', $date_format_js);
$date_format_js = str_replace('M', 'mmm', $date_format_js);
$date_format_js = str_replace('y', 'yyyy', $date_format_js);
$date_format_js = str_replace('Y', 'yyyy', $date_format_js);
$date_format_js = str_replace('S', '', $date_format_js);
$date_format_js = str_replace('s', '', $date_format_js);

$yesterday = date('F d, Y', strtotime("-1 days"));
$last_30_days = date('F d, Y', strtotime("-31 days"));

$formatted_yesterday = date($date_format, strtotime("-1 days"));
$formatted_last_30_days = date($date_format, strtotime("-31 days"));

$db_prefix = get_option('wbk_db_prefix', '');
$table = $db_prefix . 'wbk_appointments';

?>
        <div class="main-part-wrapper-wb">
            <div class="content-main-wb">
                <div class="dashboard-container">
                    <div class="dashboard-header-wb">
                        <div class="left-part-wb">
                            <div class="block-title-wb">
                                <img
                                    src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/hello-dashboard.png" />
                                <span class="title-text-wb">
                                    <?php printf(esc_html__('Hello %s', 'webba-booking-lite'), esc_html($user->display_name)); ?>
                                </span>
                            </div>
                            <p>
                                <?php echo $sub_title; ?>
                            </p>
                        </div><!-- /.left-part-wb -->
                    </div><!-- /.dashboard-header-wb -->

                    <?php
                    add_filter('wbkdata_get_rows_conditions', 'wbkdata_get_dashboard_conditions');
                    WbkData()->table($table);
                    ?>

                    <div class="bookings-table-area-wb table-area-wb wbk_hidden" data-empty-table>
                        <div class="block-heading-wb">
                            <h2 class="block-title-wb">
                                <?php echo esc_html__('Bookings', 'webba-booking-lite'); ?>
                            </h2>
                        </div><!-- /.block-heading-wb -->
                        <div class="table-empty-content-wb">
                            <div class="empty-image-wb">
                                <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/bookings-empty.png"
                                    alt="bookings empty">
                            </div><!-- /.empty-image-wb -->
                            <div class="text-wb">
                                <?php echo esc_html__("You don't have any bookings for this time period yet", 'webba-booking-lite'); ?>
                            </div>
                        </div>
                    </div><!-- /.categories-table-area-wb -->

                    <div class="dashboard-header-wb dashboard-data-range-part-wb">
                        <div class="field-container-wb">

                            <div class="date-range-select-container">

                                <div class="custom-select-wb">
                                    <input name="appointment_day" data-formated-date=<?php echo esc_attr($formatted_last_30_days); ?>
                                        value="<?php echo esc_attr($formatted_last_30_days); ?>"
                                        data-dateformat="<?php echo esc_attr($date_format_js); ?>"
                                        class="wbkdata_input_date_range_start wbkdata_input_text wbkdata_filter_daterange wbkdata_filter_input"
                                        placeholder="Start date">
                                </div>

                                <div class="custom-select-wb">
                                    <input name="appointment_day" data-formated-date=<?php echo esc_attr($formatted_last_30_days); ?>
                                        value="<?php echo esc_attr($formatted_yesterday); ?>"
                                        data-dateformat="<?php echo esc_attr($date_format_js); ?>"
                                        class="wbkdata_input_date_range_end wbkdata_input_text wbkdata_filter_daterange wbkdata_filter_input"
                                        placeholder="End date">
                                </div>

                            </div><!-- /.date-range-select-wb -->

                        </div><!-- /.field-container-wb -->
                        <div class="field-container-wb">
                            <div class="custom-select-wb" data-date-filter>
                                <select>
                                    <option value="today">
                                        <?php echo esc_html__('Today', 'webba-booking-lite'); ?>
                                    </option>
                                    <option value="l_7">
                                        <?php echo esc_html__('Last 7 days', 'webba-booking-lite'); ?>
                                    </option>
                                    <option value="u_7">
                                        <?php echo esc_html__('Upcoming 7 days', 'webba-booking-lite'); ?>
                                    </option>
                                    <option value="l_30" selected>
                                        <?php echo esc_html__('Last 30 days', 'webba-booking-lite'); ?>
                                    </option>
                                    <option value="u_30">
                                        <?php echo esc_html__('Upcoming 30 days', 'webba-booking-lite'); ?>
                                    </option>
                                    <option value="custom">
                                        <?php echo esc_html__('Custom', 'webba-booking-lite'); ?>
                                    </option>
                                </select>
                            </div><!-- /.custom-select-wb -->
                        </div><!-- /.field-container-wb -->
                    </div>
                    <div class="dasbhoard-blocks-wb">
                        <?php WBK_Renderer::load_template('backend/dashboard_blocks', ["table" => $table]); ?>
                    </div>


                    <div class="intersests-conversion-block-wb">
                        <div class="block-header-wb">
                            <div class="title-wb">
                                <?php esc_html__('Interests/Conversions', 'webba-booking-lite'); ?>
                                <div class="help-popover-wb" data-js="help-popover-wb">
                                    <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                                    <div class="help-popover-box-wb" data-js="help-popover-box-wb">
                                        <?php esc_html__('Interests/Conversions', 'webba-booking-lite'); ?>
                                    </div>
                                </div><!-- /.help-popover-wb -->
                            </div><!-- /.title-wb -->
                            <div class="right-part-wb">
                                <ul class="toggle-switch-wb" toggle-switch>
                                    <li class="active-wb">
                                        <?php esc_html__('Week', 'webba-booking-lite'); ?>
                                    </li>
                                    <li>
                                        <?php esc_html__('Week', 'webba-booking-lite'); ?>
                                    </li>
                                </ul><!-- /.toggle-switch-wb -->
                            </div><!-- /.right-part-wb -->
                        </div><!-- /.block-header-wb -->

                        <div class="graph-wb">
                            <canvas id="dashboard-graph" class="wbk_hidden"
                                data-price-format="<?php echo esc_attr($price_format); ?>"></canvas>
                            <div class="table-empty-content-wb wbk_hidden">
                                <div class="empty-image-wb">
                                    <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/interests-empty.png"
                                        alt="interests empty">
                                </div><!-- /.empty-image-wb -->
                                <div class="text-wb">
                                    <?php echo esc_html__('Booking statistics graph is available for Webba Booking Pro users only', 'webba-booking-lite'); ?>
                                </div>
                            </div>
                        </div><!-- /.graph-wb -->

                    </div><!-- /.intersests-conversion-block-wb -->
                </div>
            </div>
        </div>