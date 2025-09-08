<?php
// check if accessed directly
if (!defined('ABSPATH')) {
    exit();
}
if (isset($_GET['schedule-tools']) && $_GET['schedule-tools'] == 'true') {
    WBK_Renderer::load_template('backend/backend_page_v5', [], true);
    return;
}

date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
?>

<div class="wrap">
    <?php
    $html = '<div class="wbk-schedule-row">';
    $html .=
        '<p class="wbk-section-title">' .
        esc_html(__('Click to open schedule tools:', 'webba-booking-lite')) .
        '</p>';
    $html .=
        '<a href="' .
        get_admin_url() .
        'admin.php?page=wbk-schedule&schedule-tools=true">' .
        __('Schedule tools', 'webba-booking-lite') .
        '</a>';
    $html .= '</div>';

    $html .= '<div class="wbk-schedule-row">';
    $select_options = '';
    $arr_ids = WBK_Model_Utils::get_service_ids();
    if (count($arr_ids) < 1) {
        $html .= esc_html(
            __('Create at least one service. ', 'webba-booking-lite')
        );
    } else {
        $html .=
            '<p class="wbk-section-title">' .
            esc_html(
                __(
                    'Click to display the service schedule:',
                    'webba-booking-lite'
                )
            ) .
            '</p>';
        foreach ($arr_ids as $id) {
            if (!current_user_can('manage_options')) {
                if (!WBK_Validator::check_access_to_service($id)) {
                    continue;
                }
            }
            $service = new WBK_Service($id);
            $service_label = $service->get_name();

            $html .=
                '<a class="button ml5" id="load_schedule_' .
                esc_attr($id) .
                '" >' .
                esc_html($service_label) .
                '</a>';
            $select_options .=
                '<option value="' .
                esc_attr($id) .
                '">' .
                esc_html($service_label) .
                '</option>';
        }
    }
    $html .= '</div>';

//echo $html;
?>
    <div id="days_container">
    </div>
    <?php do_action('wbk_backend_schedule_days_container'); ?>
    <div id="control_container">
    </div>
    <a class="button-wbkb" style="float: right; margin-right: 20px;display: block; clear: both;"
        href="<?php echo get_admin_url() .
            'admin.php?page=wbk-schedule&tools=true'; ?>"
        data-name="sidebar-schedule-tools" data-js="open-sidebar-wb">
        <?php echo esc_html__('Schedule Tools', 'webba-booking-lite'); ?>
    </a>

    <div class="schedules-calendar-block-wb">
        <div class="schedules-calendar-services-wb">
            <div class="label-wb">
                <?php echo esc_html__(
                    'Choose services',
                    'webba-booking-lite'
                ); ?>
            </div>
            <div class="fields-part-wb">
                <div class="custom-multiple-select-wb">
                    <select data-placeholder="<?php echo esc_html__(
                        'Choose a service...',
                        'webba-booking-lite'
                    ); ?>"
                        class="schedule-chosen-select" multiple>
                        <option value=""></option>
                        <?php echo $select_options; ?>
                    </select>
                </div><!-- /.custom-select-wb -->
                <div class="btn-link"><a class="wbk-deselect-all">
                        <?php esc_html__(
                            'Deselect all services',
                            'webba-booking-lite'
                        ); ?>
                    </a></div>
            </div><!-- /.fields-part-wb -->
        </div>

        <div class="schedules-calendar-wrapper-wb table-area-wb">
            <div id="schedules-calendar-wb"></div>
        </div>
    </div>
</div>
<?php date_default_timezone_set('UTC');
?>
