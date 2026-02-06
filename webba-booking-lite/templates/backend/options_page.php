<?php
// check if accessed directly
if (!defined('ABSPATH')) {
    exit();
}
date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
global $wpdb;

$wbk_advanced_settings_overlay_enabled = !WBK_Feature_Gate::have_required_plan(
    'premium',
    'only_old_users'
);
?>
<?php if ($wbk_advanced_settings_overlay_enabled) { ?>
<style>
    .sidebar-roll-wb[data-name="wbk_appointments_settings_section"] .toggle-container-wb.wbk_options_advanced .toggle-content-wb {
        position: relative;
    }
    .sidebar-roll-wb[data-name="wbk_appointments_settings_section"] .toggle-container-wb.wbk_options_advanced .wbk-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.7);
        z-index: 1000;
        pointer-events: none;
    }
    .sidebar-roll-wb[data-name="wbk_appointments_settings_section"] .toggle-container-wb.wbk_options_advanced .toggle-content-wb input,
    .sidebar-roll-wb[data-name="wbk_appointments_settings_section"] .toggle-container-wb.wbk_options_advanced .toggle-content-wb select,
    .sidebar-roll-wb[data-name="wbk_appointments_settings_section"] .toggle-container-wb.wbk_options_advanced .toggle-content-wb textarea,
    .sidebar-roll-wb[data-name="wbk_appointments_settings_section"] .toggle-container-wb.wbk_options_advanced .toggle-content-wb button,
    .sidebar-roll-wb[data-name="wbk_appointments_settings_section"] .toggle-container-wb.wbk_options_advanced .toggle-content-wb a,
    .sidebar-roll-wb[data-name="wbk_appointments_settings_section"] .toggle-container-wb.wbk_options_advanced .toggle-content-wb .slidebox-wb,
    .sidebar-roll-wb[data-name="wbk_appointments_settings_section"] .toggle-container-wb.wbk_options_advanced .toggle-content-wb .nice-select,
    .sidebar-roll-wb[data-name="wbk_appointments_settings_section"] .toggle-container-wb.wbk_options_advanced .toggle-content-wb .chosen-container {
        pointer-events: none;
        cursor: not-allowed;
        opacity: 0.6;
    }
    .sidebar-roll-wb[data-name="wbk_appointments_settings_section"] .toggle-container-wb.wbk_options_advanced .toggle-content-wb .plan-requirement-wb {
        position: relative;
        z-index: 1001;
        pointer-events: auto;
        cursor: pointer;
        opacity: 1;
    }
</style>
<?php } ?>
<div class="wrap">
    <div class="main-part-wrapper-wb">
        <?php WBK_Renderer::load_template('backend/backend_page_header', [
            __('Settings', 'webba-booking-lite'),
        ]); ?>
        <ul class="settings-list-wb">
            <?php
            if (function_exists('settings_errors')) {
                settings_errors();
            }
            global $wp_settings_sections, $wp_settings_fields;
            if (
                empty($wp_settings_sections['wbk-options']) ||
                empty($wp_settings_fields['wbk-options'])
            ) {
                return;
            }
            $settings_sections = $wp_settings_sections['wbk-options'];
            $settings_fields = $wp_settings_fields['wbk-options'];
            foreach ($settings_sections as $section) {
                $has_plan_restriction =
                    isset($section['pro']) &&
                    isset($section['minimal_plan']) &&
                    !WBK_Feature_Gate::have_required_plan(
                        $section['minimal_plan'],
                        null
                    ); ?>
                <li <?php echo !$has_plan_restriction
                    ? 'data-js="open-sidebar-wb"'
                    : ''; ?> data-name="<?php echo $section['id']; ?>">
                    <div class="card-title-wb">
                        <span class="card-icon-wb">
                            <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/<?php echo $section[
    'icon'
]; ?>.png"
                                alt="icons">
                        </span>
                        <span class="card-title-text-wb">
                            <?php echo $section['title']; ?>
                            <?php echo isset($section['pro'])
                                ? '<span class="pro-wb">PRO</span>'
                                : ''; ?>
                        </span>
                    </div>
                    <?php if ($has_plan_restriction) {
                        WBK_Renderer::load_template(
                            'backend/plan_requirement',
                            [$section['minimal_plan']],
                            true
                        );
                    } else {
                         ?>
                        <div class="view-settings-link-wb">
                            <span class="text-wb">
                                <?php echo esc_html__(
                                    'View Settings',
                                    'webba-booking-lite'
                                ); ?>
                            </span>
                            <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/arrow-right-custom-default-icon.png"
                                alt="->" class="default-icon-wb">
                            <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/arrow-right-custom-active-icon.png"
                                alt="->" class="hover-icon-wb">
                        </div>
                    <?php
                    } ?>
                </li>
            <?php
            }
            ?>
        </ul>

        <div class="main-curtain-wb" data-js="main-curtain-wb" style="display: none;"></div>
        <div class="sidebar-roll-part-wrapper-wb">
            <?php foreach ($settings_fields as $section => $fields) { ?>
                <div class="sidebar-roll-wb" data-js="sidebar-roll-wb" data-name="<?php echo esc_attr(
                    $section
                ); ?>">
                    <form action="" method="POST" class="wb-settings-fields-form">
                        <span class="close-button-wbkb" data-js="close-button-wbkb"><img
                                src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/close-icon2.png"
                                alt="close"></span>
                        <div class="sidebar-roll-title-wb">
                            <?php echo $settings_sections[$section]['title']; ?>
                        </div>
                        <div class="sidebar-roll-content-wb">
                            <div class="sidebar-roll-content-inner-wb" data-scrollbar="true" tabindex="-1"
                                style="overflow: hidden; outline: none;">
                                <div class="scroll-content">
                                    <div class="toggle-container-wb open-wb" data-js="toggle-container-wb">
                                        <div class="toggle-title-wb" data-js="toggle-title-wb">
                                            <?php echo esc_html__(
                                                'Basic Settings',
                                                'webba-booking-lite'
                                            ); ?>
                                        </div>
                                        <div class="toggle-content-wb" data-js="toggle-content-wb">
                                            <?php foreach ($fields as $field) {
                                                if (
                                                    'basic' ==
                                                    $field['args']['subsection']
                                                ) {
                                                    call_user_func(
                                                        $field['callback'],
                                                        $field
                                                    );
                                                }
                                            } ?>
                                        </div>
                                    </div>
                                    <hr class="fullwidth-wb">
                                    <div class="toggle-container-wb wbk_options_advanced"  data-js="toggle-container-wb">
                                        <div class="toggle-title-wb" data-js="toggle-title-wb">
                                            <?php echo esc_html__(
                                                'Advanced Settings',
                                                'webba-booking-lite'
                                            ); ?>
                                        </div>
                                        <div class="toggle-content-wb" data-js="toggle-content-wb">
                                            <?php if (
                                                $wbk_advanced_settings_overlay_enabled &&
                                                $section ===
                                                    'wbk_appointments_settings_section'
                                            ) { ?>
                                            <div class="wbk-overlay"></div>
                                            <?php WBK_Renderer::load_template(
                                                'backend/plan_requirement',
                                                ['premium'],
                                                true
                                            );} ?>
                                            <?php foreach ($fields as $field) {
                                                if (
                                                    'advanced' ==
                                                    $field['args']['subsection']
                                                ) {
                                                    call_user_func(
                                                        $field['callback'],
                                                        $field
                                                    );
                                                }
                                            } ?>
                                        </div>
                                    </div>
                                    <?php $hasSidebarSupportFields = false; ?>
                                    <?php foreach ($fields as $field) {
                                        if (
                                            'sidebar_support' ==
                                            $field['args']['subsection']
                                        ) {
                                            $hasSidebarSupportFields = true;
                                            break;
                                        }
                                    } ?>
                                    <?php if ($hasSidebarSupportFields) { ?>
                                    <hr class="fullwidth-wb">
                                    <div class="toggle-container-wb" data-js="toggle-container-wb">
                                        <div class="toggle-title-wb" data-js="toggle-title-wb">
                                            <?php echo esc_html__(
                                                'Sidebar Support Details',
                                                'webba-booking-lite'
                                            ); ?>
                                        </div>
                                        <div class="toggle-content-wb" data-js="toggle-content-wb">
                                            <?php foreach ($fields as $field) {
                                                if (
                                                    'sidebar_support' ==
                                                    $field['args']['subsection']
                                                ) {
                                                    call_user_func(
                                                        $field['callback'],
                                                        $field
                                                    );
                                                }
                                            } ?>
                                        </div>
                                    </div>
                                    <?php } ?>
                                </div>
                            </div>
                        </div>
                        <div class="buttons-block-wb">
                            <input type="hidden" name="section" value="<?php echo esc_attr(
                                $section
                            ); ?>" />
                            <button type="button" data-js="close-button-wbkb" class="button-wbkb button-light-wb">
                                <?php echo esc_html__(
                                    'Cancel',
                                    'webba-booking-lite'
                                ); ?>
                            </button>
                            <button type="submit" class="wb-save-options button-wbkb">
                                <?php echo esc_html__(
                                    'Save',
                                    'webba-booking-lite'
                                ); ?><span class="btn-ring-wbk"></span>
                            </button>
                        </div>
                    </form>
                </div>
            <?php } ?>
        </div>
        <a class="button-wbkb" href="<?php echo get_admin_url() .
            'admin.php?page=wbk-options&wbk-activation=true'; ?>">
            <?php echo __('Launch Setup Wizard', 'webba-booking-lite'); ?>
        </a>
    </div>

</div>
<?php date_default_timezone_set('UTC'); ?>
