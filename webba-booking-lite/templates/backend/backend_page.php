<?php
if (!defined('ABSPATH')) {
    exit;
}
$container_extra_class = '';
if (isset($_GET['wbk-activation'])) {
    $container_extra_class = ' mail-block-wb-wizard ';
}
if (isset($_GET['test'])) {
    wbk_daily();
}
WBK_Mixpanel::update_configuration(true);

?>

<div class="main-curtain-wb" data-js="main-curtain-wb"></div>
<meta name="format-detection" content="telephone=no">
<div class="main-block-wb <?php echo $container_extra_class; ?>">
    <?php
    global $plugin_page;
    $db_prefix = get_option('wbk_db_prefix', '');
    switch ($plugin_page) {
        case 'wbk-services':
            WBK_Renderer::load_template('backend/react_app', [], true);
            break;
        case 'wbk-service-categories':
            WBK_Renderer::load_template('backend/react_app', [], true);
            break;
        case 'wbk-email-templates':
            WBK_Renderer::load_template('backend/react_app', [], true);
            break;
        case 'wbk-appointments':
            WBK_Renderer::load_template('backend/react_app', [], true);
            break;
        case 'wbk-calendar':
            WBK_Renderer::load_template('backend/react_app', [], true);
            break;
        case 'wbk-gg-calendars':
            if (version_compare(PHP_VERSION, '5.4.0') >= 0) {
                if (isset($_GET['clid']) && is_numeric($_GET['clid'])) {
                    if (WBK_User_Utils::check_access_to_gg_calendar($_GET['clid']) || current_user_can('manage_options')) {
                        $calendar_id = $_GET['clid'];
                        if (!is_numeric($calendar_id)) {
                            $html = __('Error: invalid calendar ID', 'webba-booking-lite');
                            return $html;
                        }
                        $html = '';
                        $google = new WBK_Google();
                        $google->init($calendar_id);
                        $html .= '<h2>' . $google->get_calendar_name() . '</h2>';
                        if (isset($_GET['code'])) {
                            $auth_code = $_GET['code'];
                            $fetch_result = $google->process_auth_code($auth_code);
                        }
                        if (isset($_GET['action']) && $_GET['action'] == 'revoke' && !isset($_GET['code'])) {
                            $google->clearToken();
                        }
                        $html .= $google->render_calendar_block();
                    } else {
                        $html = __('Calendar not found', 'webba-booking-lite');
                    }
                    echo $html;
                } else {
                    if (current_user_can('manage_options')) {
                        WBK_Renderer::load_template('backend/react_app', [], true);
                    } else {
                        $user_id = get_current_user_id();
                        if ($user_id == 0) {
                            wp_die();
                            return;
                        }
                        $calendars = WBK_Model_Utils::get_gg_calendars_by_user($user_id);
                        $html = '';
                        foreach ($calendars as $calendar) {
                            $html .= '<h3>' . $calendar->name . '</h3>';
                            $html .= '<a target="_blank" class="slf_table_link" href="' . get_admin_url() . 'admin.php?page=wbk-gg-calendars&clid=' . $calendar->id . '">' . __('Manage authorization', 'webba-booking-lite') . '</a></br></br>';

                        }
                        echo $html;
                    }
                }
            } else {
                echo __('The Google Calendar API require PHP 5.4 or greater. Your version is ', 'webba-booking-lite') . PHP_VERSION;
            }
            break;
        case 'wbk-coupons':
            WBK_Renderer::load_template('backend/react_app', [], true);
            break;
        case 'wbk-pricing-rules':
            WBK_Renderer::load_template('backend/react_app', [], true);
            break;

        case 'wbk-options':
            if (isset($_GET['tools'])) {
                WBK_Renderer::load_template('backend/backend_page_header', array(__('Schedule tools', 'webba-booking-lite'), true));
                ?>
                <div style="padding:25px">
                    <?php
                    WBK_Renderer::load_template('backend/schedule_tools_content', array(), true);
                    ?>
                </div>
                <?php
            } else {
                $services = WBK_Model_Utils::get_service_ids();
                if (isset($_GET['wbk-activation'])) {
                    WBK_Renderer::load_template('backend/wizard_page', array());
                } else {
                    WBK_Renderer::load_template('backend/options_page', array());
                }
            }
            break;
        case 'wbk-form-builder':
            WBK_Renderer::load_template('backend/react_app', [], true);
            break;
        case 'wbk-appearance':
            WBK_Renderer::load_template('backend/appearance_page_content', array(), true);
            break;
        case 'wbk-dashboard':
            WBK_Renderer::load_template('backend/react_app', [], true);
            break;

        default:
            break;
    }
    WBK_Renderer::load_template('backend/go_premium_banner', array(), true);
    ?>
</div>