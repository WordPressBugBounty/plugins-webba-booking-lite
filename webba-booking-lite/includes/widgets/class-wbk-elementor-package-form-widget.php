<?php
if (!defined('ABSPATH')) {
    exit();
}

/**
 * Elementor widget for the package purchase form.
 */
class WBK_Elementor_Package_Form_Widget extends WBK_Elementor_Booking_Form_Widget
{
    /**
     * Returns internal widget name.
     *
     * @return string
     */
    public function get_name()
    {
        return 'wbk_package_form';
    }

    /**
     * Returns widget title.
     *
     * @return string
     */
    public function get_title()
    {
        return __('Webba Package Form', 'webba-booking-lite');
    }

    /**
     * Returns widget icon.
     *
     * @return string
     */
    public function get_icon()
    {
        return 'eicon-cart';
    }

    /**
     * Returns widget categories.
     *
     * @return array
     */
    public function get_categories()
    {
        return ['general'];
    }

    /**
     * Returns the wrapper class that receives appearance variables.
     *
     * @return string
     */
    protected function get_form_scope_class(): string
    {
        return 'wbk_elementor_package_form_scope';
    }

    /**
     * Returns the element that receives the form shadow control.
     *
     * @return string
     */
    protected function get_shadow_target_class(): string
    {
        return 'wbk_booking_form__body__wrapper';
    }

    /**
     * Registers appearance controls.
     *
     * @return void
     */
    protected function register_controls()
    {
        $this->register_appearance_style_controls([]);
    }

    /**
     * Renders the package purchase form.
     *
     * @return void
     */
    protected function render()
    {
        echo '<div class="' . esc_attr($this->get_form_scope_class()) . '">';

        if (class_exists('WBK_Renderer')) {
            echo WBK_Renderer::load_template('frontend_v6/packages', [], false);
        }

        echo '</div>';
    }
}
