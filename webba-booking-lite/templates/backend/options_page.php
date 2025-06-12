<?php
// check if accessed directly
if (!defined('ABSPATH'))
    exit;
date_default_timezone_set(get_option('wbk_timezone', 'UTC'));
global $wpdb;


?>
<div class="wrap">
    <div class="main-part-wrapper-wb">
        <?php
        WBK_Renderer::load_template('backend/backend_page_header', array(__('Settings', 'webba-booking-lite')));
        ?>
        <ul class="settings-list-wb">
            <?php if (function_exists('settings_errors')) {
                settings_errors();
            }

            global $wp_settings_sections, $wp_settings_fields;

            if (empty($wp_settings_sections['wbk-options']) || empty($wp_settings_fields['wbk-options'])) {
                return;
            }

            $settings_sections = $wp_settings_sections['wbk-options'];
            $settings_fields = $wp_settings_fields['wbk-options'];

            foreach ($settings_sections as $section) { ?>
                <li data-js="open-sidebar-wb" data-name="<?php echo $section['id']; ?>">
                    <div class="card-title-wb">
                        <span class="card-icon-wb">
                            <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/<?php echo $section['icon']; ?>.png"
                                alt="icons">
                        </span>
                        <span class="card-title-text-wb">
                            <?php echo $section['title']; ?>
                            <?php echo isset($section['pro']) ? '<span class="pro-wb">PRO</span>' : ''; ?>
                        </span>
                    </div>
                    <div class="view-settings-link-wb">
                        <span class="text-wb">
                            <?php echo esc_html__('View Settings', 'webba-booking-lite'); ?>
                        </span>
                        <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/arrow-right-custom-default-icon.png"
                            alt="->" class="default-icon-wb">
                        <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/arrow-right-custom-active-icon.png"
                            alt="->" class="hover-icon-wb">
                    </div>
                </li>
            <?php } ?>
        </ul>

        <div class="main-curtain-wb" data-js="main-curtain-wb" style="display: none;"></div>
        <div class="sidebar-roll-part-wrapper-wb">
            <?php foreach ($settings_fields as $section => $fields) { ?>
                <div class="sidebar-roll-wb" data-js="sidebar-roll-wb" data-name="<?php echo esc_attr($section); ?>">
                    <form action="" method="POST" class="wb-settings-fields-form">
                        <span class="close-button-wbkb" data-js="close-button-wbkb"><img
                                src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/close-icon2.png"
                                alt="close"></span>
                        <div class="sidebar-roll-title-wb">
                            <?php echo $settings_sections[$section]['title'] ?>
                        </div>
                        <div class="sidebar-roll-content-wb">
                            <div class="sidebar-roll-content-inner-wb" data-scrollbar="true" tabindex="-1"
                                style="overflow: hidden; outline: none;">
                                <div class="scroll-content">
                                    <div class="toggle-container-wb open-wb" data-js="toggle-container-wb">
                                        <div class="toggle-title-wb" data-js="toggle-title-wb">
                                            <?php echo esc_html__('Basic Settings', 'webba-booking-lite') ?>
                                        </div>
                                        <div class="toggle-content-wb" data-js="toggle-content-wb">
                                            <?php foreach ($fields as $field) {
                                                if ('basic' == $field['args']['subsection']) {
                                                    call_user_func($field['callback'], $field);
                                                }
                                            } ?>
                                        </div>
                                    </div>
                                    <hr class="fullwidth-wb">
                                    <div class="toggle-container-wb" data-js="toggle-container-wb">
                                        <div class="toggle-title-wb" data-js="toggle-title-wb">
                                            <?php echo esc_html__('Advanced Settings', 'webba-booking-lite') ?>
                                        </div>
                                        <div class="toggle-content-wb" data-js="toggle-content-wb">
                                            <?php foreach ($fields as $field) {
                                                if ('advanced' == $field['args']['subsection']) {
                                                    call_user_func($field['callback'], $field);
                                                }
                                            } ?>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="buttons-block-wb">
                            <input type="hidden" name="section" value="<?php echo esc_attr($section); ?>" />
                            <button type="button" data-js="close-button-wbkb" class="button-wbkb button-light-wb">
                                <?php echo esc_html__('Cancel', 'webba-booking-lite') ?>
                            </button>
                            <button type="submit" class="wb-save-options button-wbkb">
                                <?php echo esc_html__('Save', 'webba-booking-lite') ?><span class="btn-ring-wbk"></span>
                            </button>
                        </div>
                    </form>
                </div>
            <?php } ?>
        </div>
        <a class="button-wbkb" href="<?php echo get_admin_url() . 'admin.php?page=wbk-options&wbk-activation=true'; ?>">
            <?php echo __('Launch Setup Wizard', 'webba-booking-lite'); ?>
        </a>
    </div>

</div>
<?php
date_default_timezone_set('UTC');
?>