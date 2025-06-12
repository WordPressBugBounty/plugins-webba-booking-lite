<?php
if (!defined('ABSPATH')) {
    exit();
}

/**
 * Class WBK_Renderer is used for rendering interface elements of the plugin
 */

class WBK_Renderer
{
    public function __construct()
    {
    }
    public static function load_template($template, $data, $echo = true)
    {
        $file_name =
            WP_WEBBA_BOOKING__PLUGIN_DIR .
            DIRECTORY_SEPARATOR .
            'templates' .
            DIRECTORY_SEPARATOR .
            $template .
            '.php';
        $file_name = apply_filters(
            'wbk_template_file',
            $file_name,
            $template,
            $data
        );

        ob_start();
        include $file_name;
        if ($echo) {
            echo ob_get_clean();
        } else {
            return ob_get_clean();
        }
    }
    public static function render_backend_page()
    {
        self::load_template('backend/backend_page', null);
    }
}

?>
