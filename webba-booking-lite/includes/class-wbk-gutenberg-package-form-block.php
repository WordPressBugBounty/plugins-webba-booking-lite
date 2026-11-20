<?php
if (!defined('ABSPATH')) {
    exit();
}

/**
 * Server render for the Webba package purchase Gutenberg block.
 */
class WBK_Gutenberg_Package_Form_Block
{
    /**
     * Renders the package purchase form.
     *
     * @param array    $attributes Block attributes.
     * @param string   $content    Inner blocks content.
     * @param WP_Block $block      Block instance.
     *
     * @return string
     */
    public static function render($attributes, $content, $block)
    {
        if (class_exists('WBK_Gutenberg_Booking_Form_Block')) {
            WBK_Gutenberg_Booking_Form_Block::enqueue_frontend_assets();
        }

        $appearance_attributes = is_array($attributes) ? $attributes : [];
        $inline_style = class_exists('WBK_Gutenberg_Booking_Form_Block')
            ? WBK_Gutenberg_Booking_Form_Block::build_appearance_inline_style($appearance_attributes)
            : '';
        $style_attr = $inline_style === '' ? '' : ' style="' . esc_attr($inline_style) . '"';

        $html = '<div class="wbk_package_form_scope"' . $style_attr . '>';
        if (class_exists('WBK_Renderer')) {
            $html .= WBK_Renderer::load_template('frontend_v6/packages', [], false);
        }
        $html .= '</div>';

        return $html;
    }
}
